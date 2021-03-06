import React, { Component } from 'react';
import { Text, TextInput, View, Image, TouchableOpacity, KeyboardAvoidingView, Alert, ScrollView,  } from 'react-native';
import { styles } from '../utils/Style';
import NetworkConnection from '../utils/NetworkConnection';
import DeviceInfo from 'react-native-device-info';
import MyRealm from '../utils/Realm';
import Icon from 'react-native-vector-icons/FontAwesome';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialComIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import OctiIcon from 'react-native-vector-icons/Octicons';
import Spinner from 'react-native-spinkit';
import ModalSelector from 'react-native-modal-selector';
import ImagePicker from 'react-native-image-picker';

let myApiUrl = 'http://courierlabapi.azurewebsites.net/api/v1/MobileApi';
let updateLorryPath = 'UpdateLorry';
let getLorryTypePath = 'GetLorryType';
let getLorryWeightLengthPath = 'GetLorryWeightLengthbyLorryTypeId';
let deviceId = DeviceInfo.getUniqueID();
let realm = new MyRealm();
let loginAsset = realm.objects('LoginAsset');

export default class UpdateLorry extends Component{
    static navigationOptions = {
        // title: 'Update Lorry',
        headerTitle: <View style={{flexDirection: 'row',}}>
                <FeatherIcon name="truck" size={19} color="#fff" style={{paddingLeft: 10, paddingRight: 10,}}/>
                <Text style={{color: '#fff', fontWeight: 'bold', fontFamily: 'AvenirLTStd-Black', fontSize: 15, paddingTop: 3,}}>Update Lorry</Text>
            </View>,
    }

    constructor(props){
        super(props);
        this.state = {
            lorryTypeList: [],
            selectedLorryType: '',
            selectedLorryTypeId: 0,
            // lorryWeightList: [],
            // selectedLorryWeight: 0.0,
            // selectedLorryWeightId: 0,
            // lorryLengthList: [],
            // selectedLorryLength: 0.0,
            // selectedLorryLengthId: 0,
            lorryName: '',
            lorryPlateNumber: '',
            lorryColor: '',
            lorryImage: '',
            spinnerVisible: false,
            isClicked: false,
        }
    }

    componentDidMount() {
        setTimeout(() => {
            this.checkInternetConnection();
        }, 500);
        this.getLorryType()
        this.getMyLorryInfo()
    }

    async checkInternetConnection() {
        if (this.state.isAlertShown) {
            return;
        }

        let result = await NetworkConnection.check();

        if (!result) {
            this.alertInternet();
        }
    }

    disableAlertAndCheckInternetConnection() {
        this.setState({isAlertShown: false});
        this.checkInternetConnection();
    }

    alertInternet() {
        this.setState({isAlertShown: true});
        Alert.alert('Unable to access internet', 'Please check your internet connectivity and try again', [
        {
            text: 'OK',
            onPress: () => this.disableAlertAndCheckInternetConnection()
        }], {cancelable: false})
    }

    getMyLorryInfo(){
        this.setState({
            selectedLorryTypeId: loginAsset[0].lorryTypeId,
            selectedLorryType: loginAsset[0].lorryTypeName,
            // selectedLorryWeight: loginAsset[0].lorryWeigthAmount,
            // selectedLorryWeightId: loginAsset[0].lorryWeightId,
            // selectedLorryLength: loginAsset[0].lorryLengthAmount,
            // selectedLorryLengthId: loginAsset[0].lorryLengthId,
            lorryName: loginAsset[0].lorryName,
            lorryPlateNumber: loginAsset[0].lorryPlateNumber,
            lorryColor: loginAsset[0].lorryColor,
            lorryImage: loginAsset[0].lorryImage,
        })
    }

    getLorryType(){
        fetch(`${myApiUrl}/${getLorryTypePath}?deviceId=` + deviceId + `&userId=` + loginAsset[0].userId, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': loginAsset[0].accessToken,
            },
        })
        .then((response) => response.json())
        .then((json) => {
            if(json.succeeded){
                this.setState({
                    lorryTypeList: json.results,
                });
            } 
        }).catch(err => {
            console.log(err);
        });
    }

    // getLorryWeightLength(lorryTypeId){
    //     fetch(`${myApiUrl}/${getLorryWeightLengthPath}?deviceId=` + deviceId + `&userId=` + loginAsset[0].userId + `&lorryTypeId=` + lorryTypeId, {
    //         method: 'GET',
    //         headers: {
    //             'Accept': 'application/json',
    //             'Content-Type': 'application/json',
    //             'Authorization': loginAsset[0].accessToken,
    //         },
    //     })
    //     .then((response) => response.json())
    //     .then((json) => {
    //         console.log('weight length: ', json.results)
    //         if(json.succeeded){
    //             this.setState({
    //                 lorryWeightList: json.results.lorryWeight,
    //                 lorryLengthList: json.results.lorryLength,
    //             });
    //         } 
    //     }).catch(err => {
    //         console.log(err);
    //     });
    // }

    openImage(){
        const options = {
            title: 'Select Image',
            storageOptions: {
                skipBackup: true,
                path: 'images',
            },
        };

        ImagePicker.showImagePicker(options, (response) => {
            if (response.didCancel) {
                this.setState({
                    lorryImage: "",
                });
            }else if (response.error) {
                this.setState({
                    lorryImage: "",
                });
            }else {
                const source = response.uri;
                this.setState({
                    lorryImage: source,
                });
            }
        });
        console.log('image: ', this.state.lorryImage)
    }

    updateLorry(e){
        this.setState({
            spinnerVisible: true,
            isClicked: true,
        })

        // if(this.state.selectedLorryType === "" || this.state.selectedLorryWeight === "" || this.state.selectedLorryLength == "" || this.state.lorryName === "" || this.state.lorryPlateNumber === "" || this.state.lorryColor === "" || this.state.lorryImage === ""){
        if(this.state.selectedLorryType === "" || this.state.lorryName === "" || this.state.lorryPlateNumber === "" || this.state.lorryColor === "" || this.state.lorryImage === ""){
            Alert.alert('Cannot Update', 'Please key in Lorry Type, Lorry Name, Lorry Plate Number, Lorry Color and Lorry Image.', [{
                text: 'OK',
                onPress: () => {
                    this.setState({
                        spinnerVisible: false,
                        isClicked: false,
                    })
                },
            }], {cancelable: false});
        }else{
            var bodyData = new FormData();
            bodyData.append('lorryName', this.state.lorryName);
            bodyData.append('lorryPlateNumber', this.state.lorryPlateNumber);
            bodyData.append('lorryColor', this.state.lorryColor);
            bodyData.append('lorryTypeId', this.state.selectedLorryTypeId);
            // bodyData.append('lorryWeightId', this.state.selectedLorryWeightId);
            // bodyData.append('lorryLengthId', this.state.selectedLorryLengthId);
            bodyData.append('driverId', loginAsset[0].loginUserId);
            bodyData.append('deviceId', deviceId);
            bodyData.append('userId', loginAsset[0].userId);
            bodyData.append('lorryId', loginAsset[0].lorryId);
            bodyData.append('lorryImage', { uri: this.state.lorryImage, name: 'lorryImage', type: 'image/jpeg' });
            console.log(bodyData);
            fetch(`${myApiUrl}/${updateLorryPath}`, {
                method: 'POST',
                headers: {
                    // 'Accept': 'application/json',
                    'Content-Type': 'multipart/form-data',
                    'Authorization': loginAsset[0].accessToken,
                },
                body: bodyData,
            })
            .then((response) => response.json())
            .then((json) => {
                console.log(json);
                if(json.succeeded){
                    this.setState({
                        spinnerVisible: false,
                        isClicked: false,
                    })
                    realm.write(() => {
                        loginAsset[0].lorryTypeName = json.results.lorryTypeName,
                        // loginAsset[0].lorryWeigthAmount = json.results.lorryWeightAmount,
                        // loginAsset[0].lorryWeightId = json.results.lorryWeightId,
                        // loginAsset[0].lorryLengthAmount = json.results.lorryLengthAmount,
                        // loginAsset[0].lorryLengthId = json.results.lorryLengthId,
                        loginAsset[0].lorryName = json.results.lorryName,
                        loginAsset[0].lorryPlateNumber = json.results.lorryPlateNumber,
                        loginAsset[0].lorryColor = json.results.lorryColor,
                        loginAsset[0].lorryImage = json.results.lorryImage
                    })
                    Alert.alert('Successfully Updated', json.message, [{
                        text: 'OK',
                        onPress: () => {
                            this.props.navigation.state.params.rerenderFunction();
                            this.props.navigation.goBack();
                        },
                    }], {cancelable: false});
                }else{
                    Alert.alert('Cannot Update', json.message, [{
                        text: 'OK',
                        onPress: () => {
                            this.setState({
                                spinnerVisible: false,
                                isClicked: false,
                            })
                        },
                    }], {cancelable: false});
                }
            }).catch(err => {
                console.log(err);
                this.setState({
                    spinnerVisible: false,
                    isClicked: false,
                })
            })
            e.preventDefault();
        }
    }

    render(){
        let spinnerView = this.state.isClicked ? <View style={{alignItems: 'center', paddingBottom: 10, marginTop: 20,}}> 
                    <Spinner
                        isVisible={this.state.spinnerVisible}
                        type={'ThreeBounce'}
                        color='#F4D549'
                        size={30}/>
                </View> : <View/>;
        return(
            <KeyboardAvoidingView style={{flex: 1, backgroundColor: '#fff', paddingLeft: 20, paddingRight: 20, paddingBottom: 20, paddingTop: 0,}}>
                <ScrollView style={{ paddingTop: 20,}} ref={ref => this.scrollView = ref}
                    onContentSizeChange={(contentWidth, contentHeight)=>{
                        if(this.state.isClicked){
                            this.scrollView.scrollToEnd({animated: true});
                        }
                    }}>
                    <View>
                        <View style={{margin: 0, paddingLeft: 15, paddingRight: 15, paddingTop: 20, paddingBottom: 20, backgroundColor: '#EFEFEF', borderRadius: 20,}}>
                            <View style={{flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginTop: -20, marginBottom: -10, }}>
                                <Image resizeMode='contain' style={{width: '10%',}} source={require('../assets/shipper.png')} />
                                <Text style={{fontSize: 18, alignItems: 'center', textAlign: 'center', fontFamily: 'AvenirLTStd-Roman', color: '#2C2E6D', paddingLeft: 10,}}>Lorry Information</Text>
                            </View>
                            <View>
                                <Text style={{paddingLeft: 0, paddingTop: 10, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'AvenirLTStd-Heavy',}}>Lorry Type</Text>
                                <ModalSelector
                                    data={this.state.lorryTypeList}
                                    supportedOrientations={['portrait']}
                                    keyExtractor= {item => item.lorryTypeId}
                                    labelExtractor= {item => item.lorryTypeName}
                                    accessible={true}
                                    scrollViewAccessibilityLabel={'Scrollable options'}
                                    cancelButtonAccessibilityLabel={'Cancel Button'}
                                    onChange={(option)=>{ 
                                        this.setState({
                                            selectedLorryType: option.lorryTypeName,
                                            selectedLorryTypeId: option.lorryTypeId,
                                            // selectedLorryWeight: '',
                                            // selectedLorryLength: '',
                                        })
                                        // this.getLorryWeightLength(option.lorryTypeId) 
                                    }}>
                                    <TextInput
                                        style={{fontSize: 14, fontFamily: 'AvenirLTStd-Roman', color: '#3c4c96', borderColor: '#A3A9C4', borderWidth: 1, height: 40, paddingLeft: 10, paddingRight: 10,}}
                                        editable={false}
                                        placeholder='Select Lorry Type'
                                        underlineColorAndroid={'transparent'}
                                        placeholderTextColor='#A3A9C4'
                                        value={this.state.selectedLorryType}/>
                                </ModalSelector>
                            </View>
                            <View>
                                <Text style={{paddingLeft: 0, paddingTop: 10, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'AvenirLTStd-Heavy',}}>Lorry Name</Text>
                                <TextInput
                                    style={{fontSize: 14, fontFamily: 'AvenirLTStd-Roman', color: '#3c4c96', borderColor: '#A3A9C4', borderWidth: 1, height: 40, paddingLeft: 10, paddingRight: 10,}}
                                    autoCapitalize="none"
                                    underlineColorAndroid={'transparent'}
                                    autoCorrect={false}
                                    keyboardType='default'
                                    returnKeyLabel="next"
                                    placeholder='Lorry Name'
                                    placeholderTextColor='#A3A9C4'
                                    value={this.state.lorryName}
                                    onChangeText={(text) => this.setState({ lorryName: text })}  />
                            </View>
                            <View>
                                <Text style={{paddingLeft: 0, paddingTop: 10, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'AvenirLTStd-Heavy',}}>Lorry Plate Number</Text>
                                <TextInput
                                    style={{fontSize: 14, fontFamily: 'AvenirLTStd-Roman', color: '#3c4c96', borderColor: '#A3A9C4', borderWidth: 1, height: 40, paddingLeft: 10, paddingRight: 10,}}
                                    autoCapitalize="none"
                                    underlineColorAndroid={'transparent'}
                                    autoCorrect={false}
                                    keyboardType='default'
                                    returnKeyLabel="next"
                                    placeholder='Lorry Plate Number'
                                    placeholderTextColor='#A3A9C4'
                                    value={this.state.lorryPlateNumber}
                                    onChangeText={(text) => this.setState({ lorryPlateNumber: text })}  />
                            </View>
                            <View>
                                <Text style={{paddingLeft: 0, paddingTop: 10, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'AvenirLTStd-Heavy',}}>Lorry Color</Text>
                                <TextInput
                                    style={{fontSize: 14, fontFamily: 'AvenirLTStd-Roman', color: '#3c4c96', borderColor: '#A3A9C4', borderWidth: 1, height: 40, paddingLeft: 10, paddingRight: 10,}}
                                    autoCapitalize="none"
                                    underlineColorAndroid={'transparent'}
                                    autoCorrect={false}
                                    keyboardType='default'
                                    returnKeyLabel="next"
                                    placeholder='Lorry Color'
                                    placeholderTextColor='#A3A9C4'
                                    value={this.state.lorryColor}
                                    onChangeText={(text) => this.setState({ lorryColor: text })}  />
                            </View>
                            <View style={{paddingLeft: 0, paddingRight: 0, paddingTop: 0, }}>
                                <Text style={{paddingLeft: 0, paddingTop: 10, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'AvenirLTStd-Heavy',}}>Lorry Image</Text>
                                <View style={{flexDirection: 'row',}}>
                                    {
                                        (this.state.lorryImage !== "") ? <View style={{flexDirection: 'row',}}>
                                            <Image resizeMode="cover" source={{ uri: this.state.lorryImage }} style={{width: 40, height: 30, marginLeft: 0, marginRight: 0,}} /> 
                                            <TouchableOpacity
                                                style={{backgroundColor: '#F2BB45', marginLeft: 10, marginRight: 10, marginBottom: 0, marginTop: 0, paddingVertical: 10, width: 150, }}
                                                onPress={(e) => this.openImage()}>
                                                <Text style={{color: '#fff', textAlign: 'center', fontSize: 15, fontFamily: 'AvenirLTStd-Medium',}}>Choose Image</Text>
                                            </TouchableOpacity>
                                        </View> 
                                        : <TouchableOpacity
                                            style={{backgroundColor: '#F2BB45', marginLeft: 0, marginRight: 0, marginBottom: 0, marginTop: 0, paddingVertical: 10, width: 150,}}
                                            onPress={(e) => this.openImage()}>
                                            <Text style={{color: '#fff', textAlign: 'center', fontSize: 15, fontFamily: 'AvenirLTStd-Medium',}}>Choose Image</Text>
                                        </TouchableOpacity>
                                    }
                                </View>
                            </View>
                        </View>


                        {/* <View>
                            <Text style={{paddingLeft: 20, paddingTop: 20, paddingBottom: 5, paddingRight: 20, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Lorry Type: </Text>
                            <ModalSelector
                                data={this.state.lorryTypeList}
                                supportedOrientations={['portrait']}
                                keyExtractor= {item => item.lorryTypeId}
                                labelExtractor= {item => item.lorryTypeName}
                                accessible={true}
                                scrollViewAccessibilityLabel={'Scrollable options'}
                                cancelButtonAccessibilityLabel={'Cancel Button'}
                                onChange={(option)=>{ 
                                    this.setState({
                                        selectedLorryType: option.lorryTypeName,
                                        selectedLorryTypeId: option.lorryTypeId,
                                        // selectedLorryWeight: '',
                                        // selectedLorryLength: '',
                                    })
                                    // this.getLorryWeightLength(option.lorryTypeId) 
                                }}>
                                <TextInput
                                    style={{height: 50, backgroundColor: '#fff', marginBottom: 10, padding: 10, color: '#3c4c96', fontSize: 20, borderColor: '#3c4c96', borderWidth: 1, marginLeft: 15, marginRight: 15, fontFamily: 'Raleway-Bold',}}
                                    editable={false}
                                    placeholder='Select Lorry Type'
                                    underlineColorAndroid={'transparent'}
                                    placeholderTextColor='#939ABA'
                                    value={this.state.selectedLorryType}/>
                            </ModalSelector>
                        </View>
                        <View style={{paddingLeft: 15, paddingRight: 15,}}>
                            <Text style={{paddingLeft: 0, paddingTop: 5, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Lorry Name: </Text>
                            <TextInput
                                style={{height: 50, backgroundColor: '#fff', marginBottom: 10, padding: 10, color: '#3c4c96', fontSize: 20, borderColor: '#3c4c96', borderWidth: 1, fontFamily: 'Raleway-Bold',}}
                                autoCapitalize="none"
                                underlineColorAndroid={'transparent'}
                                autoCorrect={false}
                                keyboardType='default'
                                placeholder='Enter Lorry Name'
                                placeholderTextColor='#939ABA'
                                value={this.state.lorryName}
                                onChangeText={(text) => this.setState({ lorryName: text })}  />
                        </View>
                        <View style={{paddingLeft: 15, paddingRight: 15,}}>
                            <Text style={{paddingLeft: 0, paddingTop: 5, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Lorry Plate Number: </Text>
                            <TextInput
                                style={{height: 50, backgroundColor: '#fff', marginBottom: 10, padding: 10, color: '#3c4c96', fontSize: 20, borderColor: '#3c4c96', borderWidth: 1, fontFamily: 'Raleway-Bold',}}
                                autoCapitalize="none"
                                underlineColorAndroid={'transparent'}
                                autoCorrect={false}
                                keyboardType='default'
                                placeholder='Enter Lorry Plate Number'
                                placeholderTextColor='#939ABA'
                                value={this.state.lorryPlateNumber}
                                onChangeText={(text) => this.setState({ lorryPlateNumber: text })}  />
                        </View>
                        <View style={{paddingLeft: 15, paddingRight: 15,}}>
                            <Text style={{paddingLeft: 0, paddingTop: 5, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Lorry Color: </Text>
                            <TextInput
                                style={{height: 50, backgroundColor: '#fff', marginBottom: 10, padding: 10, color: '#3c4c96', fontSize: 20, borderColor: '#3c4c96', borderWidth: 1, fontFamily: 'Raleway-Bold',}}
                                autoCapitalize="none"
                                underlineColorAndroid={'transparent'}
                                autoCorrect={false}
                                keyboardType='default'
                                placeholder='Enter Lorry Color'
                                placeholderTextColor='#939ABA'
                                value={this.state.lorryColor}
                                onChangeText={(text) => this.setState({ lorryColor: text })}  />
                        </View>
                        <View style={{paddingLeft: 15, paddingRight: 15,}}>
                            <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Lorry Image: </Text>
                            <View style={{flexDirection: 'row',}}>
                                {
                                    (this.state.lorryImage !== "") ? <View style={{flexDirection: 'row',}}>
                                        <Image resizeMode="cover" source={{ uri: this.state.lorryImage }} style={{width: 50, height: 40, marginLeft: 5, marginRight: 0,}} /> 
                                        <TouchableOpacity
                                            style={{backgroundColor: '#3c4c96', marginLeft: 20, marginRight: 20, marginBottom: 5, marginTop: 0, paddingVertical: 10, width: 150, }}
                                            onPress={(e) => this.openImage()}>
                                            <Text style={{color: '#fff', textAlign: 'center', fontWeight: '700', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Choose Image</Text>
                                        </TouchableOpacity>
                                    </View>
                                    : <TouchableOpacity
                                        style={{backgroundColor: '#3c4c96', marginLeft: 0, marginRight: 0, marginBottom: 5, marginTop: 0, paddingVertical: 10, width: 150,}}
                                        onPress={(e) => this.openImage()}>
                                        <Text style={{color: '#fff', textAlign: 'center', fontWeight: '700', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Choose Image</Text>
                                    </TouchableOpacity>
                                }
                            </View>
                        </View> */}
                        {spinnerView}
                    </View>
                    {/* <View style={{paddingTop: 10, paddingLeft: 15, paddingRight: 15, paddingBottom: 40,}}>
                        <TouchableOpacity
                            style={styles.buttonContainer}
                            onPress={(e) => this.updateLorry(e)}>
                            <Text style={styles.buttonText}>Update Lorry</Text>
                        </TouchableOpacity>
                    </View> */}
                    <View style={this.state.isClicked ? {backgroundColor: '#F4D549', borderRadius: 20, paddingLeft: 10, paddingRight: 10, marginLeft: 0, marginRight: 0, marginBottom: 20, marginTop: 20,} : {backgroundColor: '#2C2E6D', borderRadius: 20, paddingLeft: 10, paddingRight: 10, marginLeft: 0, marginRight: 0, marginBottom: 20, marginTop: 20,}}>
                        <TouchableOpacity
                            disabled={this.state.isClicked}
                            style={this.state.isClicked ? {backgroundColor: '#F4D549', borderRadius: 20, paddingVertical: 15,} : styles.buttonContainer}
                            onPress={(e) => this.updateLorry(e)}>
                            <Text style={this.state.isClicked ? {color: '#2C2E6D', textAlign: 'center', fontSize: 16, fontFamily: 'AvenirLTStd-Black',} : {color: '#fff', textAlign: 'center', fontSize: 16, fontFamily: 'AvenirLTStd-Black',}}>Update Lorry</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        )
    }
}
