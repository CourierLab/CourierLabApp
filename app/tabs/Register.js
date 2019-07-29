import React, { Component } from 'react';
import { Text, TextInput, View, Image, Animated, TouchableOpacity, UIManager, Dimensions, Keyboard, KeyboardAvoidingView, Alert, ScrollView, Platform, ImageBackground, } from 'react-native';
import { styles } from '../utils/Style';
import NetworkConnection from '../utils/NetworkConnection';
import Icon from 'react-native-vector-icons/FontAwesome';
import SimIcon from 'react-native-vector-icons/SimpleLineIcons';
import DeviceInfo from 'react-native-device-info';
import MyRealm from '../utils/Realm';
import Spinner from 'react-native-spinkit';
import { Input } from 'react-native-elements';

let myApiUrl = 'http://courierlabapi.azurewebsites.net/api/v1/MobileApi';
let registerPath = 'SignUp';
let deviceId = DeviceInfo.getUniqueID();
let realm = new MyRealm();
let loginAsset = realm.objects('LoginAsset');

const { State: TextInputState } = TextInput;

export default class Register extends Component{
    static navigationOptions = {
        // title: 'Registration',
        headerLeft: <View style={{flex: 1, top: 0, position: 'absolute', justifyContent: 'flex-start', alignContent: 'flex-start',}}>
            <TouchableOpacity
                style={{flexDirection: 'row',}}
                onPress={() => _this.props.navigation.goBack()}>
                <Icon name={'angle-left'} size={35} color={'#fff'} style={{paddingRight: 10, paddingLeft: 10, }}/>
                <Text style={{color: '#fff', paddingTop: 10, textAlign: 'center', fontSize: 18, fontFamily: 'AvenirLTStd-Roman',}}>Login</Text>
            </TouchableOpacity>
        </View>,
        headerBackground: <View>
            <ImageBackground source={require('../assets/smallBackground.png')} style={{width: '100%', height: '100%', justifyContent: 'center', }}>
                <View style={[{padding: 20, alignItems: 'center', justifyContent: 'center',}]}>
                    <Image resizeMode="contain" style={{ position: 'absolute', width: 150,}} source={require('../assets/register.png')} />
                </View>
            </ImageBackground>
        </View>
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
            isSubmit: false,
            shift: new Animated.Value(0),
        }
        _this = this;
    }

    componentDidMount() {
        setTimeout(() => {
            this.checkInternetConnection();
        }, 500);
    }

    componentWillMount(){
        this.keyboardDidShowSub = Keyboard.addListener('keyboardDidShow', this.handleKeyboardDidShow);
        this.keyboardDidHideSub = Keyboard.addListener('keyboardDidHide', this.handleKeyboardDidHide);
    }

    componentWillUnmount() {
        this.keyboardDidShowSub.remove();
        this.keyboardDidHideSub.remove();
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
            isSubmit: true,
        })

        if(this.state.email === "" || this.state.username === "" || this.state.password == "" || this.state.confirmPassword === ""){
            Alert.alert('Cannot Register', 'Please key in Username, Email Address, Password and Confirm Password', [{
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
            if(this.state.password !== this.state.confirmPassword){
                Alert.alert('Cannot Register', 'Password and Confirm Password are not matched', [{
                    text: 'OK',
                    onPress: () => {},
                }], {cancelable: false});
                this.setState({
                    spinnerVisible: false,
                    isClicked: false,
                    isSubmit: false,
                })
            }else{
                console.log(this.state.username, '   ', this.state.password, '   ', this.state.email, '   ', this.state.confirmPassword);
                fetch(`${myApiUrl}/${registerPath}`, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userName: this.state.username,
                        password: this.state.password,
                        emailAddress: this.state.email,
                        confirmPassword: this.state.confirmPassword,
                    }),
                })
                .then((response) => response.json())
                .then((json) => {
                    console.log(json);
                    if(json.succeeded){
                        Alert.alert('Successfully Registered', json.message, [{
                            text: 'OK',
                            onPress: () => {
                                this.setState({
                                    spinnerVisible: false,
                                    isClicked: false,
                                    isSubmit: false,
                                })
                            },
                        }], {cancelable: false});
                        this.props.navigation.goBack();
                    }else{
                        Alert.alert('Cannot Register', json.message, [{
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
            }
            e.preventDefault();
        }
    }

    handleKeyboardDidShow = (event) => {
        const { height: windowHeight } = Dimensions.get('window');
        const keyboardHeight = event.endCoordinates.height;
        const currentlyFocusedField = TextInputState.currentlyFocusedField();
        UIManager.measure(currentlyFocusedField, (originX, originY, width, height, pageX, pageY) => {
            const fieldHeight = height;
            const fieldTop = pageY;
            const gap = (windowHeight - keyboardHeight) - (fieldTop + fieldHeight);
            if (gap >= 0) {
                return;
            }
            Animated.timing(
                this.state.shift,
                {
                    toValue: gap,
                    duration: 1000,
                    useNativeDriver: true,
                }
            ).start();
        });
    }
    
    handleKeyboardDidHide = () => {
        Animated.timing(
            this.state.shift,
            {
                toValue: 0,
                duration: 1000,
                useNativeDriver: true,
            }
        ).start();
    }

    render(){
        let spinnerView = this.state.isClicked ? <View style={{alignItems: 'center',}}> 
                    <Spinner
                        isVisible={this.state.spinnerVisible}
                        type={'ThreeBounce'}
                        color='#F4D549'
                        size={30}/>
                </View> : <View/>;
        return(
            (Platform.OS === 'ios') ? <KeyboardAvoidingView behavior="padding" style={{flex: 1, backgroundColor: '#fff',}}>
                <View style={this.state.isSubmit ? {backgroundColor: '#F4D549', flex: 1, } : {backgroundColor: '#2C2E6D', flex: 1, }}>
                    <Animated.View style={{flex: 1, borderBottomLeftRadius: 40, borderBottomRightRadius: 40, backgroundColor: '#fff', transform: [{translateY: this.state.shift}]}}>
                        <View style={{ borderBottomColor: '#9B9B9B', borderBottomWidth: 1, flexDirection: 'row', padding: 25,}}>
                            {/* <Input
                                placeholder='Username'
                                placeholderTextColor='#9B9B9B'
                                value={this.state.username}
                                keyboardType='default'
                                underlineColorAndroid={'transparent'}
                                onChangeText={(text) => this.setState({ username: text })}
                                leftIcon={{ type: 'simple-line-icon', name: 'user', color: '#9B9B9B', size: 19, }} 
                                containerStyle={{padding: 15,}}
                                inputContainerStyle={{borderBottomWidth: 0,}} 
                                inputStyle={{color: '#2C2E6D', fontFamily: 'AvenirLTStd-Medium', fontSize: 16,}} /> */}
                            {/* <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Username: </Text> */}
                            <SimIcon name="user" size={19} color="#9B9B9B" style={{paddingLeft: 10, paddingRight: 5,}}/>
                            <TextInput
                                style={{color: '#2C2E6D', fontFamily: 'AvenirLTStd-Medium', fontSize: 16, paddingLeft: 10, width: '85%',}}
                                autoCapitalize="none"
                                autoCorrect={false}
                                underlineColorAndroid={'transparent'}
                                autoFocus={false}
                                keyboardType='default'
                                placeholder='Username'
                                placeholderTextColor='#9B9B9B'
                                value={this.state.username}
                                onChangeText={(text) => this.setState({ username: text })} />
                        </View>
                        <View style={{ borderBottomColor: '#9B9B9B', borderBottomWidth: 1, flexDirection: 'row', padding: 25,}}>
                            {/* <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Email Address: </Text> */}
                            {/* <Input
                                placeholder='Email Address'
                                placeholderTextColor='#9B9B9B'
                                value={this.state.email}
                                keyboardType='default'
                                underlineColorAndroid={'transparent'}
                                onChangeText={(text) => this.setState({ email: text })}
                                leftIcon={{ type: 'simple-line-icon', name: 'envelope', color: '#9B9B9B', size: 19, }} 
                                containerStyle={{padding: 15,}}
                                inputContainerStyle={{borderBottomWidth: 0,}} 
                                inputStyle={{color: '#2C2E6D', fontFamily: 'AvenirLTStd-Medium', fontSize: 16,}} /> */}
                            <SimIcon name="envelope" size={19} color="#9B9B9B" style={{paddingLeft: 10, paddingRight: 5,}}/>
                            <TextInput
                                style={{color: '#2C2E6D', fontFamily: 'AvenirLTStd-Medium', fontSize: 16, paddingLeft: 10, width: '85%',}}
                                autoCapitalize="none"
                                autoCorrect={false}
                                underlineColorAndroid={'transparent'}
                                autoFocus={false}
                                keyboardType='default'
                                placeholder='Email Address'
                                placeholderTextColor='#9B9B9B'
                                value={this.state.email}
                                onChangeText={(text) => this.setState({ email: text })} />
                        </View>
                        <View style={{ borderBottomColor: '#9B9B9B', borderBottomWidth: 1, flexDirection: 'row', padding: 25,}}>
                            {/* <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Password: </Text> */}
                            {/* <Input
                                placeholder='Password'
                                secureTextEntry={true}
                                placeholderTextColor='#9B9B9B'
                                value={this.state.password}
                                underlineColorAndroid={'transparent'}
                                onChangeText={(text) => this.setState({ password: text })}
                                leftIcon={{ type: 'simple-line-icon', name: 'lock', color: '#9B9B9B', size: 19, }} 
                                containerStyle={{padding: 15,}}
                                inputContainerStyle={{borderBottomWidth: 0,}} 
                                inputStyle={{color: '#2C2E6D', fontFamily: 'AvenirLTStd-Medium', fontSize: 16,}} /> */}
                            <SimIcon name="lock" size={19} color="#9B9B9B" style={{paddingLeft: 10, paddingRight: 5,}}/>
                            <TextInput
                                style={{color: '#2C2E6D', fontFamily: 'AvenirLTStd-Medium', fontSize: 16, paddingLeft: 10, width: '85%',}}
                                autoCapitalize="none"
                                autoCorrect={false}
                                secureTextEntry={true}
                                underlineColorAndroid={'transparent'}
                                autoFocus={false}
                                keyboardType='default'
                                placeholder='Password'
                                placeholderTextColor='#9B9B9B'
                                value={this.state.password}
                                onChangeText={(text) => this.setState({ password: text })} />
                        </View>
                        <View style={{ borderBottomColor: '#9B9B9B', borderBottomWidth: 1, flexDirection: 'row', padding: 25,}}>
                            {/* <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Confirm Password: </Text>  */}
                            {/* <Input
                                placeholder='Confirm Password'
                                secureTextEntry={true}
                                placeholderTextColor='#9B9B9B'
                                value={this.state.confirmPassword}
                                underlineColorAndroid={'transparent'}
                                onChangeText={(text) => this.setState({ confirmPassword: text })}
                                leftIcon={{ type: 'simple-line-icon', name: 'lock', color: '#9B9B9B', size: 19, }} 
                                containerStyle={{padding: 15,}}
                                inputContainerStyle={{borderBottomWidth: 0,}} 
                                inputStyle={{color: '#2C2E6D', fontFamily: 'AvenirLTStd-Medium', fontSize: 16,}} /> */}
                            <SimIcon name="lock" size={19} color="#9B9B9B" style={{paddingLeft: 10, paddingRight: 5,}}/>
                            <TextInput
                                style={{color: '#2C2E6D', fontFamily: 'AvenirLTStd-Medium', fontSize: 16, paddingLeft: 10, width: '85%',}}
                                autoCapitalize="none"
                                secureTextEntry={true}
                                autoCorrect={false}
                                underlineColorAndroid={'transparent'}
                                autoFocus={false}
                                keyboardType='default'
                                placeholder='Confirm Password'
                                placeholderTextColor='#9B9B9B'
                                value={this.state.confirmPassword}
                                onChangeText={(text) => this.setState({ confirmPassword: text })} />
                        </View>
                        {spinnerView}
                    </Animated.View>
                    {/* <View style={{paddingTop: 10,}}>
                        <TouchableOpacity
                            disabled={this.state.isSubmit}
                            style={this.state.isSubmit ? {backgroundColor: '#7D839C', paddingVertical: 15,} : styles.buttonContainer}
                            onPress={(e) => this.register(e)}>
                            <Text style={styles.buttonText}>Register</Text>
                        </TouchableOpacity>
                    </View> */}
                </View>
                <View style={{justifyContent: 'flex-end', alignContent: 'center', backgroundColor: '#2C2E6D',}}>
                    <TouchableOpacity
                        disabled={this.state.isSubmit}
                        style={this.state.isSubmit ? {backgroundColor: '#F4D549', paddingVertical: 20, } : {backgroundColor: '#2C2E6D', paddingVertical: 20, }}
                        onPress={(e) =>  this.register(e)}>
                        <Text style={this.state.isSubmit ? {color: '#2C2E6D', textAlign: 'center', fontSize: 16, fontFamily: 'AvenirLTStd-Black',} : {color: '#fff', textAlign: 'center', fontSize: 16, fontFamily: 'AvenirLTStd-Black',}}>REGISTER</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView> : <KeyboardAvoidingView style={{flex: 1, backgroundColor: '#fff',}}>
                {/* <ScrollView>
                    <View>
                        <View>
                            <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Username: </Text>
                            <TextInput
                                style={styles.input}
                                autoCapitalize="none"
                                autoCorrect={false}
                                underlineColorAndroid={'transparent'}
                                autoFocus={false}
                                keyboardType='default'
                                returnKeyLabel="next"
                                placeholder='Username'
                                placeholderTextColor='#9B9B9B'
                                value={this.state.username}
                                onChangeText={(text) => this.setState({ username: text })}  />
                        </View>
                        <View>
                            <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Email Address: </Text>
                            <TextInput
                                style={styles.input}
                                autoCapitalize="none"
                                underlineColorAndroid={'transparent'}
                                autoCorrect={false}
                                keyboardType='email-address'
                                returnKeyLabel="next"
                                placeholder='Email Address'
                                placeholderTextColor='#9B9B9B'
                                value={this.state.email}
                                onChangeText={(text) => this.setState({ email: text })}  />
                        </View>
                        <View>
                            <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Password: </Text>
                            <TextInput
                                style={styles.input}
                                autoCapitalize="none"
                                autoCorrect={false}
                                underlineColorAndroid={'transparent'}
                                returnKeyLabel="next"
                                placeholder='Password'
                                placeholderTextColor='#9B9B9B'
                                secureTextEntry={true}
                                value={this.state.password}
                                onChangeText={(text) => this.setState({ password: text })} />
                        </View>
                        <View>
                            <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Confirm Password: </Text>
                            <TextInput
                                style={styles.input}
                                autoCapitalize="none"
                                underlineColorAndroid={'transparent'}
                                autoCorrect={false}
                                returnKeyLabel="go"
                                placeholder='Confirm Password'
                                placeholderTextColor='#9B9B9B'
                                secureTextEntry={true}
                                value={this.state.confirmPassword}
                                onChangeText={(text) => this.setState({ confirmPassword: text })} />
                        </View>
                    </View>
                    {spinnerView}
                    <View style={{paddingTop: 10,}}>
                        <TouchableOpacity
                            disabled={this.state.isSubmit}
                            style={this.state.isSubmit ? {backgroundColor: '#7D839C', paddingVertical: 15,} : styles.buttonContainer}
                            onPress={(e) => this.register(e)}>
                            <Text style={styles.buttonText}>Register</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView> */}
                <View style={this.state.isSubmit ? {backgroundColor: '#F4D549', flex: 1, } : {backgroundColor: '#2C2E6D', flex: 1, }}>
                    <ScrollView style={{flex: 1, borderBottomLeftRadius: 40, borderBottomRightRadius: 40, backgroundColor: '#fff',}}>
                        <View style={{ borderBottomColor: '#9B9B9B', borderBottomWidth: 1, flexDirection: 'row', padding: 25,}}>
                            <SimIcon name="user" size={19} color="#9B9B9B" style={{paddingLeft: 10, paddingRight: 5, paddingTop: 10,}}/>
                            <TextInput
                                style={{color: '#2C2E6D', fontFamily: 'AvenirLTStd-Medium', fontSize: 16, paddingLeft: 10, width: '85%',}}
                                autoCapitalize="none"
                                autoCorrect={false}
                                underlineColorAndroid={'transparent'}
                                autoFocus={false}
                                keyboardType='default'
                                placeholder='Username'
                                placeholderTextColor='#9B9B9B'
                                value={this.state.username}
                                onChangeText={(text) => this.setState({ username: text })} />
                        </View>
                        <View style={{ borderBottomColor: '#9B9B9B', borderBottomWidth: 1, flexDirection: 'row', padding: 25,}}>
                            <SimIcon name="envelope" size={19} color="#9B9B9B" style={{paddingLeft: 10, paddingRight: 5, paddingTop: 10,}}/>
                            <TextInput
                                style={{color: '#2C2E6D', fontFamily: 'AvenirLTStd-Medium', fontSize: 16, paddingLeft: 10, width: '85%',}}
                                autoCapitalize="none"
                                autoCorrect={false}
                                underlineColorAndroid={'transparent'}
                                autoFocus={false}
                                keyboardType='default'
                                placeholder='Email Address'
                                placeholderTextColor='#9B9B9B'
                                value={this.state.email}
                                onChangeText={(text) => this.setState({ email: text })} />
                        </View>
                        <View style={{ borderBottomColor: '#9B9B9B', borderBottomWidth: 1, flexDirection: 'row', padding: 25,}}>
                            <SimIcon name="lock" size={19} color="#9B9B9B" style={{paddingLeft: 10, paddingRight: 5, paddingTop: 10,}}/>
                            <TextInput
                                style={{color: '#2C2E6D', fontFamily: 'AvenirLTStd-Medium', fontSize: 16, paddingLeft: 10, width: '85%',}}
                                autoCapitalize="none"
                                autoCorrect={false}
                                secureTextEntry={true}
                                underlineColorAndroid={'transparent'}
                                autoFocus={false}
                                keyboardType='default'
                                placeholder='Password'
                                placeholderTextColor='#9B9B9B'
                                value={this.state.password}
                                onChangeText={(text) => this.setState({ password: text })} />
                        </View>
                        <View style={{ borderBottomColor: '#9B9B9B', borderBottomWidth: 1, flexDirection: 'row', padding: 25,}}>
                            <SimIcon name="lock" size={19} color="#9B9B9B" style={{paddingLeft: 10, paddingRight: 5, paddingTop: 10,}}/>
                            <TextInput
                                style={{color: '#2C2E6D', fontFamily: 'AvenirLTStd-Medium', fontSize: 16, paddingLeft: 10, width: '85%',}}
                                autoCapitalize="none"
                                secureTextEntry={true}
                                autoCorrect={false}
                                underlineColorAndroid={'transparent'}
                                autoFocus={false}
                                keyboardType='default'
                                placeholder='Confirm Password'
                                placeholderTextColor='#9B9B9B'
                                value={this.state.confirmPassword}
                                onChangeText={(text) => this.setState({ confirmPassword: text })} />
                        </View>
                        {spinnerView}
                    </ScrollView>
                </View>
                <View style={{justifyContent: 'flex-end', alignContent: 'center', backgroundColor: '#2C2E6D',}}>
                    <TouchableOpacity
                        disabled={this.state.isSubmit}
                        style={this.state.isSubmit ? {backgroundColor: '#F4D549', paddingVertical: 20, } : {backgroundColor: '#2C2E6D', paddingVertical: 20, }}
                        onPress={(e) =>  this.register(e)}>
                        <Text style={this.state.isSubmit ? {color: '#2C2E6D', textAlign: 'center', fontSize: 16, fontFamily: 'AvenirLTStd-Black',} : {color: '#fff', textAlign: 'center', fontSize: 16, fontFamily: 'AvenirLTStd-Black',}}>REGISTER</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        )
    }
}
