import React, { Component } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, TextInput, Dimensions, } from 'react-native';
import { styles } from '../utils/Style';
import NetworkConnection from '../utils/NetworkConnection';
import DeviceInfo from 'react-native-device-info';
import MyRealm from '../utils/Realm';
import { Avatar } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import Spinner from 'react-native-spinkit';
import { connect } from 'react-redux';
import { login, logout } from '../utils/Actions';
import OneSignal from 'react-native-onesignal';

let myApiUrl = 'http://courierlabapi.azurewebsites.net/api/v1/MobileApi';
let logOutPath = 'Logout';
let deviceId = DeviceInfo.getUniqueID();
let realm = new MyRealm();
let loginAsset = realm.objects('LoginAsset');
let deviceVersion = DeviceInfo.getVersion();
let {height, width} = Dimensions.get('window');

class Profile extends Component{
    static navigationOptions = {
        title: 'Profile',
        headerRight: (
            <Icon onPress={() => _this.props.navigation.navigate('UpdateProfile', { rerenderFunction : () => _this.getProfile() })} name={'pencil'} size={25} color={'#fff'} style={{paddingRight: 20,}}/>
        ),
    };
    
    constructor(props){
        super(props);
        this.state = {
            spinnerVisible: false,
            isSubmit: false,
            name: '',
            nric: '',
            phoneNumber: '',
            bank: '',
            bankAccountNumber: '',
            driverImage: '',
            driverIcImage: '',
            driverLicenseImage: '',
        };
        _this = this;
    }

    componentDidMount() {
        setTimeout(() => {
            this.checkInternetConnection();
        }, 500);
        this.getProfile();
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

    getProfile(){
        this.setState({
            name: loginAsset[0].loginUserName,
            nric: loginAsset[0].loginUserNRIC,
            phoneNumber: loginAsset[0].loginUserPhoneNumber,
            bank: loginAsset[0].bankName,
            bankAccountNumber: loginAsset[0].bankAccountNumber,
            driverImage: loginAsset[0].driverImage,
            driverIcImage: loginAsset[0].driverICImage,
            driverLicenseImage: loginAsset[0].driverLicenseImage,
        })
    }

    userLogout(e){
        this.setState({
            spinnerVisible: true,
            isSubmit: true,
        })
        console.log(loginAsset[0]);
        fetch(`${myApiUrl}/${logOutPath}`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': loginAsset[0].accessToken,
            },
            body: JSON.stringify({
                userId: loginAsset[0].userId,
                deviceId: deviceId,
            }),
        })
        .then((response) => response.json())
        .then((json) => {
            console.log(json);
            if(json.succeeded){
                realm.write(() => {
                    realm.delete(loginAsset);
                })
                this.setState({ 
                    spinnerVisible: false,
                    isSubmit: false,
                });
                OneSignal.deleteTag("userId");
                this.props.onLogout();
            }else{
                Alert.alert('Cannot Logout', json.message, [{
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
            this.setState({ 
                spinnerVisible: false, 
                isSubmit: false,
            });
        });
        e.preventDefault();
    }

    render(){
        console.log('ic ', this.state.driverIcImage)
        console.log('license ', this.state.driverLicenseImage)
        return(
            <ScrollView style={styles.container}>
                {
                    (this.state.driverImage !== '') ? <View style={{flexDirection: 'row', paddingBottom: 0, paddingTop: 0, justifyContent: 'center', }}>
                        <Avatar
                            size="xlarge"
                            rounded
                            source={{uri: this.state.driverImage}}
                            onPress={() => console.log("Works!")}
                            activeOpacity={0.7}
                        />
                    </View> : <View/>
                }
                <View>
                    <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Name: </Text>
                    <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 20, fontFamily: 'Raleway-Regular',}}>{this.state.name}</Text>

                    <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 15, fontFamily: 'Raleway-Bold',}}>NRIC: </Text>
                    <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 20, fontFamily: 'Raleway-Regular',}}>{this.state.nric}</Text>

                    <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Phone Number: </Text>
                    <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 20, fontFamily: 'Raleway-Regular',}}>{this.state.phoneNumber}</Text>

                    <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Bank: </Text>
                    <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 20, fontFamily: 'Raleway-Regular',}}>{this.state.bank}</Text>

                    <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Bank Account Number: </Text>
                    <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 20, fontFamily: 'Raleway-Regular',}}>{this.state.bankAccountNumber}</Text>

                    {
                        (this.state.driverIcImage != '') ? <View style={{flexDirection: 'column',}}>
                            <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Driver IC: </Text>
                                <View style={{flexDirection: 'row', paddingBottom: 10, paddingTop: 0, paddingLeft: 5, paddingRight: 5, justifyContent: 'flex-start', }}>
                                <Avatar
                                    size={width-100}
                                    source={{uri: this.state.driverIcImage}}
                                    activeOpacity={0.7}
                                />
                            </View>
                        </View> : <View />
                    }

                    {
                        (this.state.driverLicenseImage != '') ? <View style={{flexDirection: 'column',}}>
                            <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Driver License: </Text>
                                <View style={{flexDirection: 'row', paddingBottom: 10, paddingTop: 0, paddingLeft: 5, paddingRight: 5, justifyContent: 'flex-start', }}>
                                <Avatar
                                    size={width-100}
                                    source={{uri: this.state.driverLicenseImage}}
                                    activeOpacity={0.7}
                                />
                            </View>
                        </View> : <View />
                    }

                    <Text style={{paddingLeft: 5, paddingTop: 10, paddingBottom: 0, paddingRight: 5, color: '#3c4c96', fontSize: 18, fontFamily: 'Raleway-Bold', justifyContent: 'flex-start', textDecorationLine: 'underline', alignSelf: 'flex-start',}}
                        onPress={() => this.props.navigation.navigate('Lorry')}>
                        My Lorry Information
                    </Text>
                </View>
                <View style={this.state.isSubmit ? {backgroundColor: '#7D839C', paddingLeft: 10, paddingRight: 10, marginTop: 40, marginLeft: 0, marginRight: 0, marginBottom: 10,} : {backgroundColor: '#3c4c96', paddingLeft: 10, paddingRight: 10, marginTop: 40, marginLeft: 0, marginRight: 0, marginBottom: 10,}}>
                    <TouchableOpacity
                        disabled={this.state.isSubmit}
                        style={this.state.isSubmit ? {backgroundColor: '#7D839C', paddingVertical: 15,} : styles.buttonContainer}
                        onPress={(e) => this.userLogout(e)}>
                        <Text style={styles.buttonText}>Log Out</Text>
                    </TouchableOpacity>
                </View>
                <View>
                    <Text style={{paddingTop:10, paddingBottom: 30, textAlign: 'center', fontSize: 12, color: '#3c4c96', fontFamily: 'Raleway-Bold',}}>App version: {deviceVersion}</Text>
                </View>
            </ScrollView>
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
        onLogout: () => { dispatch(logout()); },
    }
}

export default connect (mapStateToProps, mapDispatchToProps)(Profile);