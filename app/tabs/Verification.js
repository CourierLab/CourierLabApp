import React, { Component } from 'react';
import { View, Text, Alert, ScrollView, TouchableOpacity, Linking, Platform, KeyboardAvoidingView, TextInput, } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import NetworkConnection from '../utils/NetworkConnection';
import DeviceInfo from 'react-native-device-info';
import MyRealm from '../utils/Realm';
import { styles } from '../utils/Style';
import Spinner from 'react-native-spinkit';

let myApiUrl = 'http://courierlabapi.azurewebsites.net/api/v1/MobileApi';
let verificationPath = 'DeliveredVerificationCode';
let deviceId = DeviceInfo.getUniqueID();
let realm = new MyRealm();
let loginAsset = realm.objects('LoginAsset');

export default class Verification extends Component{
    static navigationOptions = {
        title: 'Deliver Verification',
    }

    constructor(props){
        super(props);
        this.state = {
            spinnerVisible: false,
            isClicked: false,
            pin: '',
            isSubmit: false,
        }
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

    submit(e){
        this.setState({
            spinnerVisible: true,
            isClicked: true,
            isSubmit: true,
        })

        if(this.state.pin === ""){
            Alert.alert('Cannot Verify', 'Please key in Pin Number', [{
                text: 'OK',
                onPress: () => {},
            }], {cancelable: false});
            this.setState({
                spinnerVisible: false,
                isClicked: false,
                isSubmit: false,
            })
        }else{
            fetch(`${myApiUrl}/${verificationPath}?deviceId=` + deviceId + `&userId=` + loginAsset[0].userId + `&shipperOrderId=` + this.props.navigation.getParam('shipperOrderId') + `&pin=` + this.state.pin, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': loginAsset[0].accessToken,
                },
            })
            .then((response) => response.json())
            .then((json) => {
                console.log(json);
                if(json.succeeded){
                    Alert.alert('Successfully Verified', json.message, [{
                        text: 'OK',
                        onPress: () => {},
                    }], {cancelable: false});
                    this.props.navigation.state.params.rerenderFunction();
                    this.props.navigation.goBack();
                }else{
                    Alert.alert('Cannot Verify', json.message, [{
                        text: 'OK',
                        onPress: () => {},
                    }], {cancelable: false});
                }
                this.setState({
                    spinnerVisible: false,
                    isClicked: false,
                    isSubmit: false,
                })
            }).catch(err => {
                console.log(err);
                this.setState({
                    spinnerVisible: false,
                    isClicked: false,
                    isSubmit: false,
                })
            })
            e.preventDefault();
        }
    }

    render(){
        let spinnerView = this.state.isClicked ? <View style={{alignItems: 'center', paddingBottom: 10, marginTop: 20,}}> 
                    <Spinner
                        isVisible={this.state.spinnerVisible}
                        type={'9CubeGrid'}
                        color='#3c4c96'
                        paddingLeft={20}
                        size={50}/>
                </View> : <View/>;
        return(
            <KeyboardAvoidingView behavior="padding" style={styles.container}>
                <View style={{flexDirection: 'row',}}>
                    <Text style={{fontSize: 15, color: '#3c4c96', textAlign: 'left', paddingBottom: 10,}}>Please key in Pin Number</Text>
                </View>
                <View>
                    <TextInput
                        style={styles.input}
                        autoCapitalize="none"
                        autoCorrect={false}
                        underlineColorAndroid={'transparent'}
                        autoFocus={false}
                        keyboardType='default'
                        returnKeyLabel="go"
                        placeholder='Pin Number'
                        placeholderTextColor='#3c4c96'
                        value={this.state.pin}
                        onChangeText={(text) => this.setState({ pin: text })}  />
                </View>
                {spinnerView}
                <View style={{paddingTop: 10,}}>
                    <TouchableOpacity
                        disabled={this.state.isSubmit}
                        style={this.state.isSubmit ? {backgroundColor: '#7D839C', paddingVertical: 15,} : styles.buttonContainer}
                        onPress={(e) => this.submit(e)}>
                        <Text style={styles.buttonText}>Submit</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        )
    }
};