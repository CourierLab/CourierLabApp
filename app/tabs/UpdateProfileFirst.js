import React, { Component } from 'react';
import { Text, TextInput, View, Image, TouchableOpacity, KeyboardAvoidingView, Alert, ScrollView,  } from 'react-native';
import { styles } from '../utils/Style';
import NetworkConnection from '../utils/NetworkConnection';
import DeviceInfo from 'react-native-device-info';
import MyRealm from '../utils/Realm';
import Spinner from 'react-native-spinkit';

let myApiUrl = 'http://courierlabapi.azurewebsites.net/api/v1/MobileApi';
let registerPath = 'UpdateProfile';
let deviceId = DeviceInfo.getUniqueID();
let realm = new MyRealm();
let loginAsset = realm.objects('LoginAsset');

export default class UpdateProfileFirst extends Component{
    static navigationOptions = {
        title: 'Update Profile',
    }

    constructor(props){
        super(props);
        this.state = {
            name: '',
            nric: '',
            phoneNumber: '',
            state: '',
            address: '',
            postcode: '',
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

    updateProfile(e){
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
        let spinnerView = this.state.isClicked ? <View style={styles.formSpinner}> 
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
                    <Text style={styles.titleText}>NOTE: Please key in your information for first time setup.</Text>
                        <TextInput
                            style={styles.input}
                            autoCapitalize="none"
                            autoCorrect={false}
                            underlineColorAndroid={'transparent'}
                            autoFocus={true}
                            keyboardType='default'
                            placeholder='Name'
                            placeholderTextColor='#3c4c96'
                            value={this.state.name}
                            onChangeText={(text) => this.setState({ name: text })}  />
                        <TextInput
                            style={styles.input}
                            autoCapitalize="none"
                            underlineColorAndroid={'transparent'}
                            autoCorrect={false}
                            keyboardType='default'
                            placeholder='NRIC'
                            placeholderTextColor='#3c4c96'
                            value={this.state.nric}
                            onChangeText={(text) => this.setState({ nric: text })}  />
                        <TextInput
                            style={styles.input}
                            autoCapitalize="none"
                            autoCorrect={false}
                            underlineColorAndroid={'transparent'}
                            placeholder='Phone Number'
                            keyboardType='default'
                            placeholderTextColor='#3c4c96'
                            value={this.state.phoneNumber}
                            onChangeText={(text) => this.setState({ phoneNumber: text })} />
                        <TextInput
                            style={styles.input}
                            autoCapitalize="none"
                            underlineColorAndroid={'transparent'}
                            autoCorrect={false}
                            placeholder='State'
                            keyboardType='default'
                            placeholderTextColor='#3c4c96'
                            value={this.state.state}
                            onChangeText={(text) => this.setState({ state: text })} />
                        <TextInput
                            style={styles.input}
                            autoCapitalize="none"
                            underlineColorAndroid={'transparent'}
                            autoCorrect={false}
                            placeholder='Address'
                            keyboardType='default'
                            placeholderTextColor='#3c4c96'
                            value={this.state.address}
                            onChangeText={(text) => this.setState({ address: text })} />
                        <TextInput
                            style={styles.input}
                            autoCapitalize="none"
                            underlineColorAndroid={'transparent'}
                            autoCorrect={false}
                            placeholder='Postcode'
                            keyboardType='numeric'
                            placeholderTextColor='#3c4c96'
                            value={this.state.postcode}
                            onChangeText={(text) => this.setState({ postcode: text })} />
                    </View>
                    {spinnerView}
                    <View style={{paddingTop: 10,}}>
                        <TouchableOpacity
                            style={styles.buttonContainer}
                            onPress={(e) => this.updateProfile(e)}>
                            <Text style={styles.buttonText}>Update Profile</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        )
    }
}
