import React, { Component } from 'react';
import { Text, TextInput, View, Image, TouchableOpacity, KeyboardAvoidingView, Alert, ScrollView, ImageBackground, Animated, UIManager, Dimensions, Keyboard, Platform, } from 'react-native';
import { styles } from '../utils/Style';
import NetworkConnection from '../utils/NetworkConnection';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialComIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import FeatherIcon from 'react-native-vector-icons/Feather';
import DeviceInfo from 'react-native-device-info';
import MyRealm from '../utils/Realm';
import Spinner from 'react-native-spinkit';
import { connect } from 'react-redux';
import { login, logout } from '../utils/Actions';
import ModalSelector from 'react-native-modal-selector';
import ImagePicker from 'react-native-image-picker';

let myApiUrl = 'http://courierlabapi.azurewebsites.net/api/v1/MobileApi';
let updateLorryPath = 'UpdateLorry';
let getLorryTypePath = 'GetLorryType';
let getLorryWeightLengthPath = 'GetLorryWeightLengthbyLorryTypeId';
let deviceId = DeviceInfo.getUniqueID();
let realm = new MyRealm();
let loginAsset = realm.objects('LoginAsset');

const { State: TextInputState } = TextInput;

class UpdateLorryFirst extends Component{
    static navigationOptions = {
        // title: 'Update Lorry',
        headerLeft: <View style={{flex: 1, top: 0, position: 'absolute', justifyContent: 'flex-start', alignContent: 'flex-start',}}>
            <TouchableOpacity
                style={{flexDirection: 'row',}}
                onPress={() => _this.props.navigation.goBack()}>
                <Icon name={'angle-left'} size={35} color={'#fff'} style={{paddingRight: 10, paddingLeft: 10, }}/>
                <Text style={{color: '#fff', paddingTop: 10, textAlign: 'center', fontSize: 18, fontFamily: 'AvenirLTStd-Roman',}}>Login</Text>
            </TouchableOpacity>
        </View>,
        headerBackground: <View>
            <ImageBackground source={require('../assets/smallBackground.png')} style={{width: '100%', height: '100%', justifyContent: 'center', }}>
                <View style={[{padding: 20, alignItems: 'center', justifyContent: 'center',}]}>
                    <Image resizeMode="contain" style={{ position: 'absolute', width: 150,}} source={require('../assets/updateLorry.png')} />
                </View>
            </ImageBackground>
        </View>
    }

    constructor(props){
        super(props);
        this.state = {
            lorryTypeList: [],
            selectedLorryType: '',
            selectedLorryTypeId: 0,
            // lorryWeightList: [],
            // selectedLorryWeight: '',
            // selectedLorryWeightId: 0,
            // lorryLengthList: [],
            // selectedLorryLength: '',
            // selectedLorryLengthId: 0,
            lorryName: '',
            lorryPlateNumber: '',
            lorryColor: '',
            lorryImage: '',
            spinnerVisible: false,
            isClicked: false,
            shift: new Animated.Value(0),
        }
        _this = this;
    }

    componentDidMount() {
        setTimeout(() => {
            this.checkInternetConnection();
        }, 500);
        this.getLorryType()
    }

    componentWillMount(){
        this.keyboardDidShowSub = Keyboard.addListener('keyboardDidShow', this.handleKeyboardDidShow);
        this.keyboardDidHideSub = Keyboard.addListener('keyboardDidHide', this.handleKeyboardDidHide);
    }

    componentWillUnmount() {
        this.keyboardDidShowSub.remove();
        this.keyboardDidHideSub.remove();
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

    getLorryType(){
        fetch(`${myApiUrl}/${getLorryTypePath}?deviceId=` + deviceId + `&userId=` + this.props.navigation.getParam('userId'), {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': this.props.navigation.getParam('accessToken'),
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
    //     fetch(`${myApiUrl}/${getLorryWeightLengthPath}?deviceId=` + deviceId + `&userId=` + this.props.navigation.getParam('userId') + `&lorryTypeId=` + lorryTypeId, {
    //         method: 'GET',
    //         headers: {
    //             'Accept': 'application/json',
    //             'Content-Type': 'application/json',
    //             'Authorization': this.props.navigation.getParam('accessToken'),
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
            bodyData.append('driverId', this.props.navigation.getParam('loginUserId'));
            bodyData.append('deviceId', deviceId);
            bodyData.append('userId', this.props.navigation.getParam('userId'));
            bodyData.append('lorryImage', { uri: this.state.lorryImage, name: 'lorryImage', type: 'image/jpeg' });
            console.log(bodyData);
            fetch(`${myApiUrl}/${updateLorryPath}`, {
                method: 'POST',
                headers: {
                    // 'Accept': 'application/json',
                    'Content-Type': 'multipart/form-data',
                    'Authorization': this.props.navigation.getParam('accessToken'),
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
                        realm.create('LoginAsset', {
                            userId: this.props.navigation.getParam('userId'),
                            accessToken: this.props.navigation.getParam('accessToken').toString(),
                            accessTokenExpiredDate: this.props.navigation.getParam('accessTokenExpiredDate').toString(),
                            refreshToken: this.props.navigation.getParam('refreshToken').toString(),
                            roleId: this.props.navigation.getParam('roleId'),
                            roleName: this.props.navigation.getParam('roleName').toString(),
                            email: this.props.navigation.getParam('email').toString(),
                            loginUserId: this.props.navigation.getParam('loginUserId'),
                            loginUserName: this.props.navigation.getParam('loginUserName').toString(),
                            loginUserNRIC: this.props.navigation.getParam('loginUserNRIC').toString(),
                            loginUserPhoneNumber: this.props.navigation.getParam('loginUserPhoneNumber').toString(),
                            loginUserAddress: '',
                            loginUserState: '',
                            loginUserPostcode: 0,
                            lorryId: json.results.lorryId,
                            lorryColor: json.results.lorryColor,
                            lorryImage: json.results.lorryImage,
                            // lorryLengthId: json.results.lorryLengthId,
                            // lorryLengthAmount: json.results.lorryLengthAmount,
                            lorryName: json.results.lorryName,
                            lorryPlateNumber: json.results.lorryPlateNumber,
                            lorryTypeId: json.results.lorryTypeId,
                            lorryTypeName: json.results.lorryTypeName,
                            // lorryWeightId: json.results.lorryWeightId,
                            // lorryWeigthAmount: json.results.lorryWeightAmount,
                            bankId: this.props.navigation.getParam('bankId'),
                            bankName: this.props.navigation.getParam('bankName').toString(),
                            bankAccountNumber: this.props.navigation.getParam('bankAccountNumber').toString(),
                            driverImage: this.props.navigation.getParam('driverImage').toString(),
                        })
                    })
                    Alert.alert('Successfully Updated', json.message, [{
                        text: 'OK',
                        onPress: () => {
                            this.props.onLogin(this.props.navigation.getParam('email'));
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

    handleKeyboardDidShow = (event) => {
        const { height: windowHeight } = Dimensions.get('window');
        const keyboardHeight = event.endCoordinates.height;
        const currentlyFocusedField = TextInputState.currentlyFocusedField();
        UIManager.measure(currentlyFocusedField, (originX, originY, width, height, pageX, pageY) => {
            const fieldHeight = height;
            const fieldTop = pageY;
            const gap = (windowHeight - keyboardHeight) - (fieldTop + fieldHeight);
            if (gap >= 0) {
                return;
            }
            Animated.timing(
                this.state.shift,
                {
                    toValue: gap,
                    duration: 1000,
                    useNativeDriver: true,
                }
            ).start();
        });
    }
    
    handleKeyboardDidHide = () => {
        Animated.timing(
            this.state.shift,
            {
                toValue: 0,
                duration: 1000,
                useNativeDriver: true,
            }
        ).start();
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
                (Platform.OS === 'ios') ? <KeyboardAvoidingView style={{flex: 1, backgroundColor: '#fff',}}>
                    <ScrollView style={this.state.isClicked ? {backgroundColor: '#F4D549', } : {backgroundColor: '#2C2E6D', }} contentContainerStyle={{flexGrow: 1,}}
                        ref={ref => this.scrollView = ref}
                        onContentSizeChange={(contentWidth, contentHeight)=>{
                            if(this.state.isClicked){
                                this.scrollView.scrollToEnd({animated: true});
                            }else{
                                this.scrollView.scrollTo({x: 0, y: 0, animated: true});
                            }
                        }}>
                        <Animated.View style={{flex: 1, borderBottomLeftRadius: 40, borderBottomRightRadius: 40, backgroundColor: '#fff', transform: [{translateY: this.state.shift}]}}> 
                        {/* <View> */}
                        <Text style={{paddingBottom: 10, paddingTop: 20, fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', paddingLeft: 20, paddingRight: 20,}}>NOTE: Please add your lorry information for first time setup.</Text>
                            <View style={{ borderBottomColor: '#9B9B9B', borderBottomWidth: 1, borderTopColor: '#9B9B9B', borderTopWidth: 1,  flexDirection: 'row', padding: 25,}}>
                                {/* <Text style={{paddingLeft: 20, paddingTop: 5, paddingBottom: 5, paddingRight: 20, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Lorry Type: </Text> */}
                                <FeatherIcon name="truck" size={19} color="#9B9B9B" style={{paddingLeft: 10, paddingRight: 5,}}/>
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
                                        style={{color: '#2C2E6D', fontFamily: 'AvenirLTStd-Medium', fontSize: 16, paddingLeft: 10,}}
                                        editable={false}
                                        placeholder='Lorry Type'
                                        underlineColorAndroid={'transparent'}
                                        placeholderTextColor='#9B9B9B'
                                        value={this.state.selectedLorryType}/>
                                </ModalSelector>
                            </View>
                            {/* <View>
                                <Text style={{paddingLeft: 20, paddingTop: 5, paddingBottom: 5, paddingRight: 20, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Lorry Weight (KG): </Text>
                                <ModalSelector
                                    data={this.state.lorryWeightList}
                                    supportedOrientations={['portrait']}
                                    keyExtractor= {item => item.lorryWeightId}
                                    labelExtractor= {item => item.lorryWeightAmount}
                                    accessible={true}
                                    scrollViewAccessibilityLabel={'Scrollable options'}
                                    cancelButtonAccessibilityLabel={'Cancel Button'}
                                    onChange={(option)=>{ 
                                        this.setState({
                                            selectedLorryWeight: option.lorryWeightAmount.toString(),
                                            selectedLorryWeightId: option.lorryWeightId
                                        })
                                    }}>
                                    <TextInput
                                        style={{height: 50, backgroundColor: '#fff', marginBottom: 10, padding: 10, color: '#3c4c96', fontSize: 20, borderColor: '#3c4c96', borderWidth: 1, marginLeft: 15, marginRight: 15, fontFamily: 'Raleway-Bold',}}
                                        editable={false}
                                        placeholder='Select Lorry Weight'
                                        underlineColorAndroid={'transparent'}
                                        placeholderTextColor='#939ABA'
                                        value={this.state.selectedLorryWeight}/>
                                </ModalSelector>
                            </View>
                            <View>
                                <Text style={{paddingLeft: 20, paddingTop: 5, paddingBottom: 5, paddingRight: 20, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Lorry Length (m): </Text>
                                <ModalSelector
                                    data={this.state.lorryLengthList}
                                    supportedOrientations={['portrait']}
                                    keyExtractor= {item => item.lorryLengthId}
                                    labelExtractor= {item => item.lorryLengthAmount}
                                    accessible={true}
                                    scrollViewAccessibilityLabel={'Scrollable options'}
                                    cancelButtonAccessibilityLabel={'Cancel Button'}
                                    onChange={(option)=>{ 
                                        this.setState({
                                            selectedLorryLength: option.lorryLengthAmount.toString(),
                                            selectedLorryLengthId: option.lorryLengthId,
                                        })
                                    }}>
                                    <TextInput
                                        style={{height: 50, backgroundColor: '#fff', marginBottom: 10, padding: 10, color: '#3c4c96', fontSize: 20, borderColor: '#3c4c96', borderWidth: 1, marginLeft: 15, marginRight: 15, fontFamily: 'Raleway-Bold',}}
                                        editable={false}
                                        placeholder='Select Lorry Length'
                                        underlineColorAndroid={'transparent'}
                                        placeholderTextColor='#939ABA'
                                        value={this.state.selectedLorryLength}/>
                                </ModalSelector>
                            </View> */}
                            <View style={{ borderBottomColor: '#9B9B9B', borderBottomWidth: 1, flexDirection: 'row', padding: 25,}}>
                                {/* <Text style={{paddingLeft: 0, paddingTop: 5, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Lorry Name: </Text>
                                <TextInput
                                    style={{height: 50, backgroundColor: '#fff', marginBottom: 10, padding: 10, color: '#3c4c96', fontSize: 20, borderColor: '#3c4c96', borderWidth: 1, fontFamily: 'Raleway-Bold',}}
                                    autoCapitalize="none"
                                    underlineColorAndroid={'transparent'}
                                    autoCorrect={false}
                                    keyboardType='default'
                                    placeholder='Enter Lorry Name'
                                    placeholderTextColor='#939ABA'
                                    value={this.state.lorryName}
                                    onChangeText={(text) => this.setState({ lorryName: text })}  /> */}
                                <FeatherIcon name="type" size={19} color="#9B9B9B" style={{paddingLeft: 10, paddingRight: 5,}}/>
                                <TextInput
                                    style={{color: '#2C2E6D', fontFamily: 'AvenirLTStd-Medium', fontSize: 16, paddingLeft: 10, width: '85%',}}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    underlineColorAndroid={'transparent'}
                                    autoFocus={false}
                                    keyboardType='default'
                                    placeholder='Lorry Name'
                                    placeholderTextColor='#9B9B9B'
                                    value={this.state.lorryName}
                                    onChangeText={(text) => this.setState({ lorryName: text })} />
                            </View>
                            <View style={{ borderBottomColor: '#9B9B9B', borderBottomWidth: 1, flexDirection: 'row', padding: 25,}}>
                                {/* <Text style={{paddingLeft: 0, paddingTop: 5, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Lorry Plate Number: </Text>
                                <TextInput
                                    style={{height: 50, backgroundColor: '#fff', marginBottom: 10, padding: 10, color: '#3c4c96', fontSize: 20, borderColor: '#3c4c96', borderWidth: 1, fontFamily: 'Raleway-Bold',}}
                                    autoCapitalize="none"
                                    underlineColorAndroid={'transparent'}
                                    autoCorrect={false}
                                    keyboardType='default'
                                    placeholder='Enter Lorry Plate Number'
                                    placeholderTextColor='#939ABA'
                                    value={this.state.lorryPlateNumber}
                                    onChangeText={(text) => this.setState({ lorryPlateNumber: text })}  /> */}
                                <MaterialComIcon name="numeric" size={19} color="#9B9B9B" style={{paddingLeft: 10, paddingRight: 5,}}/>
                                <TextInput
                                    style={{color: '#2C2E6D', fontFamily: 'AvenirLTStd-Medium', fontSize: 16, paddingLeft: 10, width: '85%',}}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    underlineColorAndroid={'transparent'}
                                    autoFocus={false}
                                    keyboardType='default'
                                    placeholder='Lorry Plate Number'
                                    placeholderTextColor='#9B9B9B'
                                    value={this.state.lorryPlateNumber}
                                    onChangeText={(text) => this.setState({ lorryPlateNumber: text })} />    
                            </View>
                            <View style={{ borderBottomColor: '#9B9B9B', borderBottomWidth: 1, flexDirection: 'row', padding: 25,}}>
                                {/* <Text style={{paddingLeft: 0, paddingTop: 5, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Lorry Color: </Text>
                                <TextInput
                                    style={{height: 50, backgroundColor: '#fff', marginBottom: 10, padding: 10, color: '#3c4c96', fontSize: 20, borderColor: '#3c4c96', borderWidth: 1, fontFamily: 'Raleway-Bold',}}
                                    autoCapitalize="none"
                                    underlineColorAndroid={'transparent'}
                                    autoCorrect={false}
                                    keyboardType='default'
                                    placeholder='Enter Lorry Color'
                                    placeholderTextColor='#939ABA'
                                    value={this.state.lorryColor}
                                    onChangeText={(text) => this.setState({ lorryColor: text })}  /> */}
                                <MaterialComIcon name="invert-colors" size={19} color="#9B9B9B" style={{paddingLeft: 10, paddingRight: 5,}}/>
                                <TextInput
                                    style={{color: '#2C2E6D', fontFamily: 'AvenirLTStd-Medium', fontSize: 16, paddingLeft: 10, width: '85%',}}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    underlineColorAndroid={'transparent'}
                                    autoFocus={false}
                                    keyboardType='default'
                                    placeholder='Lorry Color'
                                    placeholderTextColor='#9B9B9B'
                                    value={this.state.lorryColor}
                                    onChangeText={(text) => this.setState({ lorryColor: text })} />
                            </View>
                            <View style={{ borderBottomColor: '#9B9B9B', borderBottomWidth: 1, flexDirection: 'row', padding: 20,}}>
                                {/* <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Lorry Image: </Text> */}
                                <MaterialComIcon name="image-outline" size={19} color="#9B9B9B" style={{paddingLeft: 10, paddingRight: 5,}}/>
                                <View style={{flexDirection: 'row', }}>
                                    {
                                        (this.state.lorryImage !== "") ? <View style={{flexDirection: 'row',}}>
                                            <Image resizeMode="cover" source={{ uri: this.state.lorryImage }} style={{width: 40, height: 30, marginLeft: 10, marginRight: 0,}} /> 
                                            <TouchableOpacity
                                                style={{backgroundColor: '#F2BB45', marginLeft: 20, marginRight: 20, marginBottom: 0, marginTop: 0, paddingVertical: 10, width: 150, }}
                                                onPress={(e) => this.openImage()}>
                                                <Text style={{color: '#fff', textAlign: 'center', fontSize: 15, fontFamily: 'AvenirLTStd-Medium',}}>Choose Image</Text>
                                            </TouchableOpacity>
                                        </View>
                                        : <TouchableOpacity
                                            style={{backgroundColor: '#F2BB45', marginLeft: 10, marginRight: 0, marginBottom: 0, marginTop: 0, paddingVertical: 10, width: 150,}}
                                            onPress={(e) => this.openImage()}>
                                            <Text style={{color: '#fff', textAlign: 'center', fontSize: 15, fontFamily: 'AvenirLTStd-Medium',}}>Choose Image</Text>
                                        </TouchableOpacity>
                                    }
                                </View>
                            </View>
                        {/* </View> */}
                        {spinnerView}
                        </Animated.View>
                    </ScrollView>
                    <View style={{justifyContent: 'flex-end', alignContent: 'center', backgroundColor: '#2C2E6D',}}>
                        <TouchableOpacity
                            disabled={this.state.isClicked}
                            style={this.state.isClicked ? {backgroundColor: '#F4D549', paddingVertical: 20, } : {backgroundColor: '#2C2E6D', paddingVertical: 20, }}
                            onPress={(e) =>  this.updateLorry(e)}>
                            <Text style={this.state.isClicked ? {color: '#2C2E6D', textAlign: 'center', fontSize: 16, fontFamily: 'AvenirLTStd-Black',} : {color: '#fff', textAlign: 'center', fontSize: 16, fontFamily: 'AvenirLTStd-Black',}}>UPDATE LORRY</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView> : <KeyboardAvoidingView style={{flex: 1, backgroundColor: '#fff',}}>
                <ScrollView style={this.state.isClicked ? {backgroundColor: '#F4D549', } : {backgroundColor: '#2C2E6D', }} contentContainerStyle={{flexGrow: 1,}}
                    ref={ref => this.scrollView = ref}
                    onContentSizeChange={(contentWidth, contentHeight)=>{
                        if(this.state.isClicked){
                            this.scrollView.scrollToEnd({animated: true});
                        }else{
                            this.scrollView.scrollTo({x: 0, y: 0, animated: true});
                        }
                    }}>
                    <View style={{flex: 1, borderBottomLeftRadius: 40, borderBottomRightRadius: 40, backgroundColor: '#fff',}}> 
                    <Text style={{paddingBottom: 10, paddingTop: 20, fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', paddingLeft: 20, paddingRight: 20,}}>NOTE: Please add your lorry information for first time setup.</Text>
                        <View style={{ borderBottomColor: '#9B9B9B', borderBottomWidth: 1, borderTopColor: '#9B9B9B', borderTopWidth: 1,  flexDirection: 'row', padding: 25,}}>
                            <FeatherIcon name="truck" size={19} color="#9B9B9B" style={{paddingLeft: 10, paddingRight: 5, paddingTop: 10,}}/>
                            <ModalSelector
                                data={this.state.lorryTypeList}
                                supportedOrientations={['portrait']}
                                keyExtractor= {item => item.lorryTypeId}
                                labelExtractor= {item => item.lorryTypeName}
                                accessible={true}
                                style={{width: '100%',}}
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
                                    style={{color: '#2C2E6D', fontFamily: 'AvenirLTStd-Medium', fontSize: 16, paddingLeft: 10,}}
                                    editable={false}
                                    placeholder='Lorry Type'
                                    underlineColorAndroid={'transparent'}
                                    placeholderTextColor='#9B9B9B'
                                    value={this.state.selectedLorryType}/>
                            </ModalSelector>
                        </View>
                        <View style={{ borderBottomColor: '#9B9B9B', borderBottomWidth: 1, flexDirection: 'row', padding: 25,}}>
                            <FeatherIcon name="type" size={19} color="#9B9B9B" style={{paddingLeft: 10, paddingRight: 5, paddingTop: 10,}}/>
                            <TextInput
                                style={{color: '#2C2E6D', fontFamily: 'AvenirLTStd-Medium', fontSize: 16, paddingLeft: 10, width: '85%',}}
                                autoCapitalize="none"
                                autoCorrect={false}
                                underlineColorAndroid={'transparent'}
                                autoFocus={false}
                                keyboardType='default'
                                placeholder='Lorry Name'
                                placeholderTextColor='#9B9B9B'
                                value={this.state.lorryName}
                                onChangeText={(text) => this.setState({ lorryName: text })} />
                        </View>
                        <View style={{ borderBottomColor: '#9B9B9B', borderBottomWidth: 1, flexDirection: 'row', padding: 25,}}>
                            <MaterialComIcon name="numeric" size={19} color="#9B9B9B" style={{paddingLeft: 10, paddingRight: 5, paddingTop: 10,}}/>
                            <TextInput
                                style={{color: '#2C2E6D', fontFamily: 'AvenirLTStd-Medium', fontSize: 16, paddingLeft: 10, width: '85%',}}
                                autoCapitalize="none"
                                autoCorrect={false}
                                underlineColorAndroid={'transparent'}
                                autoFocus={false}
                                keyboardType='default'
                                placeholder='Lorry Plate Number'
                                placeholderTextColor='#9B9B9B'
                                value={this.state.lorryPlateNumber}
                                onChangeText={(text) => this.setState({ lorryPlateNumber: text })} />    
                        </View>
                        <View style={{ borderBottomColor: '#9B9B9B', borderBottomWidth: 1, flexDirection: 'row', padding: 25,}}>
                            <MaterialComIcon name="invert-colors" size={19} color="#9B9B9B" style={{paddingLeft: 10, paddingRight: 5, paddingTop: 10,}}/>
                            <TextInput
                                style={{color: '#2C2E6D', fontFamily: 'AvenirLTStd-Medium', fontSize: 16, paddingLeft: 10, width: '85%',}}
                                autoCapitalize="none"
                                autoCorrect={false}
                                underlineColorAndroid={'transparent'}
                                autoFocus={false}
                                keyboardType='default'
                                placeholder='Lorry Color'
                                placeholderTextColor='#9B9B9B'
                                value={this.state.lorryColor}
                                onChangeText={(text) => this.setState({ lorryColor: text })} />
                        </View>
                        <View style={{ borderBottomColor: '#9B9B9B', borderBottomWidth: 1, flexDirection: 'row', padding: 20,}}>
                            <MaterialComIcon name="image-outline" size={19} color="#9B9B9B" style={{paddingLeft: 10, paddingRight: 5, paddingTop: 10,}}/>
                            <View style={{flexDirection: 'row', }}>
                                {
                                    (this.state.lorryImage !== "") ? <View style={{flexDirection: 'row',}}>
                                        <Image resizeMode="cover" source={{ uri: this.state.lorryImage }} style={{width: 40, height: 30, marginLeft: 10, marginRight: 0,}} /> 
                                        <TouchableOpacity
                                            style={{backgroundColor: '#F2BB45', marginLeft: 20, marginRight: 20, marginBottom: 0, marginTop: 0, paddingVertical: 10, width: 150, }}
                                            onPress={(e) => this.openImage()}>
                                            <Text style={{color: '#fff', textAlign: 'center', fontSize: 15, fontFamily: 'AvenirLTStd-Medium',}}>Choose Image</Text>
                                        </TouchableOpacity>
                                    </View>
                                    : <TouchableOpacity
                                        style={{backgroundColor: '#F2BB45', marginLeft: 10, marginRight: 0, marginBottom: 0, marginTop: 0, paddingVertical: 10, width: 150,}}
                                        onPress={(e) => this.openImage()}>
                                        <Text style={{color: '#fff', textAlign: 'center', fontSize: 15, fontFamily: 'AvenirLTStd-Medium',}}>Choose Image</Text>
                                    </TouchableOpacity>
                                }
                            </View>
                        </View>
                    {spinnerView}
                    </View>
                </ScrollView>
                <View style={{justifyContent: 'flex-end', alignContent: 'center', backgroundColor: '#2C2E6D',}}>
                    <TouchableOpacity
                        disabled={this.state.isClicked}
                        style={this.state.isClicked ? {backgroundColor: '#F4D549', paddingVertical: 20, } : {backgroundColor: '#2C2E6D', paddingVertical: 20, }}
                        onPress={(e) =>  this.updateLorry(e)}>
                        <Text style={this.state.isClicked ? {color: '#2C2E6D', textAlign: 'center', fontSize: 16, fontFamily: 'AvenirLTStd-Black',} : {color: '#fff', textAlign: 'center', fontSize: 16, fontFamily: 'AvenirLTStd-Black',}}>UPDATE LORRY</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        )
    }
}

const mapStateToProps = (state, ownProps) => {
    console.log('isLoggedIn: ', state.reducers.isLoggedIn);
    return {
        isLoggedIn: state.reducers.isLoggedIn
    };
}

const mapDispatchToProps = (dispatch) => {
    return{
        onLogin: (email) => { dispatch(login(email)); console.log('email: ', email); },
        onForgotPassword: (email) => { dispatch(forgotpassword(email)); },
        onLogout: (email) => { dispatch(logout()); },
    }
}

export default connect (mapStateToProps, mapDispatchToProps)(UpdateLorryFirst);