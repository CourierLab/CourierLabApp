import React, { Component } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, TextInput, } from 'react-native';
import { styles } from '../utils/Style';
import NetworkConnection from '../utils/NetworkConnection';
import DeviceInfo from 'react-native-device-info';
import MyRealm from '../utils/Realm';
import Spinner from 'react-native-spinkit';
import OneSignal from 'react-native-onesignal';

let myApiUrl = 'http://courierlabapi.azurewebsites.net/api/v1/MobileApi';
let updateProfilePath = 'UpdateProfile';
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
        };
    }

    componentDidMount() {
        setTimeout(() => {
            this.checkInternetConnection();
        }, 500);
        this.setState({
            name: loginAsset[0].driverName,
            nric: loginAsset[0].driverNRIC,
            phoneNumber: loginAsset[0].driverPhoneNumber,
        })
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

    updateProfile(e){
        this.setState({
            spinnerVisible: true,
            isClicked: true,
            isSubmit: true,
        })
        console.log(loginAsset[0]);
        if(this.state.name === '' || this.state.nric === '' || this.state.phoneNumber === ''){
            Alert.alert('Cannot Update', "Please key in Name, NRIC and Phone Number", [{
                text: 'OK',
                onPress: () => {},
            }], {cancelable: false});
            this.setState({
                spinnerVisible: false,
                isClicked: false,
                isSubmit: false,
            })
        }else{
            fetch(`${myApiUrl}/${updateProfilePath}`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': loginAsset[0].accessToken,
                },
                body: JSON.stringify({
                    userId: loginAsset[0].userId,
                    deviceId: deviceId,
                    driverId: loginAsset[0].driverId,
                    roleId: loginAsset[0].roleId,
                    name: this.state.name,
                    nRIC: this.state.nric,
                    phoneNumber: this.state.phoneNumber,
                }),
            })
            .then((response) => response.json())
            .then((json) => {
                console.log(json);
                if(json.succeeded){
                    realm.write(() => {
                        loginAsset[0].driverName = this.state.name;
                        loginAsset[0].driverNRIC = this.state.nric;
                        loginAsset[0].driverPhoneNumber = this.state.phoneNumber;
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
            <ScrollView style={styles.container}>
                <View>
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
                {
                    (this.state.isClicked) ? <View style={{alignItems: 'center', paddingBottom: 10, marginTop: 20,}}> 
                        <Spinner
                            isVisible={this.state.spinnerVisible}
                            type={'9CubeGrid'}
                            color='#3c4c96'
                            paddingLeft={20}
                            size={50}/>
                    </View> : <View/>
                }
                <View style={this.state.isSubmit ? {backgroundColor: '#7D839C', paddingLeft: 10, paddingRight: 10, marginTop: 10, marginLeft: 0, marginRight: 0, marginBottom: 10,} : {backgroundColor: '#3c4c96', paddingLeft: 10, paddingRight: 10, marginTop: 10, marginLeft: 0, marginRight: 0, marginBottom: 10,}}>
                    <TouchableOpacity
                        disabled={this.state.isSubmit}
                        style={this.state.isSubmit ? {backgroundColor: '#7D839C', paddingVertical: 15,} : styles.buttonContainer}
                        onPress={(e) => this.updateProfile(e)}>
                        <Text style={styles.buttonText}>Update</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        )
    }
}