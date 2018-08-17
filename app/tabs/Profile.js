import React, { Component } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, } from 'react-native';
import { styles } from '../utils/Style';
import NetworkConnection from '../utils/NetworkConnection';
import DeviceInfo from 'react-native-device-info';
import MyRealm from '../utils/Realm';
import { Avatar } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import Spinner from 'react-native-spinkit';
import { connect } from 'react-redux';
import { login, logout } from '../utils/Actions';

let myApiUrl = 'http://courierlabapi.azurewebsites.net/api/v1/MobileApi';
let logOutPath = 'Logout';
let deviceId = DeviceInfo.getUniqueID();
let realm = new MyRealm();
let loginAsset = realm.objects('LoginAsset');
let deviceVersion = DeviceInfo.getVersion();

class Profile extends Component{
    static navigationOptions = {
        title: 'Profile',
    };
    
    constructor(props){
        super(props);
        this.state = {
            spinnerVisible: false,
        };
    }

    componentDidMount() {
        setTimeout(() => {
            this.checkInternetConnection();
        }, 500);
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

    userLogout(e){
        this.setState({
            spinnerVisible: true,
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
                });
                this.props.onLogout();
            }else{
                Alert.alert('Cannot Logout', json.message, [{
                    text: 'OK',
                    onPress: () => {},
                    style: styles.alertText,
                }], {cancelable: false});
                this.setState({ 
                    spinnerVisible: false, 
                });
            }
        }).catch(err => {
            console.log(err);
        });
        e.preventDefault();
    }

    render(){
        return(
            <ScrollView style={styles.container}>
                <View style={{justifyContent:'center', alignItems: 'center',}}>
                    <Avatar
                    size="xlarge"
                    rounded
                    source={{uri: "https://s3.amazonaws.com/uifaces/faces/twitter/adhamdannaway/128.jpg"}}
                    onPress={() => console.log("Works!")}
                    activeOpacity={0.7}
                    />
                    <Text style={{fontSize: 20, paddingTop: 10, paddingBottom: 10, color: '#3c4c96', fontFamily: 'Raleway-Bold', }}>Jeffery Leo</Text>
                    <Text style={{fontSize: 15, paddingTop: 0, paddingBottom: 10, color: '#3c4c96', fontFamily: 'Raleway-Regular', }}>012-1234567</Text>
                </View>
                
                <View style={{justifyContent:'center', alignItems: 'flex-start', paddingTop: 40, marginLeft: 10, marginRight: 10,}}>
                    <View style={{flexDirection: 'row', paddingTop: 10, paddingBottom: 10,}}>
                        <Icon name={'envelope'} size={18} color={'#3c4c96'} />
                        <Text style={{fontSize: 18, color: '#3c4c96', fontFamily: 'Raleway-BoldItalic', }}>   jefferyleo@gmail.com</Text>
                    </View>
                    <View style={{flexDirection: 'row', paddingTop: 10, paddingBottom: 10,}}>
                        <Icon name={'automobile'} size={18} color={'#3c4c96'} />
                        <Text style={{fontSize: 18, color: '#3c4c96', fontFamily: 'Raleway-BoldItalic', }}>  Silver Honda Civic Turbo</Text>
                    </View>
                    <View style={{flexDirection: 'row', paddingTop: 10, paddingBottom: 10,}}>
                        <Icon name={'road'} size={18} color={'#3c4c96'} />
                        <Text style={{fontSize: 18, color: '#3c4c96', fontFamily: 'Raleway-BoldItalic', }}>  ABC 1234</Text>
                    </View>
                    <View style={{flexDirection: 'row', paddingTop: 10, paddingBottom: 10,}}>
                        <Icon name={'id-card'} size={18} color={'#3c4c96'} />
                        <Text style={{fontSize: 18, color: '#3c4c96', fontFamily: 'Raleway-BoldItalic', }}>  930101-10-1111</Text>
                    </View>
                    <View style={{flexDirection: 'row', paddingTop: 10, paddingBottom: 10,}}>
                        <Icon name={'calendar'} size={18} color={'#3c4c96'} />
                        <Text style={{fontSize: 18, color: '#3c4c96', fontFamily: 'Raleway-BoldItalic', }}>  1 May 2018</Text>
                    </View>
                </View>
                <View style={{backgroundColor: '#3c4c96', paddingLeft: 10, paddingRight: 10, marginTop: 40, marginLeft: 0, marginRight: 0, marginBottom: 10,}}>
                    <TouchableOpacity
                        style={styles.buttonContainer}
                        onPress={(e) => this.userLogout(e)}>
                        <Text style={styles.buttonText}>Log Out</Text>
                    </TouchableOpacity>
                </View>
                <View>
                    <Text style={{paddingTop:10, paddingBottom: 10, textAlign: 'center', fontSize: 12, color: '#3c4c96', fontFamily: 'Raleway-Bold',}}>App version: {deviceVersion}</Text>
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