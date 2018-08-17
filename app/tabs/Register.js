import React, { Component } from 'react';
import { Text, TextInput, View, Image, TouchableOpacity, KeyboardAvoidingView, Alert, ScrollView,  } from 'react-native';
import { styles } from '../utils/Style';
import NetworkConnection from '../utils/NetworkConnection';
import DeviceInfo from 'react-native-device-info';
import MyRealm from '../utils/Realm';
import Spinner from 'react-native-spinkit';

let myApiUrl = 'http://courierlabapi.azurewebsites.net/api/v1/MobileApi';
let registerPath = 'Register';
let deviceId = DeviceInfo.getUniqueID();
let realm = new MyRealm();
let loginAsset = realm.objects('LoginAsset');

export default class Register extends Component{
    static navigationOptions = {
        title: 'Registration',
    }

    constructor(props){
        super(props);
        this.state = {
            email: '',
            username: '',
            password: '',
            confirmPassword: '',
            spinnerVisible: false,
            isClicked: false,
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

    register(e){
        this.setState({
            spinnerVisible: true,
            isClicked: true,
        })

        if(this.state.email === "" || this.state.username === "" || this.state.password == "" || this.state.confirmPassword === ""){
            Alert.alert('Cannot Register', 'Please key in Username, Email Address, Password and Confirm Password', [{
                text: 'OK',
                onPress: () => {},
            }], {cancelable: false});
            this.setState({
                spinnerVisible: false,
                isClicked: false,
            })
        }else{
            if(this.state.password !== this.state.confirmPassword){
                Alert.alert('Cannot Register', 'Password and Confirm Password are not matched', [{
                    text: 'OK',
                    onPress: () => {},
                }], {cancelable: false});
                this.setState({
                    spinnerVisible: false,
                    isClicked: false,
                })
            }else{
                fetch(`${myApiUrl}/${registerPath}`, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username: this.state.username,
                        password: this.state.password,
                        email: this.state.email,
                    }),
                })
                .then((response) => response.json())
                .then((json) => {
                    console.log(json);
                    if(json.succeeded){
                        this.setState({
                            spinnerVisible: false,
                            isClicked: false,
                        })
                        Alert.alert('Successfully Registered', json.message, [{
                            text: 'OK',
                            onPress: () => {},
                        }], {cancelable: false});
                        this.props.navigation.goBack();
                    }else{
                        Alert.alert('Cannot Register', json.message, [{
                            text: 'OK',
                            onPress: () => {},
                        }], {cancelable: false});
                        this.setState({
                            spinnerVisible: false,
                            isClicked: false,
                        })
                    }
                }).catch(err => {
                    console.log(err);
                    this.setState({
                        spinnerVisible: false,
                        isClicked: false,
                    })
                })
            }
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
                            autoCorrect={false}
                            underlineColorAndroid={'transparent'}
                            autoFocus={true}
                            keyboardType='default'
                            returnKeyLabel="next"
                            placeholder='Username'
                            placeholderTextColor='#3c4c96'
                            value={this.state.username}
                            onChangeText={(text) => this.setState({ username: text })}  />
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
                        <TextInput
                            style={styles.input}
                            autoCapitalize="none"
                            autoCorrect={false}
                            underlineColorAndroid={'transparent'}
                            returnKeyLabel="next"
                            placeholder='Password'
                            placeholderTextColor='#3c4c96'
                            secureTextEntry={true}
                            value={this.state.password}
                            onChangeText={(text) => this.setState({ password: text })} />
                        <TextInput
                            style={styles.input}
                            autoCapitalize="none"
                            underlineColorAndroid={'transparent'}
                            autoCorrect={false}
                            returnKeyLabel="go"
                            placeholder='Confirm Password'
                            placeholderTextColor='#3c4c96'
                            secureTextEntry={true}
                            value={this.state.confirmPassword}
                            onChangeText={(text) => this.setState({ confirmPassword: text })} />
                    </View>
                    {spinnerView}
                    <View style={{paddingTop: 10,}}>
                        <TouchableOpacity
                            style={styles.buttonContainer}
                            onPress={(e) => this.register(e)}>
                            <Text style={styles.buttonText}>Register</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        )
    }
}
