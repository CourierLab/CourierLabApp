import React, { Component } from 'react';
import { Text, TextInput, View, Image, TouchableOpacity, KeyboardAvoidingView, Alert, ScrollView,  } from 'react-native';
import { styles } from '../utils/Style';
import NetworkConnection from '../utils/NetworkConnection';
import DeviceInfo from 'react-native-device-info';
import MyRealm from '../utils/Realm';
import Spinner from 'react-native-spinkit';

let myApiUrl = 'http://courierlabapi.azurewebsites.net/api/v1/MobileApi';
let forgotPasswordPath = 'ForgotPassword';
let deviceId = DeviceInfo.getUniqueID();
let realm = new MyRealm();
let loginAsset = realm.objects('LoginAsset');

export default class ForgotPassword extends Component{
    static navigationOptions = {
        title: 'Forgot Password',
    }

    constructor(props){
        super(props);
        this.state = {
            email: '',
            spinnerVisible: false,
            isClicked: false,
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

    forgotPassword(e){
        this.setState({
            spinnerVisible: true,
            isClicked: true,
            isSubmit: true,
        })

        if(this.state.email === ""){
            Alert.alert('Failed to Forgot Password', 'Please key in Email Address', [{
                text: 'OK',
                onPress: () => {},
            }], {cancelable: false});
            this.setState({
                spinnerVisible: false,
                isClicked: false,
                isSubmit: false,
            })
        }else{
            fetch(`${myApiUrl}/${forgotPasswordPath}?emailAddress=` + this.state.email, {
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
                    this.setState({
                        spinnerVisible: false,
                        isClicked: false,
                        isSubmit: false,
                    })
                    Alert.alert('Successfully Forgot Password', json.message, [{
                        text: 'OK',
                        onPress: () => {},
                    }], {cancelable: false});
                    this.props.navigation.goBack();
                }else{
                    Alert.alert('Failed to Forgot Password', json.message, [{
                        text: 'OK',
                        onPress: () => {},
                    }], {cancelable: false});
                    this.setState({
                        spinnerVisible: false,
                        isClicked: false,
                        isSubmit: false,
                    })
                }
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
        let spinnerView = this.state.isClicked ? <View style={{alignItems: 'center',}}> 
                    <Spinner
                        isVisible={this.state.spinnerVisible}
                        type={'9CubeGrid'}
                        color='#3c4c96'
                        paddingLeft={20}
                        size={50}/>
                </View> : <View/>;
        return(
            <KeyboardAvoidingView style={styles.container}>
                <ScrollView>
                    <View>
                        <TextInput
                            style={styles.input}
                            autoCapitalize="none"
                            underlineColorAndroid={'transparent'}
                            autoCorrect={false}
                            keyboardType='email-address'
                            returnKeyLabel="next"
                            placeholder='Email Address'
                            placeholderTextColor='#3c4c96'
                            value={this.state.email}
                            onChangeText={(text) => this.setState({ email: text })}  />
                    </View>
                    {spinnerView}
                    <View style={{paddingTop: 10,}}>
                        <TouchableOpacity
                            disabled={this.state.isSubmit}
                            style={this.state.isSubmit ? {backgroundColor: '#7D839C', paddingVertical: 15,} : styles.buttonContainer}
                            onPress={(e) => this.forgotPassword(e)}>
                            <Text style={styles.buttonText}>Forgot Password</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        )
    }
}
