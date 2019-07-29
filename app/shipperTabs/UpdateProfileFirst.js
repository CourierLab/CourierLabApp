import React, { Component } from 'react';
import { Text, TextInput, View, Image, TouchableOpacity, KeyboardAvoidingView, Alert, ScrollView, Platform, ImageBackground, Animated, UIManager, Dimensions, Keyboard,} from 'react-native';
import { styles } from '../utils/Style';
import NetworkConnection from '../utils/NetworkConnection';
import DeviceInfo from 'react-native-device-info';
import MyRealm from '../utils/Realm';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialComIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import FeatherIcon from 'react-native-vector-icons/Feather';
import Spinner from 'react-native-spinkit';
import { connect } from 'react-redux';
import { login, logout } from '../utils/Actions';
import { TextInputMask } from 'react-native-masked-text';

let myApiUrl = 'http://courierlabapi.azurewebsites.net/api/v1/MobileApi';
let updateProfilePath = 'UpdateProfile';
let deviceId = DeviceInfo.getUniqueID();
let realm = new MyRealm();
let loginAsset = realm.objects('LoginAsset');

const { State: TextInputState } = TextInput;

class UpdateProfileFirst extends Component{
    static navigationOptions = {
        // title: 'Update Profile',
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
                    <Image resizeMode="contain" style={{ position: 'absolute', width: 150,}} source={require('../assets/updateProfile.png')} />
                </View>
            </ImageBackground>
        </View>
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

    updateProfile(e){
        this.setState({
            spinnerVisible: true,
            isClicked: true,
        })

        if(this.state.name === "" || this.state.nric === "" || this.state.phoneNumber == "" || this.state.state === "" || this.state.address === "" || this.state.postcode === ""){
            Alert.alert('Cannot Register', 'Please key in Name, NRIC, Phone Number, State, Address and Postcode', [{
                text: 'OK',
                onPress: () => {
                    this.setState({
                        spinnerVisible: false,
                        isClicked: false,
                    })
                },
            }], {cancelable: false});
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
                        onPress: () => {
                            this.setState({
                                spinnerVisible: false,
                                isClicked: false,
                            })
                        },
                    }], {cancelable: false});
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
        let spinnerView = this.state.isClicked ? <View style={{alignItems: 'center', paddingBottom: 10, marginTop: 20,}}> 
                    <Spinner
                        isVisible={this.state.spinnerVisible}
                        type={'ThreeBounce'}
                        color='#F4D549'
                        size={30}/>
                </View> : <View/>;
        return(
            (Platform.OS === 'ios') ? <KeyboardAvoidingView behavior="padding" style={{backgroundColor: '#fff', flex: 1,}}>
                <ScrollView style={this.state.isClicked ? {backgroundColor: '#F4D549', } : {backgroundColor: '#2C2E6D', }} contentContainerStyle={{flexGrow: 1,}} 
                    ref={ref => this.scrollView = ref}
                    onContentSizeChange={(contentWidth, contentHeight)=>{
                        if(this.state.isClicked){
                            this.scrollView.scrollToEnd({animated: true});
                        }else{
                            this.scrollView.scrollTo({x: 0, y: 0, animated: true});
                        }
                    }}>
                    <Animated.View style={{flex: 1, borderBottomLeftRadius: 40, borderBottomRightRadius: 40, backgroundColor: '#fff', transform: [{translateY: this.state.shift}]}}>
                    <Text style={{paddingBottom: 10, paddingTop: 20, fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', paddingLeft: 20, paddingRight: 20,}}>NOTE: Please key in your information for first time setup.</Text>
                    <View style={{borderBottomColor: '#9B9B9B', borderBottomWidth: 1, borderTopColor: '#9B9B9B', borderTopWidth: 1,  flexDirection: 'row', padding: 25,}}>
                        {/* <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Name: </Text>
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
                            onChangeText={(text) => this.setState({ name: text })}  /> */}
                        <FeatherIcon name="type" size={19} color="#9B9B9B" style={{paddingLeft: 10, paddingRight: 5,}}/>
                        <TextInput
                            style={{color: '#2C2E6D', fontFamily: 'AvenirLTStd-Medium', fontSize: 16, paddingLeft: 10, width: '85%',}}
                            autoCapitalize="none"
                            autoCorrect={false}
                            underlineColorAndroid={'transparent'}
                            autoFocus={false}
                            keyboardType='default'
                            placeholder='Name'
                            placeholderTextColor='#9B9B9B'
                            value={this.state.name}
                            onChangeText={(text) => this.setState({ name: text })} />
                    </View>
                    <View style={{borderBottomColor: '#9B9B9B', borderBottomWidth: 1, flexDirection: 'row', padding: 25,}}>
                        {/* <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>NRIC: </Text> */}
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
                        <MaterialComIcon name="account-card-details-outline" size={19} color="#9B9B9B" style={{paddingLeft: 10, paddingRight: 5,}}/>
                        <TextInputMask
                            style={{color: '#2C2E6D', fontFamily: 'AvenirLTStd-Medium', fontSize: 16, paddingLeft: 10, width: '85%',}}
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
                    <View style={{borderBottomColor: '#9B9B9B', borderBottomWidth: 1, flexDirection: 'row', padding: 25,}}>
                        {/* <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Phone Number: </Text> */}
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
                        <MaterialComIcon name="cellphone" size={19} color="#9B9B9B" style={{paddingLeft: 10, paddingRight: 5,}}/>
                        <TextInputMask
                            style={{color: '#2C2E6D', fontFamily: 'AvenirLTStd-Medium', fontSize: 16, paddingLeft: 10, width: '85%',}}
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
                    <View style={{borderBottomColor: '#9B9B9B', borderBottomWidth: 1, flexDirection: 'row', padding: 25,}}>
                        {/* <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>State: </Text>
                        <TextInput
                            style={styles.input}
                            autoCapitalize="none"
                            underlineColorAndroid={'transparent'}
                            autoCorrect={false}
                            placeholder='State'
                            keyboardType='default'
                            placeholderTextColor='#939ABA'
                            value={this.state.state}
                            onChangeText={(text) => this.setState({ state: text })} /> */}
                        <FeatherIcon name="map-pin" size={19} color="#9B9B9B" style={{paddingLeft: 10, paddingRight: 5,}}/>
                        <TextInput
                            style={{color: '#2C2E6D', fontFamily: 'AvenirLTStd-Medium', fontSize: 16, paddingLeft: 10, width: '85%',}}
                            autoCapitalize="none"
                            autoCorrect={false}
                            underlineColorAndroid={'transparent'}
                            autoFocus={false}
                            keyboardType='default'
                            placeholder='State'
                            placeholderTextColor='#9B9B9B'
                            value={this.state.state}
                            onChangeText={(text) => this.setState({ state: text })} />
                    </View>
                    <View style={{borderBottomColor: '#9B9B9B', borderBottomWidth: 1, flexDirection: 'row', padding: 25,}}>
                        {/* <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Address: </Text>
                        <TextInput
                            style={styles.input}
                            autoCapitalize="none"
                            underlineColorAndroid={'transparent'}
                            autoCorrect={false}
                            placeholder='Address'
                            keyboardType='default'
                            placeholderTextColor='#939ABA'
                            value={this.state.address}
                            onChangeText={(text) => this.setState({ address: text })} /> */}
                        <FeatherIcon name="map" size={19} color="#9B9B9B" style={{paddingLeft: 10, paddingRight: 5,}}/>
                        <TextInput
                            style={{color: '#2C2E6D', fontFamily: 'AvenirLTStd-Medium', fontSize: 16, paddingLeft: 10, width: '85%',}}
                            autoCapitalize="none"
                            autoCorrect={false}
                            underlineColorAndroid={'transparent'}
                            autoFocus={false}
                            keyboardType='default'
                            placeholder='Address'
                            placeholderTextColor='#9B9B9B'
                            value={this.state.address}
                            onChangeText={(text) => this.setState({ address: text })} />
                    </View>
                    <View style={{ flexDirection: 'row', padding: 25,}}>
                        {/* <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Postcode: </Text>
                        <TextInput
                            style={styles.input}
                            autoCapitalize="none"
                            underlineColorAndroid={'transparent'}
                            autoCorrect={false}
                            placeholder='Postcode'
                            keyboardType='numeric'
                            placeholderTextColor='#939ABA'
                            value={this.state.postcode}
                            onChangeText={(text) => this.setState({ postcode: text })} /> */}
                        <MaterialComIcon name="numeric" size={19} color="#9B9B9B" style={{paddingLeft: 10, paddingRight: 5,}}/>
                        <TextInput
                            style={{color: '#2C2E6D', fontFamily: 'AvenirLTStd-Medium', fontSize: 16, paddingLeft: 10, width: '85%',}}
                            autoCapitalize="none"
                            autoCorrect={false}
                            underlineColorAndroid={'transparent'}
                            autoFocus={false}
                            keyboardType='numeric'
                            placeholder='Postcode'
                            placeholderTextColor='#9B9B9B'
                            value={this.state.postcode}
                            onChangeText={(text) => this.setState({ postcode: text })} />
                    </View>
                    {spinnerView}
                    {/* <View style={{paddingTop: 10,}}>
                        <TouchableOpacity
                            style={styles.buttonContainer}
                            onPress={(e) => this.updateProfile(e)}>
                            <Text style={styles.buttonText}>Update Profile</Text>
                        </TouchableOpacity>
                    </View> */}
                    </Animated.View>
                </ScrollView>
                <View style={{justifyContent: 'flex-end', alignContent: 'center', backgroundColor: '#2C2E6D',}}>
                    <TouchableOpacity
                        disabled={this.state.isClicked}
                        style={this.state.isClicked ? {backgroundColor: '#F4D549', paddingVertical: 20, } : {backgroundColor: '#2C2E6D', paddingVertical: 20, }}
                        onPress={(e) =>  this.updateProfile(e)}>
                        <Text style={this.state.isClicked ? {color: '#2C2E6D', textAlign: 'center', fontSize: 16, fontFamily: 'AvenirLTStd-Black',} : {color: '#fff', textAlign: 'center', fontSize: 16, fontFamily: 'AvenirLTStd-Black',}}>UPDATE PROFILE</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView> : <KeyboardAvoidingView style={{backgroundColor: '#fff', flex: 1,}}>
                {/* <ScrollView>
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
                </ScrollView> */}
                <ScrollView style={this.state.isClicked ? {backgroundColor: '#F4D549', } : {backgroundColor: '#2C2E6D', }} contentContainerStyle={{flexGrow: 1,}} 
                    ref={ref => this.scrollView = ref}
                    onContentSizeChange={(contentWidth, contentHeight)=>{
                        if(this.state.isClicked){
                            this.scrollView.scrollToEnd({animated: true});
                        }else{
                            this.scrollView.scrollTo({x: 0, y: 0, animated: true});
                        }
                    }}>
                    <View style={{flex: 1, borderBottomLeftRadius: 40, borderBottomRightRadius: 40, backgroundColor: '#fff',}}>
                    <Text style={{paddingBottom: 10, paddingTop: 20, fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', paddingLeft: 20, paddingRight: 20,}}>NOTE: Please key in your information for first time setup.</Text>
                    <View style={{borderBottomColor: '#9B9B9B', borderBottomWidth: 1, borderTopColor: '#9B9B9B', borderTopWidth: 1,  flexDirection: 'row', padding: 25,}}>
                        <FeatherIcon name="type" size={19} color="#9B9B9B" style={{paddingLeft: 10, paddingRight: 5, paddingTop: 10,}}/>
                        <TextInput
                            style={{color: '#2C2E6D', fontFamily: 'AvenirLTStd-Medium', fontSize: 16, paddingLeft: 10, width: '85%',}}
                            autoCapitalize="none"
                            autoCorrect={false}
                            underlineColorAndroid={'transparent'}
                            autoFocus={false}
                            keyboardType='default'
                            placeholder='Name'
                            placeholderTextColor='#9B9B9B'
                            value={this.state.name}
                            onChangeText={(text) => this.setState({ name: text })} />
                    </View>
                    <View style={{borderBottomColor: '#9B9B9B', borderBottomWidth: 1, flexDirection: 'row', padding: 25,}}>
                        <MaterialComIcon name="account-card-details-outline" size={19} color="#9B9B9B" style={{paddingLeft: 10, paddingRight: 5, paddingTop: 10,}}/>
                        <TextInputMask
                            style={{color: '#2C2E6D', fontFamily: 'AvenirLTStd-Medium', fontSize: 16, paddingLeft: 10, width: '85%',}}
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
                    <View style={{borderBottomColor: '#9B9B9B', borderBottomWidth: 1, flexDirection: 'row', padding: 25,}}>
                        <MaterialComIcon name="cellphone" size={19} color="#9B9B9B" style={{paddingLeft: 10, paddingRight: 5, paddingTop: 10,}}/>
                        <TextInputMask
                            style={{color: '#2C2E6D', fontFamily: 'AvenirLTStd-Medium', fontSize: 16, paddingLeft: 10, width: '85%',}}
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
                    <View style={{borderBottomColor: '#9B9B9B', borderBottomWidth: 1, flexDirection: 'row', padding: 25,}}>
                        <FeatherIcon name="map-pin" size={19} color="#9B9B9B" style={{paddingLeft: 10, paddingRight: 5, paddingTop: 10,}}/>
                        <TextInput
                            style={{color: '#2C2E6D', fontFamily: 'AvenirLTStd-Medium', fontSize: 16, paddingLeft: 10, width: '85%',}}
                            autoCapitalize="none"
                            autoCorrect={false}
                            underlineColorAndroid={'transparent'}
                            autoFocus={false}
                            keyboardType='default'
                            placeholder='State'
                            placeholderTextColor='#9B9B9B'
                            value={this.state.state}
                            onChangeText={(text) => this.setState({ state: text })} />
                    </View>
                    <View style={{borderBottomColor: '#9B9B9B', borderBottomWidth: 1, flexDirection: 'row', padding: 25,}}>
                        <FeatherIcon name="map" size={19} color="#9B9B9B" style={{paddingLeft: 10, paddingRight: 5, paddingTop: 10,}}/>
                        <TextInput
                            style={{color: '#2C2E6D', fontFamily: 'AvenirLTStd-Medium', fontSize: 16, paddingLeft: 10, width: '85%',}}
                            autoCapitalize="none"
                            autoCorrect={false}
                            underlineColorAndroid={'transparent'}
                            autoFocus={false}
                            keyboardType='default'
                            placeholder='Address'
                            placeholderTextColor='#9B9B9B'
                            value={this.state.address}
                            onChangeText={(text) => this.setState({ address: text })} />
                    </View>
                    <View style={{ flexDirection: 'row', padding: 25,}}>
                        <MaterialComIcon name="numeric" size={19} color="#9B9B9B" style={{paddingLeft: 10, paddingRight: 5, paddingTop: 10,}}/>
                        <TextInput
                            style={{color: '#2C2E6D', fontFamily: 'AvenirLTStd-Medium', fontSize: 16, paddingLeft: 10, width: '85%',}}
                            autoCapitalize="none"
                            autoCorrect={false}
                            underlineColorAndroid={'transparent'}
                            autoFocus={false}
                            keyboardType='numeric'
                            placeholder='Postcode'
                            placeholderTextColor='#9B9B9B'
                            value={this.state.postcode}
                            onChangeText={(text) => this.setState({ postcode: text })} />
                    </View>
                    {spinnerView}
                    </View>
                </ScrollView>
                <View style={{justifyContent: 'flex-end', alignContent: 'center', backgroundColor: '#2C2E6D',}}>
                    <TouchableOpacity
                        disabled={this.state.isClicked}
                        style={this.state.isClicked ? {backgroundColor: '#F4D549', paddingVertical: 20, } : {backgroundColor: '#2C2E6D', paddingVertical: 20, }}
                        onPress={(e) =>  this.updateProfile(e)}>
                        <Text style={this.state.isClicked ? {color: '#2C2E6D', textAlign: 'center', fontSize: 16, fontFamily: 'AvenirLTStd-Black',} : {color: '#fff', textAlign: 'center', fontSize: 16, fontFamily: 'AvenirLTStd-Black',}}>UPDATE PROFILE</Text>
                    </TouchableOpacity>
                </View>
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