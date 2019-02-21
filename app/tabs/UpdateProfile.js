import React, { Component } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, TextInput, KeyboardAvoidingView, } from 'react-native';
import { styles } from '../utils/Style';
import NetworkConnection from '../utils/NetworkConnection';
import DeviceInfo from 'react-native-device-info';
import { Avatar } from 'react-native-elements';
import MyRealm from '../utils/Realm';
import Spinner from 'react-native-spinkit';
import ModalSelector from 'react-native-modal-selector';
import OneSignal from 'react-native-onesignal';
import ImagePicker from 'react-native-image-picker';

let myApiUrl = 'http://courierlabapi.azurewebsites.net/api/v1/MobileApi';
let updateProfilePath = 'UpdateProfile';
let getBankListPath = 'GetBankList';
let deviceId = DeviceInfo.getUniqueID();
let realm = new MyRealm();
let loginAsset = realm.objects('LoginAsset');

export default class UpdateProfile extends Component{
    static navigationOptions = {
        title: 'Update Profile',
    };
    
    constructor(props){
        super(props);
        this.state = {
            spinnerVisible: false,
            isSubmit: false,
            isClicked: false,
            name: '',
            nric: '',
            phoneNumber: '',
            selectedBankId: 0,
            bankAccountNumber: '',
            driverImage: '',
            bankList: [],
            selectedBank: '',
        };
    }

    componentDidMount() {
        setTimeout(() => {
            this.checkInternetConnection();
        }, 500);
        this.setState({
            name: loginAsset[0].loginUserName,
            nric: loginAsset[0].loginUserNRIC,
            phoneNumber: loginAsset[0].loginUserPhoneNumber,
            selectedBankId: loginAsset[0].bankId,
            selectedBank: loginAsset[0].bankName,
            bankAccountNumber: loginAsset[0].bankAccountNumber,
            driverImage: loginAsset[0].driverImage,
        })
        this.getBankList()
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

    getBankList(){
        fetch(`${myApiUrl}/${getBankListPath}?deviceId=` + deviceId + `&userId=` + loginAsset[0].userId, {
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
                    bankList: json.results,
                });
            } 
        }).catch(err => {
            console.log(err);
        });
    }

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
                    driverImage: "",
                });
            }else if (response.error) {
                this.setState({
                    driverImage: "",
                });
            }else {
                const source = response.uri;
                this.setState({
                    driverImage: source,
                });
            }
        });
        console.log('image: ', this.state.driverImage)
    }

    updateProfile(e){
        this.setState({
            spinnerVisible: true,
            isClicked: true,
            isSubmit: true,
        })
        console.log(loginAsset[0]);
        if(this.state.name === '' || this.state.nric === '' || this.state.phoneNumber === '' || this.state.selectedBankId === '' || this.state.bankAccountNumber === ''){
            Alert.alert('Cannot Update', "Please key in Name, NRIC, Phone Number, Bank and Bank Account Number", [{
                text: 'OK',
                onPress: () => {},
            }], {cancelable: false});
            this.setState({
                spinnerVisible: false,
                isClicked: false,
                isSubmit: false,
            })
        }else{
            var bodyData = new FormData();
            bodyData.append('name', this.state.name);
            bodyData.append('nRIC', this.state.nric);
            bodyData.append('phoneNumber', this.state.phoneNumber);
            bodyData.append('bankId', this.state.selectedBankId);
            bodyData.append('BankAccountNumber', this.state.bankAccountNumber);
            bodyData.append('roleId', loginAsset[0].roleId);
            bodyData.append('driverId', loginAsset[0].loginUserId);
            bodyData.append('deviceId', deviceId);
            bodyData.append('userId', loginAsset[0].userId);
            bodyData.append('driverImage', { uri: this.state.driverImage, name: 'driverImage', type: 'image/jpeg' });
            console.log(bodyData);
            fetch(`${myApiUrl}/${updateProfilePath}`, {
                method: 'POST',
                headers: {
                    // 'Accept': 'application/json',
                    'Content-Type': 'multipart/form-data',
                    'Authorization': loginAsset[0].accessToken,
                },
                body: bodyData,
            })
            // fetch(`${myApiUrl}/${updateProfilePath}`, {
            //     method: 'POST',
            //     headers: {
            //         'Accept': 'application/json',
            //         'Content-Type': 'application/json',
            //         'Authorization': loginAsset[0].accessToken,
            //     },
            //     body: JSON.stringify({
            //         userId: loginAsset[0].userId,
            //         deviceId: deviceId,
            //         driverId: loginAsset[0].loginUserId,
            //         roleId: loginAsset[0].roleId,
            //         name: this.state.name,
            //         nRIC: this.state.nric,
            //         phoneNumber: this.state.phoneNumber,
            //     }),
            // })
            .then((response) => response.json())
            .then((json) => {
                console.log(json);
                if(json.succeeded){
                    realm.write(() => {
                        loginAsset[0].loginUserName = json.results.driverName;
                        loginAsset[0].loginUserNRIC = json.results.driverNRIC;
                        loginAsset[0].loginUserPhoneNumber = json.results.driverPhoneNumber;
                        loginAsset[0].bankId = json.results.bankId,
                        loginAsset[0].bankName = json.results.bankName,
                        loginAsset[0].bankAccountNumber = json.results.bankAccountNumber,
                        loginAsset[0].driverImage = json.results.driverProfilePicture
                    })
                    this.setState({ 
                        spinnerVisible: false,
                        isSubmit: false,
                        isClicked: false,
                    });
                    Alert.alert('Successfully Updated', json.message, [{
                        text: 'OK',
                        onPress: () => {},
                    }], {cancelable: false});
                    this.props.navigation.state.params.rerenderFunction();
                    this.props.navigation.goBack();
                }else{
                    Alert.alert('Cannot Update', json.message, [{
                        text: 'OK',
                        onPress: () => {},
                    }], {cancelable: false});
                    this.setState({ 
                        spinnerVisible: false, 
                        isSubmit: false,
                        isClicked: false,
                    });
                }
            }).catch(err => {
                console.log(err);
                this.setState({ 
                    spinnerVisible: false, 
                    isSubmit: false,
                    isClicked: false,
                });
            });
        }
        e.preventDefault();
    }

    render(){
        return(
            <KeyboardAvoidingView style={{flex: 1, backgroundColor: '#fff',}}>
                <ScrollView>
                    <View>
                        <View style={{flexDirection: 'column', paddingBottom: 20, paddingTop: 20, justifyContent: 'center', }}>
                            <Avatar
                                size="xlarge"
                                rounded
                                source={{uri: this.state.driverImage}}
                                onPress={() => this.openImage()}
                                activeOpacity={0.7}
                                containerStyle={{justifyContent: 'center', alignSelf: 'center',}}
                            />
                            <Text style={{paddingLeft: 0, paddingTop: 5, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold', justifyContent: 'center', textDecorationLine: 'underline', alignSelf: 'center',}}
                                onPress={() => this.openImage()}>
                                Change Profile Picture
                            </Text>
                        </View>
                        <View style={{paddingLeft: 15, paddingRight: 15,}}>
                            <Text style={{paddingLeft: 0, paddingTop: 5, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Name: </Text>
                            <TextInput
                                style={styles.input}
                                autoCapitalize="none"
                                autoCorrect={false}
                                underlineColorAndroid={'transparent'}
                                keyboardType='default'
                                placeholder='Name'
                                placeholderTextColor='#8E9495'
                                value={this.state.name}
                                onChangeText={(text) => this.setState({ name: text })}  />
                        </View>
                        <View style={{paddingLeft: 15, paddingRight: 15,}}>
                            <Text style={{paddingLeft: 0, paddingTop: 5, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>NRIC: </Text>
                            <TextInput
                                style={styles.input}
                                autoCapitalize="none"
                                autoCorrect={false}
                                underlineColorAndroid={'transparent'}
                                keyboardType='default'
                                placeholder='NRIC'
                                placeholderTextColor='#8E9495'
                                value={this.state.nric}
                                onChangeText={(text) => this.setState({ nric: text })}  />
                        </View>
                        <View style={{paddingLeft: 15, paddingRight: 15,}}>
                            <Text style={{paddingLeft: 0, paddingTop: 5, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Phone Number: </Text>
                            <TextInput
                                style={styles.input}
                                autoCapitalize="none"
                                autoCorrect={false}
                                underlineColorAndroid={'transparent'}
                                keyboardType='default'
                                placeholder='Phone Number'
                                placeholderTextColor='#8E9495'
                                value={this.state.phoneNumber}
                                onChangeText={(text) => this.setState({ phoneNumber: text })}  />
                        </View>
                        {/* <View style={{paddingLeft: 15, paddingRight: 15,}}>
                            <Text style={{paddingLeft: 0, paddingTop: 5, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Bank: </Text>
                            <TextInput
                                style={styles.input}
                                autoCapitalize="none"
                                autoCorrect={false}
                                underlineColorAndroid={'transparent'}
                                keyboardType='default'
                                placeholder='Name'
                                placeholderTextColor='#8E9495'
                                value={this.state.name}
                                onChangeText={(text) => this.setState({ bank: text })}  />
                        </View> */}
                        <View>
                            <Text style={{paddingLeft: 20, paddingTop: 5, paddingBottom: 5, paddingRight: 20, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Bank: </Text>
                            <ModalSelector
                                data={this.state.bankList}
                                supportedOrientations={['portrait']}
                                keyExtractor= {item => item.bankId}
                                labelExtractor= {item => item.bankName}
                                accessible={true}
                                scrollViewAccessibilityLabel={'Scrollable options'}
                                cancelButtonAccessibilityLabel={'Cancel Button'}
                                onChange={(option)=>{ 
                                    this.setState({
                                        selectedBank: option.bankName,
                                        selectedBankId: option.bankId,
                                    })
                                }}>
                                <TextInput
                                    style={{height: 50, backgroundColor: '#fff', marginBottom: 10, padding: 10, color: '#3c4c96', fontSize: 20, borderColor: '#3c4c96', borderWidth: 1, marginLeft: 15, marginRight: 15, fontFamily: 'Raleway-Bold',}}
                                    editable={false}
                                    placeholder='Select Bank'
                                    underlineColorAndroid={'transparent'}
                                    placeholderTextColor='#939ABA'
                                    value={this.state.selectedBank}/>
                            </ModalSelector>
                        </View>
                        <View style={{paddingLeft: 15, paddingRight: 15,}}>
                            <Text style={{paddingLeft: 0, paddingTop: 5, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Bank Account Number: </Text>
                            <TextInput
                                style={styles.input}
                                autoCapitalize="none"
                                autoCorrect={false}
                                underlineColorAndroid={'transparent'}
                                keyboardType='default'
                                placeholder='Bank Account Number'
                                placeholderTextColor='#8E9495'
                                value={this.state.bankAccountNumber}
                                onChangeText={(text) => this.setState({ bankAccountNumber: text })}  />
                        </View>
                    </View>
                    {
                        (this.state.isClicked) ? <View style={{alignItems: 'center', paddingBottom: 10, marginTop: 20, paddingLeft: 20, paddingRight: 20,}}> 
                            <Spinner
                                isVisible={this.state.spinnerVisible}
                                type={'9CubeGrid'}
                                color='#3c4c96'
                                paddingLeft={20}
                                size={50}/>
                        </View> : <View/>
                    }
                    <View style={this.state.isSubmit ? {backgroundColor: '#7D839C', paddingLeft: 10, paddingRight: 10, marginTop: 10, marginLeft: 15, marginRight: 15, marginBottom: 10,} : {backgroundColor: '#3c4c96', paddingLeft: 10, paddingRight: 10, marginTop: 10, marginLeft: 15, marginRight: 15, marginBottom: 20,}}>
                        <TouchableOpacity
                            disabled={this.state.isSubmit}
                            style={this.state.isSubmit ? {backgroundColor: '#7D839C', paddingVertical: 15, paddingLeft: 10, paddingRight: 10,} : {backgroundColor: '#3c4c96', paddingVertical: 15, paddingLeft: 10, paddingRight: 10,}}
                            onPress={(e) => this.updateProfile(e)}>
                            <Text style={styles.buttonText}>Update</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        )
    }
} 