import React, { Component } from 'react';
import { Text, TextInput, View, Image, TouchableOpacity, KeyboardAvoidingView, Alert, ScrollView,  } from 'react-native';
import { styles } from '../utils/Style';
import NetworkConnection from '../utils/NetworkConnection';
import DeviceInfo from 'react-native-device-info';
import MyRealm from '../utils/Realm';
import Spinner from 'react-native-spinkit';

let myApiUrl = 'http://courierlabapi.azurewebsites.net/api/v1/MobileApi';
let updateProfilePath = 'UpdateProfile';
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

        if(this.state.name === "" || this.state.nric === "" || this.state.phoneNumber == "" || this.state.state === "" || this.state.address === "" || this.state.postcode === ""){
            Alert.alert('Cannot Register', 'Please key in Name, NRIC, Phone Number, State, Address and Postcode', [{
                text: 'OK',
                onPress: () => {},
            }], {cancelable: false});
            this.setState({
                spinnerVisible: false,
                isClicked: false,
            })
        }else{
            fetch(`${myApiUrl}/${updateProfilePath}`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': this.props.navigation.getParam('accessToken'),
                },
                body: JSON.stringify({
                    name: this.state.name,
                    nRIC: this.state.nric,
                    phoneNumber: this.state.phoneNumber,
                    address: this.state.address,
                    state: this.state.state,
                    postCode: this.state.postcode,
                    roleId: this.props.navigation.getParam('roleId'),
                    deviceId: deviceId,
                    userId: this.props.navigation.getParam('userId'),
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
                    // realm.write(() => {
                    //     realm.create('LoginAsset', {
                    //         userId: json.results.userId,
                    //         accessToken: json.results.accessToken,
                    //         accessTokenExpiredDate: json.results.accessTokenExpiredDate,
                    //         refreshToken: json.results.refreshToken,
                    //         roleId: json.results.roleId,
                    //         roleName: json.results.roleName,
                    //         email: this.state.email,
                    //         loginUserId: json.results.shipper.shipperId,
                    //         loginUserName: json.results.shipper.shipperName,
                    //         loginUserNRIC: json.results.shipper.shipperNRIC,
                    //         loginUserPhoneNumber: json.results.shipper.shipperPhoneNumber,
                    //     })
                    // })
                    Alert.alert('Successfully Updated', json.message, [{
                        text: 'OK',
                        onPress: () => {},
                    }], {cancelable: false});
                    // this.props.navigation.navigate('UpdateProfileFirst');
                }else{
                    Alert.alert('Cannot Update', json.message, [{
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
            <KeyboardAvoidingView style={styles.container}>
                <ScrollView>
                    <View>
                    <Text style={{paddingBottom: 20, fontSize: 16, color: '#3c4c96', fontFamily: 'Raleway-Bold', }}>NOTE: Please key in your information for first time setup.</Text>
                        <TextInput
                            style={styles.input}
                            autoCapitalize="none"
                            autoCorrect={false}
                            underlineColorAndroid={'transparent'}
                            autoFocus={true}
                            keyboardType='default'
                            placeholder='Name'
                            placeholderTextColor='#939ABA'
                            value={this.state.name}
                            onChangeText={(text) => this.setState({ name: text })}  />
                        <TextInput
                            style={styles.input}
                            autoCapitalize="none"
                            underlineColorAndroid={'transparent'}
                            autoCorrect={false}
                            keyboardType='default'
                            placeholder='NRIC'
                            placeholderTextColor='#939ABA'
                            value={this.state.nric}
                            onChangeText={(text) => this.setState({ nric: text })}  />
                        <TextInput
                            style={styles.input}
                            autoCapitalize="none"
                            autoCorrect={false}
                            underlineColorAndroid={'transparent'}
                            placeholder='Phone Number'
                            keyboardType='default'
                            placeholderTextColor='#939ABA'
                            value={this.state.phoneNumber}
                            onChangeText={(text) => this.setState({ phoneNumber: text })} />
                        <TextInput
                            style={styles.input}
                            autoCapitalize="none"
                            underlineColorAndroid={'transparent'}
                            autoCorrect={false}
                            placeholder='State'
                            keyboardType='default'
                            placeholderTextColor='#939ABA'
                            value={this.state.state}
                            onChangeText={(text) => this.setState({ state: text })} />
                        <TextInput
                            style={styles.input}
                            autoCapitalize="none"
                            underlineColorAndroid={'transparent'}
                            autoCorrect={false}
                            placeholder='Address'
                            keyboardType='default'
                            placeholderTextColor='#939ABA'
                            value={this.state.address}
                            onChangeText={(text) => this.setState({ address: text })} />
                        <TextInput
                            style={styles.input}
                            autoCapitalize="none"
                            underlineColorAndroid={'transparent'}
                            autoCorrect={false}
                            placeholder='Postcode'
                            keyboardType='numeric'
                            placeholderTextColor='#939ABA'
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
