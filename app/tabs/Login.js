import React, { Component } from 'react';
import { connect } from 'react-redux';
import { ScrollView, Text, TextInput,  View, Platform, Image, TouchableOpacity, KeyboardAvoidingView, Alert, ImageBackground, Modal, } from 'react-native';
import { styles } from '../utils/Style';
import { login, logout } from '../utils/Actions';
import NetworkConnection from '../utils/NetworkConnection';
import SimIcon from 'react-native-vector-icons/SimpleLineIcons';
import DeviceInfo from 'react-native-device-info';
import MyRealm from '../utils/Realm';
import Spinner from 'react-native-spinkit';
import OneSignal from 'react-native-onesignal';
import Icon from 'react-native-vector-icons/FontAwesome';

let myApiUrl = 'http://courierlabapi.azurewebsites.net/api/v1/MobileApi';
let loginPath = 'Login';
let refreshTokenPath = 'RefreshToken';
let deviceId = DeviceInfo.getUniqueID();
let realm = new MyRealm();
let loginAsset = realm.objects('LoginAsset');
let deviceModel = DeviceInfo.getModel().toString()

class Login extends Component{
    static navigationOptions = {
        title: 'Login',
        header: null,
    }

    constructor(props){
        super(props);
        this.state = {
            route: 'Login',
            email: '',
            password: '',
            spinnerVisible: false,
            isSubmit: false,
            isRegister: false,
            modalVisible: false,
            forgetEmail: '',
            forgetSpinnerVisible: false,
            isForgetSubmit: false,
        };
    }

    async componentWillMount(){
        console.log(loginAsset[0]);
        console.log(DeviceInfo.getModel())
        let now = new Date();
        if(loginAsset[0] !== undefined){
            if(new Date(loginAsset[0].accessTokenExpiredDate) < now){
                //refresh token
                console.log('expired token calling');
                await fetch(`${myApiUrl}/${refreshTokenPath}?userId=` + loginAsset[0].userId + `&deviceId=` + deviceId, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': loginAsset[0].refreshToken,
                    },
                })
                .then((response) => response.json())
                .then((json) => {
                    console.log('getResult: ', json);
                    console.log('update token successfully');
                    if(json.succeeded){
                        realm.write(() => {
                            loginAsset[0].accessToken = json.results.newAccessToken;
                            loginAsset[0].accessTokenExpiredDate = json.results.accessTokenExpiredDate;
                            loginAsset[0].refreshToken = json.results.newRefreshToken;
                        })
                        this.props.onLogin(loginAsset[0].email);
                    }else{
                        // Alert.alert('Login Expired', 'Please try to login again', [{
                        //     text: 'OK',
                        //     onPress: () => {},
                        //     style: styles.alertText,
                        // }], {cancelable: false});
                        realm.write(() => {
                            realm.delete(loginAsset);
                        })
                        this.setState({ 
                            spinnerVisible: false,
                            isSubmit: false,
                        });
                        OneSignal.deleteTag("userId");
                        this.props.onLogout();
                    }
                }).catch(err => {
                    console.log(err);
                });
            }else{
                // console.log('not over, token: ', loginAsset[0].accessTokenExpiredDate, ' now: ', now);
                //go to main page
                console.log('not expired yet');
                this.props.onLogin(loginAsset[0].email);                
            }
        }
    }

    componentDidMount() {
        setTimeout(() => {
            this.checkInternetConnection();
        }, 500);
        console.log(deviceId);
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

    userLogin(e){
        this.setState({
            spinnerVisible: true,
            isSubmit: true,
        })
        if(this.state.email === "" || this.state.password === ""){
            Alert.alert('Cannot Sign In', 'Please key in Username/Email Address and Password', [{
                text: 'OK',
                onPress: () => {
                    this.setState({
                        spinnerVisible: false,
                        isSubmit: false,
                    })
                },
                style: styles.alertText,
            }], {cancelable: false});
        }else{
            fetch(`${myApiUrl}/${loginPath}`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: this.state.email,
                    password: this.state.password,
                    deviceId: deviceId,
                }),
            })
            .then((response) => response.json())
            .then((json) => {
                console.log(json);

                if(json.succeeded){
                    console.log(json);
                    if(json.results.driver !== null){
                        if(json.results.driver.hasLorry){
                            realm.write(() => {
                                realm.create('LoginAsset', {
                                    userId: json.results.userId,
                                    accessToken: json.results.accessToken,
                                    accessTokenExpiredDate: json.results.accessTokenExpiredDate,
                                    refreshToken: json.results.refreshToken,
                                    roleId: json.results.roleId,
                                    roleName: json.results.roleName,
                                    email: this.state.email,
                                    loginUserId: json.results.driver.driverId,
                                    loginUserName: json.results.driver.driverName,
                                    loginUserNRIC: json.results.driver.driverNRIC,
                                    loginUserPhoneNumber: json.results.driver.driverPhoneNumber,
                                    loginUserAddress: '',
                                    loginUserState: '',
                                    loginUserPostcode: 0,
                                    lorryId: json.results.driver.lorry.lorryId,
                                    lorryColor: json.results.driver.lorry.lorryColor,
                                    lorryImage: json.results.driver.lorry.lorryImage,
                                    // lorryLengthId: json.results.driver.lorry.lorryLengthId,
                                    // lorryLengthAmount: json.results.driver.lorry.lorryLengthAmount,
                                    lorryName: json.results.driver.lorry.lorryName,
                                    lorryPlateNumber: json.results.driver.lorry.lorryPlateNumber,
                                    lorryTypeId: json.results.driver.lorry.lorryTypeId,
                                    lorryTypeName: json.results.driver.lorry.lorryTypeName,
                                    // lorryWeightId: json.results.driver.lorry.lorryWeightId,
                                    // lorryWeigthAmount: json.results.driver.lorry.lorryWeightAmount,
                                    bankId: json.results.driver.bankId,
                                    bankName: json.results.driver.bankName,
                                    bankAccountNumber: json.results.driver.bankAccountNumber,
                                    driverImage: json.results.driver.driverImage,
                                    driverICImage: (json.results.driver.driverICImage == null || json.results.driver.driverICImage == '') ? '' : json.results.driver.driverICImage,
                                    driverLicenseImage: (json.results.driver.driverLicenseImage == null || json.results.driver.driverLicenseImage == '') ? '' : json.results.driver.driverLicenseImage,
                                })
                            })
                            this.props.onLogin(this.state.email);
                        }else{
                            this.props.navigation.navigate('UpdateLorryFirst', {
                                userId: json.results.userId,
                                accessToken: json.results.accessToken,
                                accessTokenExpiredDate: json.results.accessTokenExpiredDate,
                                refreshToken: json.results.refreshToken,
                                roleId: json.results.roleId,
                                roleName: json.results.roleName,
                                email: this.state.email,
                                loginUserId: json.results.driver.driverId,
                                loginUserName: json.results.driver.driverName,
                                loginUserNRIC: json.results.driver.driverNRIC,
                                loginUserPhoneNumber: json.results.driver.driverPhoneNumber,
                                bankId: json.results.driver.bankId,
                                bankName: json.results.driver.bankName,
                                bankAccountNumber: json.results.driver.bankAccountNumber,
                                driverImage: json.results.driver.driverImage,
                            });
                        }
                    }else{
                        if(json.results.shipper !== null){
                            console.log(json.results.accessTokenExpiredDate);
                            realm.write(() => {
                                realm.create('LoginAsset', {
                                    userId: json.results.userId,
                                    accessToken: json.results.accessToken,
                                    accessTokenExpiredDate: json.results.accessTokenExpiredDate,
                                    refreshToken: json.results.refreshToken,
                                    roleId: json.results.roleId,
                                    roleName: json.results.roleName,
                                    email: this.state.email,
                                    loginUserId: json.results.shipper.shipperId,
                                    loginUserName: json.results.shipper.shipperName,
                                    loginUserNRIC: json.results.shipper.shipperNRIC,
                                    loginUserPhoneNumber: json.results.shipper.shipperPhoneNumber,
                                    loginUserAddress: json.results.shipper.shipperAddress,
                                    loginUserState: json.results.shipper.shipperState,
                                    loginUserPostcode: json.results.shipper.shipperPostCode,
                                })
                            })
                            this.props.onLogin(this.state.email);
                        }else{
                            this.props.navigation.navigate('UpdateProfileFirst', {
                                userId: json.results.userId,
                                accessToken: json.results.accessToken,
                                accessTokenExpiredDate: json.results.accessTokenExpiredDate,
                                refreshToken: json.results.refreshToken,
                                roleId: json.results.roleId,
                                roleName: json.results.roleName,
                                email: this.state.email,
                            });
                        }
                    }
                    OneSignal.sendTag("userId", json.results.userId.toString());
                    this.setState({ 
                        spinnerVisible: false,
                        isSubmit: false,
                    });
                }else{
                    Alert.alert('Cannot Sign In', json.message, [{
                        text: 'OK',
                        onPress: () => {
                            this.setState({ 
                                spinnerVisible: false, 
                                isSubmit: false,
                            });
                        },
                        style: styles.alertText,
                    }], {cancelable: false});
                }
            }).catch(err => {
                console.log(err);
            });
        }
        e.preventDefault();
    }

    forgotPassword(e){
        this.setState({
            forgetSpinnerVisible: true,
            isForgetSubmit: true,
        })

        if(this.state.forgetEmail === ""){
            Alert.alert('Failed to Forgot Password', 'Please key in Email Address', [{
                text: 'OK',
                onPress: () => {
                    this.setState({
                        forgetSpinnerVisible: false,
                        isForgetSubmit: false,
                    })
                },
            }], {cancelable: false});
        }else{
            fetch(`${myApiUrl}/${forgotPasswordPath}?emailAddress=` + this.state.forgetEmail, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            })
            .then((response) => response.json())
            .then((json) => {
                console.log(json);
                if(json.succeeded){
                    Alert.alert('Successfully Forgot Password', json.message, [{
                        text: 'OK',
                        onPress: () => {
                            this.setState({
                                forgetSpinnerVisible: false,
                                isForgetSubmit: false,
                            })
                        },
                    }], {cancelable: false});
                    this.props.navigation.goBack();
                }else{
                    Alert.alert('Failed to Forgot Password', json.message, [{
                        text: 'OK',
                        onPress: () => {
                            this.setState({
                                forgetSpinnerVisible: false,
                                isForgetSubmit: false,
                            })
                        },
                    }], {cancelable: false});
                }
            }).catch(err => {
                console.log(err);
                this.setState({
                    forgetSpinnerVisible: false,
                    isForgetSubmit: false,
                })
            })
            e.preventDefault();
        }
    }

    render(){
        // let alt = (this.state.route === 'Login') ? 'ForgotPassword' : 'Login';
        // console.log(deviceModel == 'iPhone 5s');
    //     let iosView = (deviceModel == 'iPhone 5s') ? <KeyboardAvoidingView behavior="padding" style={{backgroundColor: '#fff', padding: 0,}}>
    //     <ImageBackground source={require('../assets/backgroundImg.png')} style={{width: '100%', height: '100%'}}>
    //     <ScrollView>
    //     <View style={{padding: 0, alignItems: 'center', justifyContent: 'center',}}>
    //         <Image resizeMode="contain" style={[styles.logo, {position: 'relative',}]} source={require('../assets/liner.png')} />
    //     </View>
    //     <View style={{paddingLeft: 40, paddingRight: 40, paddingTop: 20, paddingBottom: 20,}}>
    //         <TextInput
    //             style={{height: 40, backgroundColor: 'transparent', borderBottomWidth: 1, borderBottomColor: '#fff', marginBottom: 10, paddingTop: 10, paddingBottom: 0, paddingLeft: 0, paddingRight: 10, color: '#fff', fontSize: 18, fontWeight: '600', fontFamily: 'AvenirLTStd-Roman',}}
    //             autoCapitalize="none"
    //             underlineColorAndroid={'transparent'}
    //             autoCorrect={false}
    //             autoFocus={false}
    //             keyboardType='email-address'
    //             returnKeyLabel="next"
    //             placeholder='Username'
    //             placeholderTextColor='#8D92BB'
    //             value={this.state.email}
    //             onChangeText={(text) => this.setState({ email: text })}  />
    //         <TextInput
    //             style={{height: 40, backgroundColor: 'transparent', borderBottomWidth: 1, borderBottomColor: '#fff', marginBottom: 10, paddingTop: 10, paddingBottom: 0, paddingLeft: 0, paddingRight: 10, color: '#fff', fontSize: 18, fontWeight: '600', fontFamily: 'AvenirLTStd-Roman',}}
    //             autoCapitalize="none"
    //             underlineColorAndroid={'transparent'}
    //             autoCorrect={false}
    //             returnKeyLabel="go"
    //             placeholder='Password'
    //             placeholderTextColor='#8D92BB'
    //             secureTextEntry={true}
    //             value={this.state.password}
    //             onChangeText={(text) => this.setState({ password: text })} />
    //         <View style={{flexDirection: 'row',}}>
    //             <Icon name={'question-circle'} size={15} color={'#EDD04B'} style={{paddingBottom: 10, paddingTop: 5,}}/>
    //             <Text style={{fontSize: 14, color: '#8D92BB', paddingBottom: 10, paddingLeft: 10, paddingTop: 5, fontWeight: '600', fontFamily: 'AvenirLTStd-Roman',}} onPress={() => this.props.navigation.navigate('ForgotPassword')}>FORGOT PASSWORD</Text>
    //         </View>
    //     </View>
    //     </ScrollView>
    //     </ImageBackground>
    // </KeyboardAvoidingView> : <KeyboardAvoidingView behavior="padding" style={{flex: 1, backgroundColor: '#fff', padding: 0,}}>
    //     <ImageBackground source={require('../assets/backgroundImg.png')} style={{width: '100%', height: '100%', justifyContent: 'center',}}>
    //     <View style={[{padding: 20, alignItems: 'center', justifyContent: 'center',}]}>
    //         <Image resizeMode="contain" style={styles.logo} source={require('../assets/liner.png')} />
    //     </View>
    //     <View style={[{padding: 40,}]}>
    //         <TextInput
    //             style={{height: 40, backgroundColor: 'transparent', borderBottomWidth: 1, borderBottomColor: '#fff', marginBottom: 10, paddingTop: 10, paddingBottom: 0, paddingLeft: 0, paddingRight: 10, color: '#fff', fontSize: 18, fontWeight: '600', fontFamily: 'AvenirLTStd-Roman',}}
    //             autoCapitalize="none"
    //             underlineColorAndroid={'transparent'}
    //             autoCorrect={false}
    //             autoFocus={false}
    //             keyboardType='email-address'
    //             returnKeyLabel="next"
    //             placeholder='Username'
    //             placeholderTextColor='#8D92BB'
    //             value={this.state.email}
    //             onChangeText={(text) => this.setState({ email: text })}  />
    //         <TextInput
    //             style={{height: 40, backgroundColor: 'transparent', borderBottomWidth: 1, borderBottomColor: '#fff', marginBottom: 10, paddingTop: 10, paddingBottom: 0, paddingLeft: 0, paddingRight: 10, color: '#fff', fontSize: 18, fontWeight: '600', fontFamily: 'AvenirLTStd-Roman',}}
    //             autoCapitalize="none"
    //             underlineColorAndroid={'transparent'}
    //             autoCorrect={false}
    //             returnKeyLabel="go"
    //             placeholder='Password'
    //             placeholderTextColor='#8D92BB'
    //             secureTextEntry={true}
    //             value={this.state.password}
    //             onChangeText={(text) => this.setState({ password: text })} />
    //         <View style={{flexDirection: 'row',}}>
    //             <Icon name={'question-circle'} size={15} color={'#EDD04B'} style={{paddingBottom: 10, paddingTop: 5,}}/>
    //             <Text style={{fontSize: 14, color: '#8D92BB', paddingBottom: 10, paddingLeft: 10, paddingTop: 5, fontWeight: '600', fontFamily: 'AvenirLTStd-Roman',}} onPress={() => this.props.navigation.navigate('ForgotPassword')}>FORGOT PASSWORD</Text>
    //         </View>
    //         <Text style={{fontSize: 17, color: '#3c4c96', textAlign: 'center', paddingLeft: 10, paddingRight: 10, paddingTop: 0, paddingBottom: 10, fontFamily: 'AvenirLTStd-Roman',}} onPress={() => this.props.navigation.navigate('Register')}>Register as Shipper</Text>
    //     </View>
    //     </ImageBackground>
    // </KeyboardAvoidingView>
        return(
            (Platform.OS === 'ios') ? <KeyboardAvoidingView behavior="padding" style={{flex: 1, backgroundColor: '#fff', padding: 0,}}>
                {
                    (this.state.modalVisible) ? <Modal
                        animationType="slide"
                        transparent={true}
                        visible={this.state.modalVisible}>
                        <View style={{flex: 1, backgroundColor: 'rgba(0,0,0,.4)', position: 'absolute', top: 0, right: 0, bottom: 0, left: 0}}>
                            <View style={{flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center',}}> 
                                <View style={{backgroundColor: '#2C2E6D', width: '80%', flexDirection: 'row', justifyContent: 'space-between',}}>
                                    <Text style={{fontSize: 16, color: '#fff', fontFamily: 'AvenirLTStd-Heavy', paddingLeft: 20, paddingRight: 20, paddingBottom: 20, paddingTop: 25, textAlign: 'center', }}>FORGET PASSWORD</Text>
                                    <SimIcon name="close" size={25} color="#fff" style={{paddingRight: 20, alignItems: 'flex-end', textAlign: 'right', paddingBottom: 20, paddingTop: 20,}} onPress={() => {this.setState({ modalVisible: false,})}}/>
                                </View>
                                <View style={{backgroundColor: '#fff', width: '80%', flexDirection: 'row', padding: 10,}}>
                                    <TextInput
                                        style={{color: '#2C2E6D', fontFamily: 'AvenirLTStd-Medium', fontSize: 16, padding: 20, width: '70%', borderWidth: 1, borderColor: '#D0D0D0',}}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        underlineColorAndroid={'transparent'}
                                        autoFocus={false}
                                        keyboardType='default'
                                        placeholder='Email Address'
                                        placeholderTextColor='#A3A3A3'
                                        value={this.state.forgetEmail}
                                        onChangeText={(text) => this.setState({ forgetEmail: text })} />
                                    <TouchableOpacity
                                        disabled={this.state.isForgetSubmit}
                                        style={this.state.isForgetSubmit ? {backgroundColor: '#F4D549', paddingVertical: 20, width: '30%',} : {backgroundColor: '#2C2E6D', paddingVertical: 20, width: '30%',}}
                                        onPress={(e) => this.forgotPassword(e)}>
                                        <Text style={this.state.isForgetSubmit ? {color: '#2C2E6D', textAlign: 'center', fontSize: 16, fontFamily: 'AvenirLTStd-Black', paddingTop: 5,} : {color: '#fff', textAlign: 'center', fontSize: 16, fontFamily: 'AvenirLTStd-Black', paddingTop: 5,}}>SEND</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={{alignItems: 'center', justifyContent: 'flex-end', }}>
                                    <Spinner
                                        isVisible={this.state.forgetSpinnerVisible}
                                        type={'ThreeBounce'}
                                        color='#F4D549'
                                        size={30}/>
                                </View>
                            </View>
                        </View>
                    </Modal> : <View/>
                }
                <View style={{flex: 1, flexDirection: 'row',}}>
                    <View style={this.state.isSubmit ? {backgroundColor: '#F4D549', flex: 1,} : {backgroundColor: '#2C2E6D', flex: 1,}}>
                    </View>
                    <View style={this.state.isRegister ? {backgroundColor: '#F4D549', flex: 1,} : {backgroundColor: '#2C2E6D', flex: 1,}}>
                    </View>
                    <View style={{position: 'absolute', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', marginTop: -35, }}>
                        <ImageBackground source={require('../assets/backgroundImg.png')} style={{zIndex: 9999, width: '100%', height: '100%', justifyContent: 'center', }} imageStyle={{ borderRadius: 40, }}>
                            <View style={[{padding: 20, alignItems: 'center', justifyContent: 'center',}]}>
                                <Image resizeMode="contain" style={styles.logo} source={require('../assets/liner.png')} />
                                {/* <Text style={[styles.title, {color: '#fff'}]}>LINERS</Text> */}
                            </View>
                            <View style={[{padding: 40,}]}>
                                <View style={{flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
                                    <View style={{flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#fff', marginBottom: 20,}}>
                                        <Text style={{fontSize: 16, color: '#fff', fontFamily: 'AvenirLTStd-Heavy', marginBottom: -15, marginRight: 5, }}>LOGIN</Text>
                                        <TextInput
                                            style={{width: '80%', height: 40, backgroundColor: 'transparent', marginBottom: 0, paddingTop: 10, paddingBottom: 0, paddingLeft: 0, paddingRight: 10, color: '#fff', fontSize: 16, fontWeight: '600', fontFamily: 'AvenirLTStd-Roman', textAlign: 'right',}}
                                            autoCapitalize="none"
                                            underlineColorAndroid={'transparent'}
                                            autoCorrect={false}
                                            autoFocus={false}
                                            keyboardType='email-address'
                                            returnKeyLabel="next"
                                            placeholder='Enter Username'
                                            placeholderTextColor='#8D92BB'
                                            value={this.state.email}
                                            onChangeText={(text) => this.setState({ email: text })}  />
                                    </View>
                                    <View style={{flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#fff', marginBottom: 20,}}>
                                        <Text style={{fontSize: 16, color: '#fff', fontFamily: 'AvenirLTStd-Heavy', marginBottom: -15, marginRight: 5, }}>PASSWORD</Text>
                                        <TextInput
                                            style={{width: '65%', height: 40, backgroundColor: 'transparent', marginBottom: 0, paddingTop: 10, paddingBottom: 0, paddingLeft: 0, paddingRight: 10, color: '#fff', fontSize: 16, fontWeight: '600', fontFamily: 'AvenirLTStd-Roman', textAlign: 'right',}}
                                            autoCapitalize="none"
                                            underlineColorAndroid={'transparent'}
                                            autoCorrect={false}
                                            returnKeyLabel="go"
                                            placeholder='Enter Password'
                                            placeholderTextColor='#8D92BB'
                                            secureTextEntry={true}
                                            value={this.state.password}
                                            onChangeText={(text) => this.setState({ password: text })} />
                                    </View>
                                </View>
                                {/* <View style={{margin: 7}}/> */}
                                {/* <TouchableOpacity
                                    disabled={this.state.isSubmit}
                                    style={this.state.isSubmit ? {backgroundColor: '#7D839C', paddingVertical: 15,} : styles.buttonContainer}
                                    onPress={(e) => this.userLogin(e)}>
                                    <Text style={styles.buttonText}>{this.state.route}</Text>
                                </TouchableOpacity> */}
                                <View style={{flexDirection: 'row', paddingLeft: 5,}}>
                                    <Icon name={'question-circle'} size={15} color={'#EDD04B'} style={{paddingBottom: 10, paddingTop: 5,}}/>
                                    <Text style={{fontSize: 14, color: '#8D92BB', paddingBottom: 10, paddingLeft: 10, paddingTop: 7, fontWeight: '600', fontFamily: 'AvenirLTStd-Roman',}} onPress={() => {
                                        this.setState({
                                            modalVisible: true,
                                        })
                                    }}>FORGET PASSWORD</Text>
                                </View>
                                {/* <Text style={{fontSize: 17, color: '#3c4c96', textAlign: 'center', paddingLeft: 10, paddingRight: 10, paddingTop: 0, paddingBottom: 10, fontFamily: 'AvenirLTStd-Roman',}} onPress={() => this.props.navigation.navigate('Register')}>Register as Shipper</Text> */}
                            </View>
                            <View style={{alignItems: 'center', justifyContent: 'flex-end', }}>
                                <Spinner
                                    isVisible={this.state.spinnerVisible}
                                    type={'ThreeBounce'}
                                    color='#F4D549'
                                    size={30}/>
                            </View>
                        </ImageBackground>
                    </View>
                </View>
            <View style={{justifyContent: 'flex-end', backgroundColor: '#2C2E6D', marginTop: -25,}}>
                <View style={{flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#F4D549',}}>
                    <TouchableOpacity
                        disabled={this.state.isSubmit}
                        style={this.state.isSubmit ? {backgroundColor: '#F4D549', paddingVertical: 20, width: '50%',} : {backgroundColor: '#2C2E6D', paddingVertical: 20, width: '50%',}}
                        onPress={(e) => this.userLogin(e)}>
                        <Text style={this.state.isSubmit ? {color: '#2C2E6D', textAlign: 'center', fontSize: 16, fontFamily: 'AvenirLTStd-Black',} : {color: '#fff', textAlign: 'center', fontSize: 16, fontFamily: 'AvenirLTStd-Black',}}>LOG IN</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={this.state.isRegister ? {backgroundColor: '#F4D549', paddingVertical: 20, width: '50%',} : {backgroundColor: '#2C2E6D', paddingVertical: 20, width: '50%',}}
                        onPress={() => {
                            this.setState({
                                isRegister: true,
                            })
                            this.props.navigation.navigate('Register', { renderFunction: setTimeout(() => {
                                this.setState({
                                    isRegister: false,
                                })
                            }, 500)})
                        }}>
                        <Text style={this.state.isRegister ? {color: '#2C2E6D', textAlign: 'center', fontSize: 16, fontFamily: 'AvenirLTStd-Black',} : {color: '#fff', textAlign: 'center', fontSize: 16, fontFamily: 'AvenirLTStd-Black',}}>REGISTER</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView> : <KeyboardAvoidingView style={{flex: 1, backgroundColor: '#fff', padding: 0,}}>
                {/* <ImageBackground source={require('../assets/backgroundImg.png')} style={{width: '100%', height: '100%', justifyContent: 'center',}}>
                <View style={[styles.loginContainer, {padding: 20,}]}>
                    <Image resizeMode="contain" style={styles.logo} source={require('../assets/liner.png')} />
                </View>
                <View style={[styles.spinnerView, {padding: 20,}]}>
                    <Spinner
                        isVisible={this.state.spinnerVisible}
                        type={'9CubeGrid'}
                        color='#3c4c96'
                        paddingLeft={20}
                        size={50}/>
                </View>
                <View style={[styles.formContainer, {padding: 20,}]}>
                    <TextInput
                        style={styles.input}
                        autoCapitalize="none"
                        underlineColorAndroid={'transparent'}
                        autoCorrect={false}
                        autoFocus={false}
                        keyboardType='email-address'
                        returnKeyLabel="next"
                        placeholder='Username'
                        placeholderTextColor='#939ABA'
                        value={this.state.email}
                        onChangeText={(text) => this.setState({ email: text })}  />
                    <TextInput
                        style={styles.input}
                        autoCapitalize="none"
                        underlineColorAndroid={'transparent'}
                        autoCorrect={false}
                        returnKeyLabel="go"
                        placeholder='Password'
                        placeholderTextColor='#939ABA'
                        secureTextEntry={true}
                        value={this.state.password}
                        onChangeText={(text) => this.setState({ password: text })} />
                    <View style={{margin: 7}}/>
                    <TouchableOpacity
                        disabled={this.state.isSubmit}
                        style={this.state.isSubmit ? {backgroundColor: '#7D839C', paddingVertical: 15,} : styles.buttonContainer}
                        onPress={(e) => this.userLogin(e)}>
                        <Text style={styles.buttonText}>{this.state.route}</Text>
                    </TouchableOpacity>
                    <Text style={styles.forgotText} onPress={() => this.props.navigation.navigate('ForgotPassword')}>Forgot Password</Text>
                    <Text style={{fontSize: 17, color: '#3c4c96', textAlign: 'center', paddingLeft: 10, paddingRight: 10, paddingTop: 0, paddingBottom: 10, fontFamily: 'AvenirLTStd-Roman',}} onPress={() => this.props.navigation.navigate('Register')}>Register as Shipper</Text>
                </View>
                </ImageBackground> */}
                {
                    (this.state.modalVisible) ? <Modal
                        animationType="slide"
                        transparent={true}
                        visible={this.state.modalVisible}>
                        <View style={{flex: 1, backgroundColor: 'rgba(0,0,0,.4)', position: 'absolute', top: 0, right: 0, bottom: 0, left: 0}}>
                            <View style={{flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center',}}> 
                                <View style={{backgroundColor: '#2C2E6D', width: '80%', flexDirection: 'row', justifyContent: 'space-between',}}>
                                    <Text style={{fontSize: 16, color: '#fff', fontFamily: 'AvenirLTStd-Heavy', paddingLeft: 20, paddingRight: 20, paddingBottom: 20, paddingTop: 25, textAlign: 'center', }}>FORGET PASSWORD</Text>
                                    <SimIcon name="close" size={25} color="#fff" style={{paddingRight: 20, alignItems: 'flex-end', textAlign: 'right', paddingBottom: 20, paddingTop: 20,}} onPress={() => {this.setState({ modalVisible: false,})}}/>
                                </View>
                                <View style={{backgroundColor: '#fff', width: '80%', flexDirection: 'row', padding: 10,}}>
                                    <TextInput
                                        style={{color: '#2C2E6D', fontFamily: 'AvenirLTStd-Medium', fontSize: 16, padding: 20, width: '70%', borderWidth: 1, borderColor: '#D0D0D0',}}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        underlineColorAndroid={'transparent'}
                                        autoFocus={false}
                                        keyboardType='default'
                                        placeholder='Email Address'
                                        placeholderTextColor='#A3A3A3'
                                        value={this.state.forgetEmail}
                                        onChangeText={(text) => this.setState({ forgetEmail: text })} />
                                    <TouchableOpacity
                                        disabled={this.state.isForgetSubmit}
                                        style={this.state.isForgetSubmit ? {backgroundColor: '#F4D549', paddingVertical: 20, width: '30%',} : {backgroundColor: '#2C2E6D', paddingVertical: 20, width: '30%',}}
                                        onPress={(e) => this.forgotPassword(e)}>
                                        <Text style={this.state.isForgetSubmit ? {color: '#2C2E6D', textAlign: 'center', fontSize: 16, fontFamily: 'AvenirLTStd-Black', paddingTop: 5,} : {color: '#fff', textAlign: 'center', fontSize: 16, fontFamily: 'AvenirLTStd-Black', paddingTop: 5,}}>SEND</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={{alignItems: 'center', justifyContent: 'flex-end', }}>
                                    <Spinner
                                        isVisible={this.state.forgetSpinnerVisible}
                                        type={'ThreeBounce'}
                                        color='#F4D549'
                                        size={30}/>
                                </View>
                            </View>
                        </View>
                    </Modal> : <View/>
                }
                <View style={{flex: 1, flexDirection: 'row',}}>
                    <View style={this.state.isSubmit ? {backgroundColor: '#F4D549', flex: 1,} : {backgroundColor: '#2C2E6D', flex: 1,}}>
                    </View>
                    <View style={this.state.isRegister ? {backgroundColor: '#F4D549', flex: 1,} : {backgroundColor: '#2C2E6D', flex: 1,}}>
                    </View>
                    <View style={{position: 'absolute', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', marginTop: -35, }}>
                        <ImageBackground source={require('../assets/backgroundImg.png')} style={{zIndex: 9999, width: '100%', height: '100%', justifyContent: 'center', }} imageStyle={{ borderRadius: 40, }}>
                            <View style={[{padding: 20, alignItems: 'center', justifyContent: 'center',}]}>
                                <Image resizeMode="contain" style={styles.logo} source={require('../assets/liner.png')} />
                            </View>
                            <View style={[{padding: 40,}]}>
                                <View style={{flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
                                    <View style={{flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#fff', marginBottom: 20,}}>
                                        <Text style={{fontSize: 16, color: '#fff', fontFamily: 'AvenirLTStd-Heavy', marginBottom: -15, marginRight: 5, }}>LOGIN</Text>
                                        <TextInput
                                            style={{width: '76%', height: 40, backgroundColor: 'transparent', marginBottom: 0, paddingTop: 10, paddingBottom: 0, paddingLeft: 0, paddingRight: 10, color: '#fff', fontSize: 16, fontWeight: '600', fontFamily: 'AvenirLTStd-Roman', textAlign: 'right',}}
                                            autoCapitalize="none"
                                            underlineColorAndroid={'transparent'}
                                            autoCorrect={false}
                                            autoFocus={false}
                                            keyboardType='email-address'
                                            returnKeyLabel="next"
                                            placeholder='Enter Username'
                                            placeholderTextColor='#8D92BB'
                                            value={this.state.email}
                                            onChangeText={(text) => this.setState({ email: text })}  />
                                    </View>
                                    <View style={{flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#fff', marginBottom: 20,}}>
                                        <Text style={{fontSize: 16, color: '#fff', fontFamily: 'AvenirLTStd-Heavy', marginBottom: -15, marginRight: 5, }}>PASSWORD</Text>
                                        <TextInput
                                            style={{width: '65%', height: 40, backgroundColor: 'transparent', marginBottom: 0, paddingTop: 10, paddingBottom: 0, paddingLeft: 0, paddingRight: 10, color: '#fff', fontSize: 16, fontWeight: '600', fontFamily: 'AvenirLTStd-Roman', textAlign: 'right',}}
                                            autoCapitalize="none"
                                            underlineColorAndroid={'transparent'}
                                            autoCorrect={false}
                                            returnKeyLabel="go"
                                            placeholder='Enter Password'
                                            placeholderTextColor='#8D92BB'
                                            secureTextEntry={true}
                                            value={this.state.password}
                                            onChangeText={(text) => this.setState({ password: text })} />
                                    </View>
                                </View>
                                <View style={{flexDirection: 'row', paddingLeft: 5,}}>
                                    <Icon name={'question-circle'} size={15} color={'#EDD04B'} style={{paddingBottom: 10, paddingTop: 5,}}/>
                                    <Text style={{fontSize: 14, color: '#8D92BB', paddingBottom: 10, paddingLeft: 10, paddingTop: 7, fontWeight: '600', fontFamily: 'AvenirLTStd-Roman',}} onPress={() => {
                                        this.setState({
                                            modalVisible: true,
                                        })
                                    }}>FORGET PASSWORD</Text>
                                </View>
                            </View>
                            <View style={{alignItems: 'center', justifyContent: 'flex-end', }}>
                                <Spinner
                                    isVisible={this.state.spinnerVisible}
                                    type={'ThreeBounce'}
                                    color='#F4D549'
                                    size={30}/>
                            </View>
                        </ImageBackground>
                    </View>
                </View>
                <View style={{justifyContent: 'flex-end', backgroundColor: '#2C2E6D', marginTop: -25,}}>
                    <View style={{flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#F4D549',}}>
                        <TouchableOpacity
                            disabled={this.state.isSubmit}
                            style={this.state.isSubmit ? {backgroundColor: '#F4D549', paddingVertical: 20, width: '50%',} : {backgroundColor: '#2C2E6D', paddingVertical: 20, width: '50%',}}
                            onPress={(e) => this.userLogin(e)}>
                            <Text style={this.state.isSubmit ? {color: '#2C2E6D', textAlign: 'center', fontSize: 16, fontFamily: 'AvenirLTStd-Black',} : {color: '#fff', textAlign: 'center', fontSize: 16, fontFamily: 'AvenirLTStd-Black',}}>LOG IN</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={this.state.isRegister ? {backgroundColor: '#F4D549', paddingVertical: 20, width: '50%',} : {backgroundColor: '#2C2E6D', paddingVertical: 20, width: '50%',}}
                            onPress={() => {
                                this.setState({
                                    isRegister: true,
                                })
                                this.props.navigation.navigate('Register', { renderFunction: setTimeout(() => {
                                    this.setState({
                                        isRegister: false,
                                    })
                                }, 500)})
                            }}>
                            <Text style={this.state.isRegister ? {color: '#2C2E6D', textAlign: 'center', fontSize: 16, fontFamily: 'AvenirLTStd-Black',} : {color: '#fff', textAlign: 'center', fontSize: 16, fontFamily: 'AvenirLTStd-Black',}}>REGISTER</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        );
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

export default connect (mapStateToProps, mapDispatchToProps)(Login);