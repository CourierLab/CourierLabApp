import React, { Component } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, TextInput, KeyboardAvoidingView, Platform, } from 'react-native';
import { styles } from '../utils/Style';
import NetworkConnection from '../utils/NetworkConnection';
import DeviceInfo from 'react-native-device-info';
import MyRealm from '../utils/Realm';
import Spinner from 'react-native-spinkit';
import { TextInputMask } from 'react-native-masked-text';

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
            shipperState: '',
            address: '',
            postcode: '',
        };
    }

    componentDidMount() {
        setTimeout(() => {
            this.checkInternetConnection();
        }, 500);
        this.setState({
            name: loginAsset[0].loginUserName,
            nric: loginAsset[0].loginUserNRIC,
            phoneNumber: loginAsset[0].loginUserPhoneNumber,
            shipperState: loginAsset[0].loginUserState,
            address: loginAsset[0].loginUserAddress,
            postcode: loginAsset[0].loginUserPostcode.toString(),
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
        if(this.state.name === '' || this.state.nric === '' || this.state.phoneNumber === '' || this.state.shipperState === '' || this.state.address === '' || this.state.postcode === ''){
            Alert.alert('Cannot Update', "Please key in Name, NRIC, Phone Number, Address, State and Postcode", [{
                text: 'OK',
                onPress: () => {},
            }], {cancelable: false});
            this.setState({
                spinnerVisible: false,
                isClicked: false,
                isSubmit: false,
            })
        }else{
            var bodyData = new FormData();
            bodyData.append('userId', loginAsset[0].userId);
            bodyData.append('deviceId', deviceId);
            bodyData.append('shipperId', loginAsset[0].loginUserId);
            bodyData.append('roleId', loginAsset[0].roleId);
            bodyData.append('name', this.state.name);
            bodyData.append('nRIC', this.state.nric);
            bodyData.append('phoneNumber', this.state.phoneNumber);
            bodyData.append('address', this.state.address);
            bodyData.append('state', this.state.shipperState);
            bodyData.append('postCode', this.state.postcode);
            console.log(bodyData);

            fetch(`${myApiUrl}/${updateProfilePath}`, {
                method: 'POST',
                headers: {
                    // 'Accept': 'application/json',
                    'Content-Type': 'multipart/form-data',
                    'Authorization': loginAsset[0].accessToken,
                },
                body: bodyData,
                // body: JSON.stringify({
                //     userId: loginAsset[0].userId,
                //     deviceId: deviceId,
                //     shipperId: loginAsset[0].loginUserId,
                //     roleId: loginAsset[0].roleId,
                //     name: this.state.name,
                //     nRIC: this.state.nric,
                //     phoneNumber: this.state.phoneNumber,
                //     address: this.state.address,
                //     state: this.state.shipperState,
                //     postCode: this.state.postcode,
                // }),
            })
            .then((response) => response.json())
            .then((json) => {
                console.log(json);
                if(json.succeeded){
                    realm.write(() => {
                        loginAsset[0].loginUserName = this.state.name;
                        loginAsset[0].loginUserNRIC = this.state.nric;
                        loginAsset[0].loginUserPhoneNumber = this.state.phoneNumber;
                        loginAsset[0].loginUserAddress = this.state.address;
                        loginAsset[0].loginUserState = this.state.shipperState;
                        loginAsset[0].loginUserPostcode = parseInt(this.state.postcode);
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
            (Platform.OS === 'ios') ? <KeyboardAvoidingView behavior="padding" style={styles.container}>
            <ScrollView>
                <View>
                    <View>
                        <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Name: </Text>
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
                    </View>  
                    <View>
                        <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>NRIC: </Text>
                        {/* <TextInput
                            style={styles.input}
                            autoCapitalize="none"
                            autoCorrect={false}
                            underlineColorAndroid={'transparent'}
                            keyboardType='default'
                            placeholder='NRIC'
                            placeholderTextColor='#8E9495'
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
                            keyboardType='default'
                            placeholder='Phone Number'
                            placeholderTextColor='#8E9495'
                            value={this.state.phoneNumber}
                            onChangeText={(text) => this.setState({ phoneNumber: text })}  /> */}
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
                        <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Address: </Text>
                        <TextInput
                            style={styles.input}
                            autoCapitalize="none"
                            autoCorrect={false}
                            underlineColorAndroid={'transparent'}
                            keyboardType='default'
                            placeholder='Address'
                            placeholderTextColor='#8E9495'
                            value={this.state.address}
                            onChangeText={(text) => this.setState({ address: text })}  />
                    </View>  
                    <View>
                        <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>State: </Text>
                        <TextInput
                            style={styles.input}
                            autoCapitalize="none"
                            autoCorrect={false}
                            underlineColorAndroid={'transparent'}
                            keyboardType='default'
                            placeholder='State'
                            placeholderTextColor='#8E9495'
                            value={this.state.shipperState}
                            onChangeText={(text) => this.setState({ shipperState: text })}  />
                    </View>  
                    <View>
                        <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>PostCode: </Text>
                        <TextInput
                            style={styles.input}
                            autoCapitalize="none"
                            autoCorrect={false}
                            underlineColorAndroid={'transparent'}
                            keyboardType='number-pad'
                            placeholder='PostCode'
                            placeholderTextColor='#8E9495'
                            value={this.state.postcode}
                            onChangeText={(text) => this.setState({ postcode: text })}  />
                    </View>  
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
            </KeyboardAvoidingView> : <KeyboardAvoidingView style={styles.container}>
            <ScrollView>
                <View>
                    <View>
                        <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Name: </Text>
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
                    </View>  
                    <View>
                        <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>NRIC: </Text>
                        {/* <TextInput
                            style={styles.input}
                            autoCapitalize="none"
                            autoCorrect={false}
                            underlineColorAndroid={'transparent'}
                            keyboardType='default'
                            placeholder='NRIC'
                            placeholderTextColor='#8E9495'
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
                            keyboardType='default'
                            placeholder='Phone Number'
                            placeholderTextColor='#8E9495'
                            value={this.state.phoneNumber}
                            onChangeText={(text) => this.setState({ phoneNumber: text })}  /> */}
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
                        <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Address: </Text>
                        <TextInput
                            style={styles.input}
                            autoCapitalize="none"
                            autoCorrect={false}
                            underlineColorAndroid={'transparent'}
                            keyboardType='default'
                            placeholder='Address'
                            placeholderTextColor='#8E9495'
                            value={this.state.address}
                            onChangeText={(text) => this.setState({ address: text })}  />
                    </View>  
                    <View>
                        <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>State: </Text>
                        <TextInput
                            style={styles.input}
                            autoCapitalize="none"
                            autoCorrect={false}
                            underlineColorAndroid={'transparent'}
                            keyboardType='default'
                            placeholder='State'
                            placeholderTextColor='#8E9495'
                            value={this.state.shipperState}
                            onChangeText={(text) => this.setState({ shipperState: text })}  />
                    </View>  
                    <View>
                        <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>PostCode: </Text>
                        <TextInput
                            style={styles.input}
                            autoCapitalize="none"
                            autoCorrect={false}
                            underlineColorAndroid={'transparent'}
                            keyboardType='number-pad'
                            placeholder='PostCode'
                            placeholderTextColor='#8E9495'
                            value={this.state.postcode}
                            onChangeText={(text) => this.setState({ postcode: text })}  />
                    </View>  
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
            </KeyboardAvoidingView>
        )
    }
}