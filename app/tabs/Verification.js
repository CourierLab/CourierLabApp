import React, { Component } from 'react';
import { View, Text, Alert, ScrollView, TouchableOpacity, Linking, Platform, KeyboardAvoidingView, TextInput, } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialComIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import AntIcon from 'react-native-vector-icons/AntDesign';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import SimIcon from 'react-native-vector-icons/SimpleLineIcons';
import OctiIcon from 'react-native-vector-icons/Octicons';
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
        // title: 'Deliver Verification',
        headerTitle: <View style={{flexDirection: 'row',}}>
                <MaterialComIcon name="truck-delivery" size={19} color="#fff" style={{paddingLeft: 10, paddingRight: 10,}}/>
                <Text style={{color: '#fff', fontWeight: 'bold', fontFamily: 'AvenirLTStd-Black', fontSize: 15, paddingTop: 3,}}>Deliver Verification</Text>
            </View>,
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
                onPress: () => {
                    this.setState({
                        spinnerVisible: false,
                        isClicked: false,
                        isSubmit: false,
                    })
                },
            }], {cancelable: false});
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
                        onPress: () => {
                            this.setState({
                                spinnerVisible: false,
                                isClicked: false,
                                isSubmit: false,
                            })
                        },
                    }], {cancelable: false});
                    this.props.navigation.state.params.rerenderFunction();
                    this.props.navigation.goBack();
                }else{
                    Alert.alert('Cannot Verify', json.message, [{
                        text: 'OK',
                        onPress: () => {
                            this.setState({
                                spinnerVisible: false,
                                isClicked: false,
                                isSubmit: false,
                            })
                        },
                    }], {cancelable: false});
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
        let spinnerView = this.state.isClicked ? <View style={{alignItems: 'center', paddingBottom: 10, marginTop: 20,}}> 
                    <Spinner
                        isVisible={this.state.spinnerVisible}
                        type={'ThreeBounce'}
                        color='#F4D549'
                        size={30}/>
                </View> : <View/>;
        return(
            <KeyboardAvoidingView behavior="padding" style={styles.container}>
                {/* <View style={{flexDirection: 'row',}}>
                    <Text style={{fontSize: 15, color: '#3c4c96', textAlign: 'left', paddingBottom: 10,}}>Please key in Pin Number</Text>
                </View> */}
                {/* <View>
                    <TextInput
                        style={styles.input}
                        autoCapitalize="none"
                        autoCorrect={false}
                        underlineColorAndroid={'transparent'}
                        autoFocus={false}
                        keyboardType='default'
                        returnKeyLabel="go"
                        placeholder='Pin Number'
                        placeholderTextColor='#939ABA'
                        value={this.state.pin}
                        onChangeText={(text) => this.setState({ pin: text })}  />
                </View> */}
                <View>
                    <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'AvenirLTStd-Heavy',}}>Pin Number </Text>
                    <TextInput
                        style={{fontSize: 14, fontFamily: 'AvenirLTStd-Roman', color: '#3c4c96', borderColor: '#A3A9C4', borderWidth: 1, height: 40, paddingLeft: 10, paddingRight: 10,}}
                        autoCapitalize="none"
                        underlineColorAndroid={'transparent'}
                        autoCorrect={false}
                        returnKeyLabel="next"
                        keyboardType={'default'}
                        placeholder='Pin Number'
                        placeholderTextColor='#A3A9C4'
                        value={this.state.pin}
                        onChangeText={(text) => this.setState({ pin: text })} />
                </View>
                {spinnerView}
                <View style={this.state.isSubmit ? {backgroundColor: '#F4D549', borderRadius: 20, paddingLeft: 10, paddingRight: 10, marginLeft: 0, marginRight: 0, marginBottom: 20, marginTop: 20,} : {backgroundColor: '#2C2E6D', borderRadius: 20, paddingLeft: 10, paddingRight: 10, marginLeft: 0, marginRight: 0, marginBottom: 20, marginTop: 20,}}>
                    <TouchableOpacity
                        disabled={this.state.isSubmit}
                        style={this.state.isSubmit ? {backgroundColor: '#F4D549', borderRadius: 20, paddingVertical: 15,} : styles.buttonContainer}
                        onPress={(e) => this.submit(e)}>
                        <Text style={this.state.isSubmit ? {color: '#2C2E6D', textAlign: 'center', fontSize: 16, fontFamily: 'AvenirLTStd-Black',} : {color: '#fff', textAlign: 'center', fontSize: 16, fontFamily: 'AvenirLTStd-Black',}}>Submit</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        )
    }
};