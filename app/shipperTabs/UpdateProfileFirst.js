import React, { Component } from 'react';
import { Text, TextInput, View, Image, TouchableOpacity, KeyboardAvoidingView, Alert, ScrollView, Platform, } from 'react-native';
import { styles } from '../utils/Style';
import NetworkConnection from '../utils/NetworkConnection';
import DeviceInfo from 'react-native-device-info';
import MyRealm from '../utils/Realm';
import Spinner from 'react-native-spinkit';
import { connect } from 'react-redux';
import { login, logout } from '../utils/Actions';
import { TextInputMask } from 'react-native-masked-text';

let myApiUrl = 'http://courierlabapi.azurewebsites.net/api/v1/MobileApi';
let updateProfilePath = 'UpdateProfile';
let deviceId = DeviceInfo.getUniqueID();
let realm = new MyRealm();
let loginAsset = realm.objects('LoginAsset');

class UpdateProfileFirst extends Component{
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
            var bodyData = new FormData();
            bodyData.append('name', this.state.name);
            bodyData.append('nRIC', this.state.nric);
            bodyData.append('phoneNumber', this.state.phoneNumber);
            bodyData.append('address', this.state.address);
            bodyData.append('state', this.state.state);
            bodyData.append('postCode', this.state.postcode);
            bodyData.append('roleId', this.props.navigation.getParam('roleId'));
            bodyData.append('firstTimeLogin', true);
            bodyData.append('deviceId', deviceId);
            bodyData.append('userId', this.props.navigation.getParam('userId'));
            console.log(bodyData);

            fetch(`${myApiUrl}/${updateProfilePath}`, {
                method: 'POST',
                headers: {
                    // 'Accept': 'application/json',
                    'Content-Type': 'multipart/form-data',
                    // 'Authorization': this.props.navigation.getParam('accessToken'),
                },
                body: bodyData,
                // body: JSON.stringify({
                //     name: this.state.name,
                //     nric: this.state.nric,
                //     phoneNumber: this.state.phoneNumber,
                //     address: this.state.address,
                //     state: this.state.state,
                //     postCode: this.state.postcode,
                //     roleId: this.props.navigation.getParam('roleId'),
                //     firstTimeLogin: true,
                //     deviceId: deviceId,
                //     userId: this.props.navigation.getParam('userId'),
                // }),
            })
            .then((response) => response.json())
            .then((json) => {
                console.log(json);
                if(json.succeeded){
                    this.setState({
                        spinnerVisible: false,
                        isClicked: false,
                    })
                    realm.write(() => {
                        realm.create('LoginAsset', {
                            userId: this.props.navigation.getParam('userId'),
                            accessToken: this.props.navigation.getParam('accessToken').toString(),
                            accessTokenExpiredDate: this.props.navigation.getParam('accessTokenExpiredDate').toString(),
                            refreshToken: this.props.navigation.getParam('refreshToken').toString(),
                            roleId: this.props.navigation.getParam('roleId'),
                            roleName: this.props.navigation.getParam('roleName').toString(),
                            email: this.props.navigation.getParam('email').toString(),
                            loginUserId: json.results.shipperId,
                            loginUserName: json.results.shipperName,
                            loginUserNRIC: json.results.shipperNRIC,
                            loginUserPhoneNumber: json.results.shipperPhoneNumber,
                            loginUserAddress: json.results.shipperAddress,
                            loginUserState: json.results.shipperState,
                            loginUserPostcode: json.results.shipperPostCode,
                        })
                    })
                    Alert.alert('Successfully Updated', json.message, [{
                        text: 'OK',
                        onPress: () => {
                            this.props.onLogin(this.props.navigation.getParam('email'));
                        },
                    }], {cancelable: false});
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
            (Platform.OS === 'ios') ? <KeyboardAvoidingView behavior="padding" style={styles.container}>
                <ScrollView>
                    <View>
                        <Text style={{paddingBottom: 20, fontSize: 16, color: '#3c4c96', fontFamily: 'Raleway-Bold', }}>NOTE: Please key in your information for first time setup.</Text>
                        <View>
                            <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Name: </Text>
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
                        </View>
                        <View>
                            <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>NRIC: </Text>
                            {/* <TextInput
                                style={styles.input}
                                autoCapitalize="none"
                                underlineColorAndroid={'transparent'}
                                autoCorrect={false}
                                keyboardType='default'
                                placeholder='NRIC'
                                placeholderTextColor='#939ABA'
                                value={this.state.nric}
                                onChangeText={(text) => this.setState({ nric: text })}  /> */}
                            <TextInputMask
                                style={styles.input}
                                underlineColorAndroid={'transparent'}
                                keyboardType='default'
                                placeholder='NRIC'
                                placeholderTextColor='#8E9495'
                                type={'custom'}
                                options={{
                                    mask: '999999-99-9999', 
                                }}
                                value={this.state.nric}
                                onChangeText={text => {
                                    this.setState({
                                        nric: text
                                    })
                                }}
                            />
                        </View>
                        <View>
                            <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Phone Number: </Text>
                            {/* <TextInput
                                style={styles.input}
                                autoCapitalize="none"
                                autoCorrect={false}
                                underlineColorAndroid={'transparent'}
                                placeholder='Phone Number'
                                keyboardType='default'
                                placeholderTextColor='#939ABA'
                                value={this.state.phoneNumber}
                                onChangeText={(text) => this.setState({ phoneNumber: text })} /> */}
                            <TextInputMask
                                style={styles.input}
                                underlineColorAndroid={'transparent'}
                                keyboardType='default'
                                placeholder='Phone Number'
                                placeholderTextColor='#8E9495'
                                type={'custom'}
                                options={{
                                    mask: '999-99999999', 
                                }}
                                value={this.state.phoneNumber}
                                onChangeText={text => {
                                    this.setState({
                                        phoneNumber: text
                                    })
                                }}
                            />
                        </View>
                        <View>
                            <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>State: </Text>
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
                        </View>
                        <View>
                            <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Address: </Text>
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
                        </View>
                        <View>
                            <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Postcode: </Text>
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
            </KeyboardAvoidingView> : <KeyboardAvoidingView style={styles.container}>
                <ScrollView>
                    <View>
                        <Text style={{paddingBottom: 20, fontSize: 16, color: '#3c4c96', fontFamily: 'Raleway-Bold', }}>NOTE: Please key in your information for first time setup.</Text>
                        <View>
                            <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Name: </Text>
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
                        </View>
                        <View>
                            <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>NRIC: </Text>
                            {/* <TextInput
                                style={styles.input}
                                autoCapitalize="none"
                                underlineColorAndroid={'transparent'}
                                autoCorrect={false}
                                keyboardType='default'
                                placeholder='NRIC'
                                placeholderTextColor='#939ABA'
                                value={this.state.nric}
                                onChangeText={(text) => this.setState({ nric: text })}  /> */}
                            <TextInputMask
                                style={styles.input}
                                underlineColorAndroid={'transparent'}
                                keyboardType='default'
                                placeholder='NRIC'
                                placeholderTextColor='#8E9495'
                                type={'custom'}
                                options={{
                                    mask: '999999-99-9999', 
                                }}
                                value={this.state.nric}
                                onChangeText={text => {
                                    this.setState({
                                        nric: text
                                    })
                                }}
                            />
                        </View>
                        <View>
                            <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Phone Number: </Text>
                            {/* <TextInput
                                style={styles.input}
                                autoCapitalize="none"
                                autoCorrect={false}
                                underlineColorAndroid={'transparent'}
                                placeholder='Phone Number'
                                keyboardType='default'
                                placeholderTextColor='#939ABA'
                                value={this.state.phoneNumber}
                                onChangeText={(text) => this.setState({ phoneNumber: text })} /> */}
                            <TextInputMask
                                style={styles.input}
                                underlineColorAndroid={'transparent'}
                                keyboardType='default'
                                placeholder='Phone Number'
                                placeholderTextColor='#8E9495'
                                type={'custom'}
                                options={{
                                    mask: '999-99999999', 
                                }}
                                value={this.state.phoneNumber}
                                onChangeText={text => {
                                    this.setState({
                                        phoneNumber: text
                                    })
                                }}
                            />
                        </View>
                        <View>
                            <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>State: </Text>
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
                        </View>
                        <View>
                            <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Address: </Text>
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
                        </View>
                        <View>
                            <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Postcode: </Text>
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

export default connect (mapStateToProps, mapDispatchToProps)(UpdateProfileFirst);