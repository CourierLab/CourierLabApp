import React, { Component } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, TextInput, Dimensions, } from 'react-native';
import { styles } from '../utils/Style';
import NetworkConnection from '../utils/NetworkConnection';
import DeviceInfo from 'react-native-device-info';
import MyRealm from '../utils/Realm';
import { Avatar, Card, } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialComIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import OctiIcon from 'react-native-vector-icons/Octicons';
import Spinner from 'react-native-spinkit';
import { connect } from 'react-redux';
import { login, logout } from '../utils/Actions';
import OneSignal from 'react-native-onesignal';

let myApiUrl = 'http://courierlabapi.azurewebsites.net/api/v1/MobileApi';
let logOutPath = 'Logout';
let deviceId = DeviceInfo.getUniqueID();
let realm = new MyRealm();
let loginAsset = realm.objects('LoginAsset');
let deviceVersion = DeviceInfo.getVersion();
let {height, width} = Dimensions.get('window');

class Profile extends Component{
    static navigationOptions = {
        // title: 'Profile',
        headerTitle: <View style={{flexDirection: 'row',}}>
            <FeatherIcon name="user" size={19} color="#fff" style={{paddingLeft: 10, paddingRight: 10,}}/>
            <Text style={{color: '#fff', fontWeight: 'bold', fontFamily: 'AvenirLTStd-Black', fontSize: 15, paddingTop: 3,}}>Profile</Text>
        </View>,
        headerRight: (
            <MaterialComIcon onPress={() => _this.props.navigation.navigate('UpdateProfile', { rerenderFunction : () => _this.getProfile() })} name={'pencil-outline'} size={25} color={'#fff'} style={{paddingRight: 20,}}/>
        ),
    };
    
    constructor(props){
        super(props);
        this.state = {
            spinnerVisible: false,
            isSubmit: false,
            name: '',
            nric: '',
            phoneNumber: '',
            bank: '',
            bankAccountNumber: '',
            driverImage: '',
            driverIcImage: '',
            driverLicenseImage: '',
        };
        _this = this;
    }

    componentDidMount() {
        setTimeout(() => {
            this.checkInternetConnection();
        }, 500);
        this.getProfile();
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

    getProfile(){
        this.setState({
            name: loginAsset[0].loginUserName,
            nric: loginAsset[0].loginUserNRIC,
            phoneNumber: loginAsset[0].loginUserPhoneNumber,
            bank: loginAsset[0].bankName,
            bankAccountNumber: loginAsset[0].bankAccountNumber,
            driverImage: loginAsset[0].driverImage,
            driverIcImage: loginAsset[0].driverICImage,
            driverLicenseImage: loginAsset[0].driverLicenseImage,
        })
    }

    userLogout(e){
        this.setState({
            spinnerVisible: true,
            isSubmit: true,
        })
        console.log(loginAsset[0]);
        fetch(`${myApiUrl}/${logOutPath}`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': loginAsset[0].accessToken,
            },
            body: JSON.stringify({
                userId: loginAsset[0].userId,
                deviceId: deviceId,
            }),
        })
        .then((response) => response.json())
        .then((json) => {
            console.log(json);
            if(json.succeeded){
                realm.write(() => {
                    realm.delete(loginAsset);
                })
                this.setState({ 
                    spinnerVisible: false,
                    isSubmit: false,
                });
                OneSignal.deleteTag("userId");
                this.props.onLogout();
            }else{
                Alert.alert('Cannot Logout', json.message, [{
                    text: 'OK',
                    onPress: () => {
                        this.setState({ 
                            spinnerVisible: false, 
                            isSubmit: false,
                        });
                    },
                    style: styles.alertText,
                }], {cancelable: false});
            }
        }).catch(err => {
            console.log(err);
            this.setState({ 
                spinnerVisible: false, 
                isSubmit: false,
            });
        });
        e.preventDefault();
    }

    render(){
        console.log('ic ', this.state.driverIcImage)
        console.log('license ', this.state.driverLicenseImage)
        return(
            <ScrollView style={styles.container} ref={ref => this.scrollView = ref}
                onContentSizeChange={(contentWidth, contentHeight)=>{
                    if(this.state.isClicked){
                        this.scrollView.scrollToEnd({animated: true});
                    }
                }}>
                <Card containerStyle={{margin: 0, borderRadius: 20, shadowOpacity: 1, backgroundColor: '#EFEFEF', shadowColor: '#e0e0e0', shadowRadius: 3, shadowOffset: {width: 1, height: 1,},}}>
                    {
                        (this.state.driverImage !== '') ? <View style={{flexDirection: 'row', paddingBottom: 0, paddingTop: 0, justifyContent: 'center', }}>
                            <Avatar
                                size="large"
                                rounded
                                source={{uri: this.state.driverImage}}
                                onPress={() => console.log("Works!")}
                                activeOpacity={0.7}
                            />
                        </View> : <View/>
                    }
                    <View style={{paddingTop: 10, paddingBottom: 10, paddingLeft: 0, paddingRight: 0, flexDirection: 'column', backgroundColor: '#EFEFEF',}}>
                        <View style={{flexDirection: 'row', paddingBottom: 10, paddingRight: 10,}}>
                            <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                                <FeatherIcon name="type" size={19} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                            </View>
                            <View style={{flexDirection: 'column', paddingRight: 20,}}>
                                <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Name</Text>
                                <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{this.state.name}</Text>
                            </View>
                        </View>
                        <View style={{flexDirection: 'row', paddingBottom: 10, paddingRight: 10,}}>
                            <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                                <MaterialComIcon name="account-card-details-outline" size={19} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                            </View>
                            <View style={{flexDirection: 'column', paddingRight: 20,}}>
                                <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>NRIC</Text>
                                <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{this.state.nric}</Text>
                            </View>
                        </View>
                        <View style={{flexDirection: 'row', paddingBottom: 10, paddingRight: 10,}}>
                            <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                                <MaterialComIcon name="cellphone" size={19} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                            </View>
                            <View style={{flexDirection: 'column', paddingRight: 20,}}>
                                <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Phone Number</Text>
                                <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{this.state.phoneNumber}</Text>
                            </View>
                        </View>
                        <View style={{flexDirection: 'row', paddingBottom: 10, paddingRight: 10,}}>
                            <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                                <MaterialComIcon name="credit-card" size={19} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                            </View>
                            <View style={{flexDirection: 'column', paddingRight: 20,}}>
                                <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Bank</Text>
                                <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{this.state.bank}</Text>
                            </View>
                        </View>
                        <View style={{flexDirection: 'row', paddingBottom: 10, paddingRight: 10,}}>
                            <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                                <MaterialComIcon name="tooltip-text-outline" size={19} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                            </View>
                            <View style={{flexDirection: 'column', paddingRight: 20,}}>
                                <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Bank Account Number</Text>
                                <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{this.state.bankAccountNumber}</Text>
                            </View>
                        </View>
                        <View style={{flexDirection: 'row',}}>
                            <View style={{flexDirection: 'row', width: '50%', paddingBottom: 10, paddingRight: 10,}}>
                                <View style={{flexDirection: 'column',}}>
                                    <Icon name="image" size={17} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                                </View>
                                <View style={{flexDirection: 'column', paddingRight: 20,}}>
                                    <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Driver IC</Text>
                                    {
                                        (this.state.driverIcImage !== '') ? <View style={{flexDirection: 'row', paddingBottom: 0, paddingTop: 0, paddingLeft: 0, paddingRight: 0, justifyContent: 'flex-start', }}>
                                            <Avatar
                                                size={width-280}
                                                source={{uri: this.state.driverIcImage}}
                                                onPress={() => console.log("Works!")}
                                                activeOpacity={0.7}
                                                avatarStyle={{borderRadius: 10,}}
                                                overlayContainerStyle={{borderRadius: 10,}}
                                            />
                                        </View> : <View />
                                    }
                                </View>
                            </View>
                            <View style={{flexDirection: 'row', width: '50%', paddingBottom: 10, paddingRight: 10,}}>
                                <View style={{flexDirection: 'column',}}>
                                    <Icon name="image" size={17} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                                </View>
                                <View style={{flexDirection: 'column', paddingRight: 20,}}>
                                    <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Driver License</Text>
                                    {
                                        (this.state.driverLicenseImage !== '') ? <View style={{flexDirection: 'row', paddingBottom: 0, paddingTop: 0, paddingLeft: 0, paddingRight: 0, justifyContent: 'flex-start', }}>
                                            <Avatar
                                                size={width-280}
                                                source={{uri: this.state.driverLicenseImage}}
                                                onPress={() => console.log("Works!")}
                                                activeOpacity={0.7}
                                                avatarStyle={{borderRadius: 10,}}
                                                overlayContainerStyle={{borderRadius: 10,}}
                                            />
                                        </View> : <View />
                                    }
                                </View>
                            </View>
                        </View>
                        <View style={{flexDirection: 'row', paddingBottom: 0, paddingRight: 10,}}>
                            <Text style={{paddingLeft: 5, paddingTop: 10, paddingBottom: 0, paddingRight: 5, color: '#3c4c96', fontSize: 15, fontFamily: 'AvenirLTStd-Black', justifyContent: 'flex-start', textDecorationLine: 'underline', alignSelf: 'flex-start',}}
                                onPress={() => this.props.navigation.navigate('Lorry')}>
                                My Lorry Information
                            </Text>
                        </View>
                    </View>
                </Card>
                

                {/* {
                    (this.state.driverImage !== '') ? <View style={{flexDirection: 'row', paddingBottom: 0, paddingTop: 0, justifyContent: 'center', }}>
                        <Avatar
                            size="xlarge"
                            rounded
                            source={{uri: this.state.driverImage}}
                            onPress={() => console.log("Works!")}
                            activeOpacity={0.7}
                        />
                    </View> : <View/>
                }
                <View>
                    <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Name: </Text>
                    <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 20, fontFamily: 'Raleway-Regular',}}>{this.state.name}</Text>

                    <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 15, fontFamily: 'Raleway-Bold',}}>NRIC: </Text>
                    <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 20, fontFamily: 'Raleway-Regular',}}>{this.state.nric}</Text>

                    <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Phone Number: </Text>
                    <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 20, fontFamily: 'Raleway-Regular',}}>{this.state.phoneNumber}</Text>

                    <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Bank: </Text>
                    <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 20, fontFamily: 'Raleway-Regular',}}>{this.state.bank}</Text>

                    <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Bank Account Number: </Text>
                    <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 20, fontFamily: 'Raleway-Regular',}}>{this.state.bankAccountNumber}</Text>

                    {
                        (this.state.driverIcImage != '') ? <View style={{flexDirection: 'column',}}>
                            <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Driver IC: </Text>
                                <View style={{flexDirection: 'row', paddingBottom: 10, paddingTop: 0, paddingLeft: 5, paddingRight: 5, justifyContent: 'flex-start', }}>
                                <Avatar
                                    size={width-100}
                                    source={{uri: this.state.driverIcImage}}
                                    activeOpacity={0.7}
                                />
                            </View>
                        </View> : <View />
                    }

                    {
                        (this.state.driverLicenseImage != '') ? <View style={{flexDirection: 'column',}}>
                            <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Driver License: </Text>
                                <View style={{flexDirection: 'row', paddingBottom: 10, paddingTop: 0, paddingLeft: 5, paddingRight: 5, justifyContent: 'flex-start', }}>
                                <Avatar
                                    size={width-100}
                                    source={{uri: this.state.driverLicenseImage}}
                                    activeOpacity={0.7}
                                />
                            </View>
                        </View> : <View />
                    }

                    <Text style={{paddingLeft: 5, paddingTop: 10, paddingBottom: 0, paddingRight: 5, color: '#3c4c96', fontSize: 18, fontFamily: 'Raleway-Bold', justifyContent: 'flex-start', textDecorationLine: 'underline', alignSelf: 'flex-start',}}
                        onPress={() => this.props.navigation.navigate('Lorry')}>
                        My Lorry Information
                    </Text>
                </View> */}
                {
                    this.state.isSubmit ? <View style={{alignItems: 'center', paddingBottom: 0, marginTop: 10,}}> 
                        <Spinner
                            isVisible={this.state.spinnerVisible}
                            type={'ThreeBounce'}
                            color='#F4D549'
                            size={30}/>
                    </View> : <View/>
                }
                <View style={this.state.isSubmit ? {backgroundColor: '#F4D549', borderRadius: 20, paddingLeft: 10, paddingRight: 10, marginLeft: 0, marginRight: 0, marginBottom: 10, marginTop: 20,} : {backgroundColor: '#2C2E6D', borderRadius: 20, paddingLeft: 10, paddingRight: 10, marginLeft: 0, marginRight: 0, marginBottom: 0, marginTop: 20,}}>
                    <TouchableOpacity
                        disabled={this.state.isSubmit}
                        style={this.state.isSubmit ? {backgroundColor: '#F4D549', borderRadius: 20, paddingVertical: 15,} : styles.buttonContainer}
                        onPress={(e) => this.userLogout(e)}>
                        <Text style={this.state.isSubmit ? {color: '#2C2E6D', textAlign: 'center', fontSize: 16, fontFamily: 'AvenirLTStd-Black',} : {color: '#fff', textAlign: 'center', fontSize: 16, fontFamily: 'AvenirLTStd-Black',}}>Log Out</Text>
                    </TouchableOpacity>
                </View>
                <View>
                <Text style={{paddingTop:10, paddingBottom: 30, textAlign: 'center', fontSize: 12, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Roman',}}>App version: {deviceVersion}</Text>
                </View>
            </ScrollView>
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
        onLogout: () => { dispatch(logout()); },
    }
}

export default connect (mapStateToProps, mapDispatchToProps)(Profile);