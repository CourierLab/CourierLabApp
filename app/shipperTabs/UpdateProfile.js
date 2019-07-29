import React, { Component } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, TextInput, KeyboardAvoidingView, Platform, Image, } from 'react-native';
import { styles } from '../utils/Style';
import NetworkConnection from '../utils/NetworkConnection';
import DeviceInfo from 'react-native-device-info';
import MyRealm from '../utils/Realm';
import Icon from 'react-native-vector-icons/FontAwesome';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialComIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import OctiIcon from 'react-native-vector-icons/Octicons';
import Spinner from 'react-native-spinkit';
import { TextInputMask } from 'react-native-masked-text';

let myApiUrl = 'http://courierlabapi.azurewebsites.net/api/v1/MobileApi';
let updateProfilePath = 'UpdateProfile';
let deviceId = DeviceInfo.getUniqueID();
let realm = new MyRealm();
let loginAsset = realm.objects('LoginAsset');

export default class UpdateProfile extends Component{
    static navigationOptions = {
        // title: 'Update Profile',
        headerTitle: <View style={{flexDirection: 'row',}}>
                <FeatherIcon name="user" size={19} color="#fff" style={{paddingLeft: 10, paddingRight: 10,}}/>
                <Text style={{color: '#fff', fontWeight: 'bold', fontFamily: 'AvenirLTStd-Black', fontSize: 15, paddingTop: 3,}}>Update Profile</Text>
            </View>,
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
                onPress: () => {
                    this.setState({
                        spinnerVisible: false,
                        isClicked: false,
                        isSubmit: false,
                    })
                },
            }], {cancelable: false});
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
                        onPress: () => {
                            this.setState({ 
                                spinnerVisible: false, 
                                isSubmit: false,
                                isClicked: false,
                            });
                        },
                    }], {cancelable: false});
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
            <ScrollView ref={ref => this.scrollView = ref}
                onContentSizeChange={(contentWidth, contentHeight)=>{
                    if(this.state.isClicked){
                        this.scrollView.scrollToEnd({animated: true});
                    }
                }}>
                <View>
                    <View style={{margin: 0, paddingLeft: 15, paddingRight: 15, paddingTop: 20, paddingBottom: 20, backgroundColor: '#EFEFEF', borderRadius: 20,}}>
                        <View style={{flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginTop: -20, marginBottom: -10, }}>
                            <Image resizeMode='contain' style={{width: '10%',}} source={require('../assets/shipper.png')} />
                            <Text style={{fontSize: 18, alignItems: 'center', textAlign: 'center', fontFamily: 'AvenirLTStd-Roman', color: '#2C2E6D', paddingLeft: 10,}}>Shipper Information</Text>
                        </View>
                        <View>
                            <Text style={{paddingLeft: 0, paddingTop: 10, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'AvenirLTStd-Heavy',}}>Name  </Text>
                            <TextInput
                                style={{fontSize: 14, fontFamily: 'AvenirLTStd-Roman', color: '#3c4c96', borderColor: '#A3A9C4', borderWidth: 1, height: 40, paddingLeft: 10, paddingRight: 10,}}
                                autoCapitalize="none"
                                underlineColorAndroid={'transparent'}
                                autoCorrect={false}
                                keyboardType='default'
                                returnKeyLabel="next"
                                placeholder='Name'
                                placeholderTextColor='#A3A9C4'
                                value={this.state.name}
                                onChangeText={(text) => this.setState({ name: text })}  />
                        </View>
                        <View>
                            <Text style={{paddingLeft: 0, paddingTop: 10, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'AvenirLTStd-Heavy',}}>NRIC  </Text>
                            <TextInputMask
                                style={{fontSize: 14, fontFamily: 'AvenirLTStd-Roman', color: '#3c4c96', borderColor: '#A3A9C4', borderWidth: 1, height: 40, paddingLeft: 10, paddingRight: 10,}}
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
                            <Text style={{paddingLeft: 0, paddingTop: 10, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'AvenirLTStd-Heavy',}}>Phone Number   </Text>
                            <TextInputMask
                                style={{fontSize: 14, fontFamily: 'AvenirLTStd-Roman', color: '#3c4c96', borderColor: '#A3A9C4', borderWidth: 1, height: 40, paddingLeft: 10, paddingRight: 10,}}
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
                            <Text style={{paddingLeft: 0, paddingTop: 10, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'AvenirLTStd-Heavy',}}>Address </Text>
                            <TextInput
                                style={{fontSize: 14, fontFamily: 'AvenirLTStd-Roman', color: '#3c4c96', borderColor: '#A3A9C4', borderWidth: 1, height: 40, paddingLeft: 10, paddingRight: 10,}}
                                autoCapitalize="none"
                                underlineColorAndroid={'transparent'}
                                autoCorrect={false}
                                keyboardType='default'
                                returnKeyLabel="next"
                                placeholder='Address'
                                placeholderTextColor='#A3A9C4'
                                value={this.state.address}
                                onChangeText={(text) => this.setState({ address: text })}  />
                        </View>
                        <View>
                            <Text style={{paddingLeft: 0, paddingTop: 10, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'AvenirLTStd-Heavy',}}>State  </Text>
                            <TextInput
                                style={{fontSize: 14, fontFamily: 'AvenirLTStd-Roman', color: '#3c4c96', borderColor: '#A3A9C4', borderWidth: 1, height: 40, paddingLeft: 10, paddingRight: 10,}}
                                autoCapitalize="none"
                                underlineColorAndroid={'transparent'}
                                autoCorrect={false}
                                keyboardType='default'
                                returnKeyLabel="next"
                                placeholder='State'
                                placeholderTextColor='#A3A9C4'
                                value={this.state.shipperState}
                                onChangeText={(text) => this.setState({ shipperState: text })}  />
                        </View>
                        <View>
                            <Text style={{paddingLeft: 0, paddingTop: 10, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'AvenirLTStd-Heavy',}}>PostCode  </Text>
                            <TextInput
                                style={{fontSize: 14, fontFamily: 'AvenirLTStd-Roman', color: '#3c4c96', borderColor: '#A3A9C4', borderWidth: 1, height: 40, paddingLeft: 10, paddingRight: 10,}}
                                autoCapitalize="none"
                                autoCorrect={false}
                                underlineColorAndroid={'transparent'}
                                keyboardType='number-pad'
                                placeholder='PostCode'
                                placeholderTextColor='#A3A9C4'
                                value={this.state.postcode}
                                onChangeText={(text) => this.setState({ postcode: text })}  />
                        </View>
                        {
                            (this.state.isClicked) ? <View style={{alignItems: 'center', paddingBottom: 10, marginTop: 20,}}> 
                                <Spinner
                                    isVisible={this.state.spinnerVisible}
                                    type={'ThreeBounce'}
                                    color='#F4D549'
                                    size={30}/>
                            </View> : <View/>
                        }
                    </View>
                    

                    {/* <View>
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
                    </View>   */}
                </View>
                <View style={this.state.isSubmit ? {backgroundColor: '#F4D549', borderRadius: 20, paddingLeft: 10, paddingRight: 10, marginLeft: 0, marginRight: 0, marginBottom: 20, marginTop: 20,} : {backgroundColor: '#2C2E6D', borderRadius: 20, paddingLeft: 10, paddingRight: 10, marginLeft: 0, marginRight: 0, marginBottom: 20, marginTop: 20,}}>
                    <TouchableOpacity
                        disabled={this.state.isSubmit}
                        style={this.state.isSubmit ? {backgroundColor: '#F4D549', borderRadius: 20, paddingVertical: 15,} : styles.buttonContainer}
                        onPress={(e) => this.updateProfile(e)}>
                        <Text style={this.state.isSubmit ? {color: '#2C2E6D', textAlign: 'center', fontSize: 16, fontFamily: 'AvenirLTStd-Black',} : {color: '#fff', textAlign: 'center', fontSize: 16, fontFamily: 'AvenirLTStd-Black',}}>Update</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
            </KeyboardAvoidingView> : <KeyboardAvoidingView style={styles.container}>
            {/* <ScrollView>
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
            </ScrollView> */}
            <ScrollView ref={ref => this.scrollView = ref}
                onContentSizeChange={(contentWidth, contentHeight)=>{
                    if(this.state.isClicked){
                        this.scrollView.scrollToEnd({animated: true});
                    }
                }}>
                <View>
                    <View style={{margin: 0, paddingLeft: 15, paddingRight: 15, paddingTop: 20, paddingBottom: 20, backgroundColor: '#EFEFEF', borderRadius: 20,}}>
                        <View style={{flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginTop: -20, marginBottom: -10, }}>
                            <Image resizeMode='contain' style={{width: '10%',}} source={require('../assets/shipper.png')} />
                            <Text style={{fontSize: 18, alignItems: 'center', textAlign: 'center', fontFamily: 'AvenirLTStd-Roman', color: '#2C2E6D', paddingLeft: 10,}}>Shipper Information</Text>
                        </View>
                        <View>
                            <Text style={{paddingLeft: 0, paddingTop: 10, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'AvenirLTStd-Heavy',}}>Name  </Text>
                            <TextInput
                                style={{fontSize: 14, fontFamily: 'AvenirLTStd-Roman', color: '#3c4c96', borderColor: '#A3A9C4', borderWidth: 1, height: 40, paddingLeft: 10, paddingRight: 10,}}
                                autoCapitalize="none"
                                underlineColorAndroid={'transparent'}
                                autoCorrect={false}
                                keyboardType='default'
                                returnKeyLabel="next"
                                placeholder='Name'
                                placeholderTextColor='#A3A9C4'
                                value={this.state.name}
                                onChangeText={(text) => this.setState({ name: text })}  />
                        </View>
                        <View>
                            <Text style={{paddingLeft: 0, paddingTop: 10, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'AvenirLTStd-Heavy',}}>NRIC  </Text>
                            <TextInputMask
                                style={{fontSize: 14, fontFamily: 'AvenirLTStd-Roman', color: '#3c4c96', borderColor: '#A3A9C4', borderWidth: 1, height: 40, paddingLeft: 10, paddingRight: 10,}}
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
                            <Text style={{paddingLeft: 0, paddingTop: 10, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'AvenirLTStd-Heavy',}}>Phone Number   </Text>
                            <TextInputMask
                                style={{fontSize: 14, fontFamily: 'AvenirLTStd-Roman', color: '#3c4c96', borderColor: '#A3A9C4', borderWidth: 1, height: 40, paddingLeft: 10, paddingRight: 10,}}
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
                            <Text style={{paddingLeft: 0, paddingTop: 10, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'AvenirLTStd-Heavy',}}>Address </Text>
                            <TextInput
                                style={{fontSize: 14, fontFamily: 'AvenirLTStd-Roman', color: '#3c4c96', borderColor: '#A3A9C4', borderWidth: 1, height: 40, paddingLeft: 10, paddingRight: 10,}}
                                autoCapitalize="none"
                                underlineColorAndroid={'transparent'}
                                autoCorrect={false}
                                keyboardType='default'
                                returnKeyLabel="next"
                                placeholder='Address'
                                placeholderTextColor='#A3A9C4'
                                value={this.state.address}
                                onChangeText={(text) => this.setState({ address: text })}  />
                        </View>
                        <View>
                            <Text style={{paddingLeft: 0, paddingTop: 10, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'AvenirLTStd-Heavy',}}>State  </Text>
                            <TextInput
                                style={{fontSize: 14, fontFamily: 'AvenirLTStd-Roman', color: '#3c4c96', borderColor: '#A3A9C4', borderWidth: 1, height: 40, paddingLeft: 10, paddingRight: 10,}}
                                autoCapitalize="none"
                                underlineColorAndroid={'transparent'}
                                autoCorrect={false}
                                keyboardType='default'
                                returnKeyLabel="next"
                                placeholder='State'
                                placeholderTextColor='#A3A9C4'
                                value={this.state.shipperState}
                                onChangeText={(text) => this.setState({ shipperState: text })}  />
                        </View>
                        <View>
                            <Text style={{paddingLeft: 0, paddingTop: 10, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'AvenirLTStd-Heavy',}}>PostCode  </Text>
                            <TextInput
                                style={{fontSize: 14, fontFamily: 'AvenirLTStd-Roman', color: '#3c4c96', borderColor: '#A3A9C4', borderWidth: 1, height: 40, paddingLeft: 10, paddingRight: 10,}}
                                autoCapitalize="none"
                                autoCorrect={false}
                                underlineColorAndroid={'transparent'}
                                keyboardType='number-pad'
                                placeholder='PostCode'
                                placeholderTextColor='#A3A9C4'
                                value={this.state.postcode}
                                onChangeText={(text) => this.setState({ postcode: text })}  />
                        </View>
                        {
                            (this.state.isClicked) ? <View style={{alignItems: 'center', paddingBottom: 10, marginTop: 20,}}> 
                                <Spinner
                                    isVisible={this.state.spinnerVisible}
                                    type={'ThreeBounce'}
                                    color='#F4D549'
                                    size={30}/>
                            </View> : <View/>
                        }
                    </View>
                </View>
                <View style={this.state.isSubmit ? {backgroundColor: '#F4D549', borderRadius: 20, paddingLeft: 10, paddingRight: 10, marginLeft: 0, marginRight: 0, marginBottom: 20, marginTop: 20,} : {backgroundColor: '#2C2E6D', borderRadius: 20, paddingLeft: 10, paddingRight: 10, marginLeft: 0, marginRight: 0, marginBottom: 20, marginTop: 20,}}>
                    <TouchableOpacity
                        disabled={this.state.isSubmit}
                        style={this.state.isSubmit ? {backgroundColor: '#F4D549', borderRadius: 20, paddingVertical: 15,} : styles.buttonContainer}
                        onPress={(e) => this.updateProfile(e)}>
                        <Text style={this.state.isSubmit ? {color: '#2C2E6D', textAlign: 'center', fontSize: 16, fontFamily: 'AvenirLTStd-Black',} : {color: '#fff', textAlign: 'center', fontSize: 16, fontFamily: 'AvenirLTStd-Black',}}>Update</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
            </KeyboardAvoidingView>
        )
    }
}