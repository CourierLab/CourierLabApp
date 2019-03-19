import React, { Component } from 'react';
import { connect } from 'react-redux';
import { ScrollView, Text, TextInput,  View, Platform, Image, TouchableOpacity, KeyboardAvoidingView, Alert } from 'react-native';
import { styles } from '../utils/Style';
import { login, logout } from '../utils/Actions';
import NetworkConnection from '../utils/NetworkConnection';
import DeviceInfo from 'react-native-device-info';
import MyRealm from '../utils/Realm';
import Spinner from 'react-native-spinkit';
import OneSignal from 'react-native-onesignal';

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
        };
    }

    componentWillMount(){
        console.log(loginAsset[0]);
        console.log(DeviceInfo.getModel())
        let now = new Date();
        if(loginAsset[0] !== undefined){
            if(new Date(loginAsset[0].accessTokenExpiredDate) < now){
                //refresh token
                console.log('expired token calling');
                fetch(`${myApiUrl}/${refreshTokenPath}?userId=` + loginAsset[0].userId + `&deviceId=` + deviceId, {
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
                        Alert.alert('Login Expired', 'Please try to login again', [{
                            text: 'OK',
                            onPress: () => {},
                            style: styles.alertText,
                        }], {cancelable: false});
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
                onPress: () => {},
                style: styles.alertText,
            }], {cancelable: false});
            this.setState({
                spinnerVisible: false,
                isSubmit: false,
            })
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
                                    lorryLengthId: json.results.driver.lorry.lorryLengthId,
                                    lorryLengthAmount: json.results.driver.lorry.lorryLengthAmount,
                                    lorryName: json.results.driver.lorry.lorryName,
                                    lorryPlateNumber: json.results.driver.lorry.lorryPlateNumber,
                                    lorryTypeId: json.results.driver.lorry.lorryTypeId,
                                    lorryTypeName: json.results.driver.lorry.lorryTypeName,
                                    lorryWeightId: json.results.driver.lorry.lorryWeightId,
                                    lorryWeigthAmount: json.results.driver.lorry.lorryWeightAmount,
                                    bankId: json.results.driver.bankId,
                                    bankName: json.results.driver.bankName,
                                    bankAccountNumber: json.results.driver.bankAccountNumber,
                                    driverImage: json.results.driver.driverImage,
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
                        onPress: () => {},
                        style: styles.alertText,
                    }], {cancelable: false});
                    this.setState({ 
                        spinnerVisible: false, 
                        isSubmit: false,
                    });
                }
            }).catch(err => {
                console.log(err);
            });
        }
        e.preventDefault();
    }

    render(){
        let alt = (this.state.route === 'Login') ? 'ForgotPassword' : 'Login';
        console.log(deviceModel == 'iPhone 5s');
        let iosView = (deviceModel == 'iPhone 5s') ? <KeyboardAvoidingView behavior="padding" style={{backgroundColor: '#fff', padding: 20,}}>
        <ScrollView>
        <View style={styles.loginContainer}>
            <Image resizeMode="contain" style={styles.logo} source={require('../assets/logoBackground.png')} />
            <Text style={[styles.title, {color: '#fff'}]}>LINERS</Text>
        </View>
        <View style={styles.spinnerView}>
            <Spinner
                isVisible={this.state.spinnerVisible}
                type={'9CubeGrid'}
                color='#3c4c96'
                paddingLeft={20}
                size={50}/>
        </View>
        <View style={styles.formContainer}>
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
            <Text style={{fontSize: 17, color: '#3c4c96', textAlign: 'center', paddingLeft: 10, paddingRight: 10, paddingTop: 0, paddingBottom: 10, fontFamily: 'Raleway-Bold',}} onPress={() => this.props.navigation.navigate('Register')}>Register as Shipper</Text>
        </View>
        </ScrollView>
    </KeyboardAvoidingView> : <KeyboardAvoidingView behavior="padding" style={{flex: 1, backgroundColor: '#fff', padding: 20,}}>
        <View style={styles.loginContainer}>
            <Image resizeMode="contain" style={styles.logo} source={require('../assets/logoBackground.png')} />
            <Text style={[styles.title, {color: '#fff'}]}>LINERS</Text>
        </View>
        <View style={styles.spinnerView}>
            <Spinner
                isVisible={this.state.spinnerVisible}
                type={'9CubeGrid'}
                color='#3c4c96'
                paddingLeft={20}
                size={50}/>
        </View>
        <View style={styles.formContainer}>
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
            <Text style={{fontSize: 17, color: '#3c4c96', textAlign: 'center', paddingLeft: 10, paddingRight: 10, paddingTop: 0, paddingBottom: 10, fontFamily: 'Raleway-Bold',}} onPress={() => this.props.navigation.navigate('Register')}>Register as Shipper</Text>
        </View>
    </KeyboardAvoidingView>
        return(
            (Platform.OS === 'ios') ? iosView : <KeyboardAvoidingView style={{flex: 1, backgroundColor: '#fff', padding: 20,}}>
                <View style={styles.loginContainer}>
                    <Image resizeMode="contain" style={styles.logo} source={require('../assets/logoBackground.png')} />
                    <Text style={[styles.title, {color: '#fff'}]}>LINERS</Text>
                </View>
                <View style={styles.spinnerView}>
                    <Spinner
                        isVisible={this.state.spinnerVisible}
                        type={'9CubeGrid'}
                        color='#3c4c96'
                        paddingLeft={20}
                        size={50}/>
                </View>
                <View style={styles.formContainer}>
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
                    <Text style={{fontSize: 17, color: '#3c4c96', textAlign: 'center', paddingLeft: 10, paddingRight: 10, paddingTop: 0, paddingBottom: 10, fontFamily: 'Raleway-Bold',}} onPress={() => this.props.navigation.navigate('Register')}>Register as Shipper</Text>
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