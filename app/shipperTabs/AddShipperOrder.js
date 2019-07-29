import React, { Component } from 'react';
import { Text, TextInput, View, Image, TouchableOpacity, KeyboardAvoidingView, Alert, ScrollView, Platform,  } from 'react-native';
import { styles } from '../utils/Style';
import NetworkConnection from '../utils/NetworkConnection';
import MyRealm from '../utils/Realm';
import Spinner from 'react-native-spinkit';
import FeatherIcon from 'react-native-vector-icons/Feather';
import DeviceInfo from 'react-native-device-info';
import MultiSelect from 'react-native-multiple-select';
import Geocoder from 'react-native-geocoding';
import DatePicker from 'react-native-datepicker';
import ModalSelector from 'react-native-modal-selector';
import ImagePicker from 'react-native-image-picker';
import { TextInputMask } from 'react-native-masked-text';

let myApiUrl = 'http://courierlabapi.azurewebsites.net/api/v1/MobileApi';
let addOrderPath = 'AddShipperOrder';
let vehicleSpecPath = 'GetVehicleSpecification';
let favRecipientPath = 'GetFavouriteRecipient';
let getLorryTypePath = 'GetLorryType';
let deviceId = DeviceInfo.getUniqueID();
let realm = new MyRealm();
let loginAsset = realm.objects('LoginAsset');
  
export default class AddDriverOrder extends Component{
    static navigationOptions = {
        // title: 'Add Shipper Order',
        headerTitle: <View style={{flexDirection: 'row',}}>
                <FeatherIcon name="file-plus" size={19} color="#fff" style={{paddingLeft: 10, paddingRight: 10,}}/>
                <Text style={{color: '#fff', fontWeight: 'bold', fontFamily: 'AvenirLTStd-Black', fontSize: 15, paddingTop: 3,}}>Add Shipper Order</Text>
            </View>,
    }
    
    constructor(props){
        super(props);
        this.state = {
            spinnerVisible: false,
            isClicked: false,
            pickUpLocation: '',
            pickUpLatitude: '',
            pickUpLongitude: '',
            pickUpDate: '',
            expectedArrivalDate: '',
            favRecipientList: [{
                recipientName: "No Favourite Recipient",
                recipientAddress: "",
                recipientEmailAddress: "",
                recipientPhoneNumber: "",
                recipientAddressLatitude: "",
                recipientAddressLongitude: "",
                // recipientPostCode: "",
                // recipientState: "",
                recipientId: 0,
            }],
            favRecipientId: 0,
            favRecipientName: '',
            recipientName: '',
            recipientAddress: '',
            // recipientState: '',
            // recipientPostcode: '',
            recipientAddressLatitude: '',
            recipientAddressLongitude: '',
            recipientEmail: '',
            recipientPhoneNumber: '',
            orderWeight: '',
            orderDescription: '',
            vehicleSpec: [],
            vehicleSpecList: [],
            currentDate: new Date(),
            isSubmit: false,
            lorryTypeList: [],
            selectedLorryType: '',
            selectedLorryTypeId: 0,
            orderImage: '',
            orderImage2: '',
            orderImage3: '',
            validAddress: false,
            validRecipientAddress: false,
        }
    }

    onSelectedItemsChange = vehicleSpec => {
        this.setState({ vehicleSpec });
    };

    componentDidMount() {
        setTimeout(() => {
            this.checkInternetConnection();
        }, 500);
        this.getVehicleSpec();
        this.getFavRecipient();
        this.getLorryType();
        Geocoder.init('AIzaSyCgGvYKsFv6HeUdTF-8FdE389pYjBOolvc');
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

    getVehicleSpec(){
        fetch(`${myApiUrl}/${vehicleSpecPath}?deviceId=` + deviceId + `&userId=` + loginAsset[0].userId, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': loginAsset[0].accessToken,
            },
        })
        .then((response) => response.json())
        .then((json) => {
            if(json.succeeded){
                this.setState({
                    vehicleSpecList: json.results,
                });
            }
        }).catch(err => {
            console.log(err);
        });
    }

    getFavRecipient(){
        fetch(`${myApiUrl}/${favRecipientPath}?deviceId=` + deviceId + `&userId=` + loginAsset[0].userId, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': loginAsset[0].accessToken,
            },
        })
        .then((response) => response.json())
        .then((json) => {
            console.log(json.results);
            if(json.succeeded){
                this.setState({
                    favRecipientList: [
                        ...this.state.favRecipientList, 
                        ...json.results
                    ]
                });
            }
        }).catch(err => {
            console.log(err);
        });
    }

    getCoordination(){
        Geocoder.from(this.state.pickUpLocation)
		.then(json => {
			var location = json.results[0].geometry.location;
            console.log(location);
            this.setState({
                pickUpLatitude: location.lat,
                pickUpLongitude: location.lng,
            })
		})
		.catch(error => console.warn(error));
    }

    getLorryType(){
        fetch(`${myApiUrl}/${getLorryTypePath}?deviceId=` + deviceId + `&userId=` + loginAsset[0].userId, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': loginAsset[0].accessToken,
            },
        })
        .then((response) => response.json())
        .then((json) => {
            if(json.succeeded){
                this.setState({
                    lorryTypeList: json.results,
                });
            } 
        }).catch(err => {
            console.log(err);
        });
    }

    openImage(){
        const options = {
            title: 'Select Image',
            storageOptions: {
                skipBackup: true,
                path: 'images',
            },
        };

        ImagePicker.showImagePicker(options, (response) => {
            if (response.didCancel) {
                this.setState({
                    orderImage: "",
                });
            }else if (response.error) {
                this.setState({
                    orderImage: "",
                });
            }else {
                const source = response.uri;
                this.setState({
                    orderImage: source,
                });
            }
        });
        console.log('image: ', this.state.orderImage)
    }

    openImage2(){
        const options = {
            title: 'Select Image',
            storageOptions: {
                skipBackup: true,
                path: 'images',
            },
        };

        ImagePicker.showImagePicker(options, (response) => {
            if (response.didCancel) {
                this.setState({
                    orderImage2: "",
                });
            }else if (response.error) {
                this.setState({
                    orderImage2: "",
                });
            }else {
                const source = response.uri;
                this.setState({
                    orderImage2: source,
                });
            }
        });
    }

    openImage3(){
        const options = {
            title: 'Select Image',
            storageOptions: {
                skipBackup: true,
                path: 'images',
            },
        };

        ImagePicker.showImagePicker(options, (response) => {
            if (response.didCancel) {
                this.setState({
                    orderImage3: "",
                });
            }else if (response.error) {
                this.setState({
                    orderImage3: "",
                });
            }else {
                const source = response.uri;
                this.setState({
                    orderImage3: source,
                });
            }
        });
    }

    getLocationInfo(type, address, lat, long){
        if(address != '' && lat != '' && long != ''){
            if(type == 'pickUp'){
                this.setState({
                    pickUpLocation: address,
                    pickUpLatitude: lat,
                    pickUpLongitude: long,
                })
            }else{
                this.setState({
                    recipientAddress: address,
                    recipientAddressLatitude: lat,
                    recipientAddressLongitude: long,
                })
            }
        }
    }

    async addOrder(){
        this.setState({
            spinnerVisible: true,
            isClicked: true,
            isSubmit: true,
        })
        if(this.state.pickUpLocation === "" || this.state.pickUpDate === "" || this.state.expectedArrivalDate === "" || this.state.selectedLorryTypeId === "" || this.state.recipientName === "" || this.state.recipientAddress === "" || this.state.recipientEmail === "" || this.state.recipientPhoneNumber === "" || this.state.orderWeight === "" || this.state.orderDescription === "" || this.state.vehicleSpec === "" || this.state.orderImage === '' || this.state.orderImage2 === '' || this.state.orderImage3 === ''){
            Alert.alert('Cannot Add', "Please key in Pick Up Location, Pick Up Date, Expected Arrival Date, Lorry Type, Recipient Name, Recipient Address, Recipient Email, Recipient Phone Number, Order Weight(kg), Order Description, Vechicle Specification and Shipper Order Images", [{
        // if(this.state.pickUpLocation === "" || this.state.pickUpDate === "" || this.state.expectedArrivalDate === "" || this.state.selectedLorryTypeId === "" || this.state.recipientName === "" || this.state.recipientAddress === "" || this.state.recipientEmail === "" || this.state.recipientPhoneNumber === "" || this.state.orderWeight === "" || this.state.orderDescription === "" || this.state.vehicleSpec === "" || this.state.orderImage === '' || this.state.orderImage2 === '' || this.state.orderImage3 === ''|| this.state.selectedNumberOfManPower === 0|| this.state.selectedNumberOfTrolley === 0){
        //     Alert.alert('Cannot Add', "Please key in Pick Up Location, Pick Up Date, Expected Arrival Date, Lorry Type, No. of Manpower, No. of trolley, Recipient Name, Recipient Address, Recipient Email, Recipient Phone Number, Order Weight(kg), Order Description, Vechicle Specification and Shipper Order Images", [{
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
            if(this.state.pickUpLatitude == '' && this.state.pickUpLongitude == ''){
                await Geocoder.from(this.state.pickUpLocation)
                .then(json => {
                    var location = json.results[0].geometry.location;
                    console.log(location);
                    this.setState({
                        pickUpLatitude: location.lat,
                        pickUpLongitude: location.lng,
                    })
                })
                .catch(error => {
                    this.setState({
                        validAddress: true,
                    })
                    console.warn(error)
                });
            }

            if(this.state.recipientAddressLatitude == '' && this.state.recipientAddressLongitude == ''){
                await Geocoder.from(this.state.recipientAddress)
                .then(json => {
                    var location = json.results[0].geometry.location;
                    console.log(location);
                    this.setState({
                        recipientAddressLatitude: location.lat,
                        recipientAddressLongitude: location.lng,
                    })
                })
                .catch(error => {
                    this.setState({
                        validRecipientAddress: true,
                    })
                    console.warn(error)
                });
            }

            if(this.state.validAddress){
                Alert.alert('Cannot Add', 'The Pick Up location is invalid', [
                {
                    text: 'OK',
                    onPress: () => {
                        this.setState({
                            spinnerVisible: false,
                            isClicked: false,
                            isSubmit: false,
                            pickUpLatitude: '',
                            pickUpLongitude: '',
                            recipientAddressLatitude: '',
                            recipientAddressLongitude: '',
                            validAddress: false,
                        })
                    },
                }], {cancelable: false})
            }else if(this.state.validRecipientAddress){
                Alert.alert('Cannot Add', 'The Recipient Address is invalid', [
                {
                    text: 'OK',
                    onPress: () => {
                        this.setState({
                            spinnerVisible: false,
                            isClicked: false,
                            isSubmit: false,
                            pickUpLatitude: '',
                            pickUpLongitude: '',
                            recipientAddressLatitude: '',
                            recipientAddressLongitude: '',
                            validRecipientAddress: false,
                        })
                    },
                }], {cancelable: false})
            }else{
                var bodyData = new FormData();
                bodyData.append('pickUpLocation', this.state.pickUpLocation);
                bodyData.append('pickUpLocationLatitude', this.state.pickUpLatitude);
                bodyData.append('pickUpLocationLongitude', this.state.pickUpLongitude);
                bodyData.append('orderDescription', this.state.orderDescription);
                bodyData.append('orderWeight', this.state.orderWeight);
                bodyData.append('pickUpDateTime', this.state.pickUpDate);
                bodyData.append('arrivalDateTime', this.state.expectedArrivalDate);
                bodyData.append('favouriteRecipientId', this.state.favRecipientId);
                bodyData.append('recipientName', this.state.recipientName);
                bodyData.append('recipientAddress', this.state.recipientAddress);
                bodyData.append('recipientAddressLatitude', this.state.recipientAddressLatitude);
                bodyData.append('recipientAddressLongitude', this.state.recipientAddressLongitude);
                bodyData.append('lorryTypeId', this.state.selectedLorryTypeId);
                bodyData.append('recipientEmailAddress', this.state.recipientEmail);
                bodyData.append('recipientPhoneNumber', this.state.recipientPhoneNumber);
                bodyData.append('vehicleSpecificationId', this.state.vehicleSpec.toString());
                bodyData.append('deviceId', deviceId);
                bodyData.append('userId', loginAsset[0].userId);
                // bodyData.append('driverOrderId', this.props.navigation.getParam('driverOrderId'));
                bodyData.append('shipperOrderImage', { uri: this.state.orderImage, name: 'orderImage', type: 'image/jpeg' });
                bodyData.append('shipperOrderImage2', { uri: this.state.orderImage2, name: 'orderImage2', type: 'image/jpeg' });
                bodyData.append('shipperOrderImage3', { uri: this.state.orderImage3, name: 'orderImage3', type: 'image/jpeg' });
                console.log(bodyData)
                fetch(`${myApiUrl}/${addOrderPath}`, {
                    method: 'POST',
                    headers: new Headers({
                        // 'Accept': 'application/json',
                        'Content-Type': 'multipart/form-data',
                        'Authorization': loginAsset[0].accessToken,
                    }),
                    body: bodyData,
                    // body: JSON.stringify({
                    //     pickUpLocation: this.state.pickUpLocation,
                    //     pickUpLocationLatitude: this.state.pickUpLatitude,
                    //     pickUpLocationLongitude: this.state.pickUpLongitude,
                    //     orderDescription: this.state.orderDescription,
                    //     orderWeight: this.state.orderWeight,
                    //     pickUpDateTime: this.state.pickUpDate,
                    //     arrivalDateTime: this.state.expectedArrivalDate,
                    //     favouriteRecipientId: this.state.favRecipientId,
                    //     recipientName: this.state.recipientName,
                    //     recipientAddress: this.state.recipientAddress,
                    //     recipientAddressLatitude: this.state.recipientAddressLatitude,
                    //     recipientAddressLongitude: this.state.recipientAddressLongitude,
                    //     lorryTypeId: this.state.selectedLorryTypeId,
                    //     // recipientState: this.state.recipientState,
                    //     // recipientPostCode: this.state.recipientPostcode,
                    //     recipientEmailAddress: this.state.recipientEmail,
                    //     recipientPhoneNumber: this.state.recipientPhoneNumber,
                    //     vehicleSpecificationId: this.state.vehicleSpec,
                    //     deviceId: deviceId,
                    //     userId: loginAsset[0].userId,
                    // }),
                })
                .then((response) => response.json())
                .then((json) => {
                    console.log('add driver order ', json);
                    if(json.succeeded){
                        this.setState({
                            spinnerVisible: false,
                            isClicked: false,
                            isSubmit: false,
                        })
                        this.props.navigation.navigate('HistoryOrderDetails', {
                            shipperOrderId: json.results.shipperOrderId,
                        });
                    }else{
                        Alert.alert('Cannot Add', json.message, [
                        {
                            text: 'OK',
                            onPress: () => {
                                this.setState({
                                    spinnerVisible: false,
                                    isClicked: false,
                                    isSubmit: false,
                                })
                            },
                        }], {cancelable: false})
                    }
                }).catch(err => {
                    console.log(err);
                    this.setState({
                        spinnerVisible: false,
                        isClicked: false,
                        isSubmit: false,
                    })
                });
            }
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
            (Platform.OS === 'ios') ? <KeyboardAvoidingView behavior="padding" style={{backgroundColor: '#fff', padding: 10,}}>
                <ScrollView ref={ref => this.scrollView = ref}
                    onContentSizeChange={(contentWidth, contentHeight)=>{
                        if(this.state.isClicked){
                            this.scrollView.scrollToEnd({animated: true});
                        }
                    }}>
                    <View style={{margin: 0, paddingLeft: 15, paddingRight: 15, paddingTop: 20, paddingBottom: 20, backgroundColor: '#EFEFEF', borderRadius: 20,}}>
                    <View>
                        <View style={{flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginTop: -20, marginBottom: -10, }}>
                            <Image resizeMode='contain' style={{width: '10%',}} source={require('../assets/shipper.png')} />
                            <Text style={{fontSize: 18, alignItems: 'center', textAlign: 'center', fontFamily: 'AvenirLTStd-Roman', color: '#2C2E6D', paddingLeft: 10,}}>PICK UP DETAILS</Text>
                        </View>
                        <View>
                            <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Pick Up Location: 
                                <Text 
                                    style={{fontSize: 12, color: '#3c4c96', fontFamily: 'AvenirLTStd-Roman', textAlign: 'left', marginBottom: 15, textDecorationStyle: 'solid', textDecorationLine: 'underline',}}
                                    onPress={(e) => this.props.navigation.navigate('Map', {title: 'Pick Up Location', type: 'pickUp', onGoBack: this.getLocationInfo.bind(this)})}> Pick Location from Map</Text>
                            </Text>
                            <TextInput
                                style={{height: 50, backgroundColor: '#fff', marginBottom: 5, padding: 10, color: '#3c4c96', fontSize: 20, borderColor: '#3c4c96', borderWidth: 1, fontFamily: 'Raleway-Bold',}}
                                autoCapitalize="none"
                                autoCorrect={false}
                                underlineColorAndroid={'transparent'}
                                autoFocus={false}
                                keyboardType='default'
                                returnKeyLabel="next"
                                placeholder='Pick Up Location'
                                placeholderTextColor='#939ABA'
                                value={this.state.pickUpLocation}
                                onChangeText={(text) => {this.setState({ pickUpLocation: text });}}  /> */}
                            {/* <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Pick Up Location:  </Text>
                            <TouchableOpacity
                                style={{height: 50, backgroundColor: '#fff', marginBottom: 5, padding: 10, borderColor: '#3c4c96', borderWidth: 1, }}
                                onPress={() => this.props.navigation.navigate('Map', {title: 'Pick Up Location', type: 'pickUp', onGoBack: this.getLocationInfo.bind(this)})}>
                                {
                                    (this.state.pickUpLocation === '') ? <Text style={{fontSize: 20, fontFamily: 'Raleway-Bold', color: '#8289AC', }}>Pick Up Location</Text> :
                                    <Text style={{fontSize: 20, fontFamily: 'Raleway-Bold', color: '#3c4c96', }}>{this.state.pickUpLocation}</Text>
                                }
                            </TouchableOpacity> */}
                            <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'AvenirLTStd-Heavy',}}>Pick Up Location  </Text>
                            <TouchableOpacity
                                style={{height: 40, backgroundColor: '#EFEFEF', padding: 10, borderColor: '#A3A9C4', borderWidth: 1, }}
                                onPress={() => this.props.navigation.navigate('Map', {title: 'Pick Up Location', type: 'pickUp', onGoBack: this.getLocationInfo.bind(this)})}>
                                {
                                    (this.state.pickUpLocation === '') ? <Text style={{fontSize: 14, fontFamily: 'AvenirLTStd-Roman', color: '#A3A9C4', }}>Pick Up Location</Text> :
                                    <Text style={{fontSize: 14, fontFamily: 'AvenirLTStd-Roman', color: '#3c4c96', }}>{this.state.pickUpLocation}</Text>
                                }
                            </TouchableOpacity>
                        </View>
                        {/* <View>
                            <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Pick Up Date: </Text>
                            <DatePicker
                                style={{width: '100%', height: 50, marginBottom: 10,}}
                                customStyles={{
                                    dateTouchBody: {
                                        width: '100%',
                                        height: 50,
                                        backgroundColor: '#fff',
                                        marginBottom: 20,
                                        padding: 0,
                                        borderColor: '#3c4c96',
                                        borderWidth: 1,
                                    },
                                    placeholderText: {
                                        fontFamily: 'Raleway-Bold',
                                        color: '#939ABA',
                                        fontSize: 20,
                                        textAlign: 'left',
                                    },
                                    dateText: {
                                        fontFamily: 'Raleway-Bold',
                                        color: '#3c4c96',
                                        fontSize: 20,
                                        textAlign: 'left',
                                    },
                                    dateInput: {
                                        width: '100%',
                                        height: 50,
                                        backgroundColor: '#fff',
                                        borderColor: '#3c4c96',
                                        borderWidth: 1,
                                    },
                                }}
                                placeholder={'Pick Up Date'}
                                date={this.state.pickUpDate}
                                mode="datetime"
                                format="DD/MM/YYYY h:mm a"
                                is24Hour={false}
                                confirmBtnText="Confirm"
                                cancelBtnText="Cancel"
                                showIcon={false}
                                onDateChange={(datetime) => {this.setState({pickUpDate: datetime});}} />
                        </View> */}
                        <View>
                            <Text style={{paddingLeft: 0, paddingTop: 10, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'AvenirLTStd-Heavy',}}>Pick Up Date </Text>
                            <DatePicker
                                style={{width: '100%', marginBottom: 5, height: 40,}}
                                customStyles={{
                                    dateTouchBody: {
                                        width: '100%',
                                        height: 40,
                                        backgroundColor: '#EFEFEF',
                                        marginBottom: 0,
                                        padding: 0,
                                    },
                                    placeholderText: {
                                        fontFamily: 'AvenirLTStd-Roman',
                                        color: '#A3A9C4',
                                        fontSize: 14,
                                        justifyContent: 'flex-start',
                                        alignContent: 'flex-start',
                                        textAlign: 'left',
                                    },
                                    dateText: {
                                        fontFamily: 'AvenirLTStd-Roman',
                                        color: '#3c4c96',
                                        fontSize: 14,
                                        textAlign: 'left',
                                    },
                                    dateInput: {
                                        width: '100%',
                                        height: 40,
                                        backgroundColor: '#EFEFEF',
                                        borderColor: '#A3A9C4',
                                        borderWidth: 1,
                                        justifyContent: 'flex-start',
                                        alignItems: 'flex-start',
                                        padding: 10,
                                    },
                                }}
                                placeholder={'Pick Up Date'}
                                date={this.state.pickUpDate}
                                mode="datetime"
                                format="DD/MM/YYYY h:mm a"
                                is24Hour={false}
                                confirmBtnText="Confirm"
                                cancelBtnText="Cancel"
                                showIcon={false}
                                onDateChange={(datetime) => {this.setState({pickUpDate: datetime});}} />
                        </View>
                        {/* <View>
                            <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Expected Arrival Date: </Text>
                            <DatePicker
                                style={{width: '100%', height: 50, marginBottom: 10,}}
                                customStyles={{
                                    dateTouchBody: {
                                        width: '100%',
                                        height: 50,
                                        backgroundColor: '#fff',
                                        marginBottom: 20,
                                        padding: 0,
                                        borderColor: '#3c4c96',
                                        borderWidth: 1,
                                    },
                                    placeholderText: {
                                        fontFamily: 'Raleway-Bold',
                                        color: '#939ABA',
                                        fontSize: 20,
                                        textAlign: 'left',
                                    },
                                    dateText: {
                                        fontFamily: 'Raleway-Bold',
                                        color: '#3c4c96',
                                        fontSize: 20,
                                        textAlign: 'left',
                                    },
                                    dateInput: {
                                        width: '100%',
                                        height: 50,
                                        backgroundColor: '#fff',
                                        borderColor: '#3c4c96',
                                        borderWidth: 1,
                                    },
                                }}
                                placeholder={'Expected Arrival Date'}
                                date={this.state.expectedArrivalDate}
                                mode="datetime"
                                format="DD/MM/YYYY h:mm a"
                                is24Hour={false}
                                confirmBtnText="Confirm"
                                cancelBtnText="Cancel"
                                showIcon={false}
                                onDateChange={(datetime) => {this.setState({expectedArrivalDate: datetime});}} />
                        </View> */}
                        <View>
                            <Text style={{paddingLeft: 0, paddingTop: 10, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'AvenirLTStd-Heavy',}}>Expected Arrival Date </Text>
                            <DatePicker
                                style={{width: '100%', marginBottom: 5, height: 40,}}
                                customStyles={{
                                    dateTouchBody: {
                                        width: '100%',
                                        height: 40,
                                        backgroundColor: '#EFEFEF',
                                        marginBottom: 0,
                                        padding: 0,
                                    },
                                    placeholderText: {
                                        fontFamily: 'AvenirLTStd-Roman',
                                        color: '#A3A9C4',
                                        fontSize: 14,
                                        justifyContent: 'flex-start',
                                        alignContent: 'flex-start',
                                        textAlign: 'left',
                                    },
                                    dateText: {
                                        fontFamily: 'AvenirLTStd-Roman',
                                        color: '#3c4c96',
                                        fontSize: 14,
                                        textAlign: 'left',
                                    },
                                    dateInput: {
                                        width: '100%',
                                        height: 40,
                                        backgroundColor: '#EFEFEF',
                                        borderColor: '#A3A9C4',
                                        borderWidth: 1,
                                        justifyContent: 'flex-start',
                                        alignItems: 'flex-start',
                                        padding: 10,
                                    },
                                }}
                                placeholder={'Expected Arrival Date'}
                                date={this.state.expectedArrivalDate}
                                mode="datetime"
                                format="DD/MM/YYYY h:mm a"
                                is24Hour={false}
                                confirmBtnText="Confirm"
                                cancelBtnText="Cancel"
                                showIcon={false}
                                onDateChange={(datetime) => {this.setState({expectedArrivalDate: datetime});}} />
                        </View>
                        {/* <View>
                            <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Your Favourite Recipient: </Text>
                            <ModalSelector
                                data={this.state.favRecipientList}
                                supportedOrientations={['portrait']}
                                keyExtractor= {item => item.recipientId}
                                labelExtractor= {item => item.recipientName}
                                accessible={true}
                                scrollViewAccessibilityLabel={'Scrollable options'}
                                cancelButtonAccessibilityLabel={'Cancel Button'}
                                onChange={(option)=>{ 
                                    if(option.id === 0){
                                        this.setState({
                                            recipientName: "",
                                            favRecipientName: option.recipientName,
                                            recipientAddress: option.recipientAddress,
                                            recipientEmail: option.recipientEmailAddress,
                                            recipientPhoneNumber: option.recipientPhoneNumber,
                                            // recipientPostcode: option.recipientPostCode.toString(),
                                            // recipientState: option.recipientState,
                                            recipientAddressLatitude: option.recipientAddressLatitude,
                                            recipientAddressLongitude: option.recipientAddressLongitude,
                                            favRecipientId: option.recipientId
                                        })
                                    }else{
                                        this.setState({
                                            recipientName: option.recipientName,
                                            favRecipientName: option.recipientName,
                                            recipientAddress: option.recipientAddress,
                                            recipientEmail: option.recipientEmailAddress,
                                            recipientPhoneNumber: option.recipientPhoneNumber,
                                            // recipientPostcode: option.recipientPostCode.toString(),
                                            // recipientState: option.recipientState,
                                            recipientAddressLatitude: option.recipientAddressLatitude,
                                            recipientAddressLongitude: option.recipientAddressLongitude,
                                            favRecipientId: option.recipientId
                                        })     
                                    }
                                }}>
                                    <TextInput
                                    style={styles.input}
                                    editable={false}
                                    placeholder='Your Favourite Recipient'
                                    underlineColorAndroid={'transparent'}
                                    placeholderTextColor='#939ABA'
                                    value={this.state.favRecipientName}/>
                            </ModalSelector>
                        </View> */}
                        <View>
                            <Text style={{paddingLeft: 0, paddingTop: 10, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'AvenirLTStd-Heavy',}}>Your Favourite Recipient </Text>
                            <ModalSelector
                                data={this.state.favRecipientList}
                                supportedOrientations={['portrait']}
                                keyExtractor= {item => item.recipientId}
                                labelExtractor= {item => item.recipientName}
                                accessible={true}
                                scrollViewAccessibilityLabel={'Scrollable options'}
                                cancelButtonAccessibilityLabel={'Cancel Button'}
                                onChange={(option)=>{ 
                                    if(option.id === 0){
                                        this.setState({
                                            recipientName: "",
                                            favRecipientName: option.recipientName,
                                            recipientAddress: option.recipientAddress,
                                            recipientEmail: option.recipientEmailAddress,
                                            recipientPhoneNumber: option.recipientPhoneNumber,
                                            // recipientPostcode: option.recipientPostCode.toString(),
                                            // recipientState: option.recipientState,
                                            recipientAddressLatitude: option.recipientAddressLatitude,
                                            recipientAddressLongitude: option.recipientAddressLongitude,
                                            favRecipientId: option.recipientId
                                        })
                                    }else{
                                        this.setState({
                                            recipientName: option.recipientName,
                                            favRecipientName: option.recipientName,
                                            recipientAddress: option.recipientAddress,
                                            recipientEmail: option.recipientEmailAddress,
                                            recipientPhoneNumber: option.recipientPhoneNumber,
                                            // recipientPostcode: option.recipientPostCode.toString(),
                                            // recipientState: option.recipientState,
                                            recipientAddressLatitude: option.recipientAddressLatitude,
                                            recipientAddressLongitude: option.recipientAddressLongitude,
                                            favRecipientId: option.recipientId
                                        })
                                    }
                                    console.log(option)
                                    console.log(this.state.favRecipientId)
                                }}>
                                    <TextInput
                                    style={{fontSize: 14, fontFamily: 'AvenirLTStd-Roman', color: '#3c4c96', borderColor: '#A3A9C4', borderWidth: 1, height: 40, paddingLeft: 10, paddingRight: 10,}}
                                    editable={false}
                                    placeholder='Your Favourite Recipient'
                                    underlineColorAndroid={'transparent'}
                                    placeholderTextColor='#A3A9C4'
                                    value={this.state.favRecipientName}/>
                            </ModalSelector>
                        </View>
                        {/* <View>
                            <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Recipient Name: </Text>
                            <TextInput
                                style={{height: 50, backgroundColor: '#fff', marginBottom: 5, padding: 10, color: '#3c4c96', fontSize: 20, borderColor: '#3c4c96', borderWidth: 1, fontFamily: 'Raleway-Bold',}}
                                autoCapitalize="none"
                                underlineColorAndroid={'transparent'}
                                autoCorrect={false}
                                keyboardType='default'
                                returnKeyLabel="next"
                                placeholder='Recipient Name'
                                placeholderTextColor='#939ABA'
                                value={this.state.recipientName}
                                onChangeText={(text) => this.setState({ recipientName: text })}  />
                        </View> */}
                        <View>
                            <Text style={{paddingLeft: 0, paddingTop: 10, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'AvenirLTStd-Heavy',}}>Recipient Name </Text>
                            <TextInput
                                style={{fontSize: 14, fontFamily: 'AvenirLTStd-Roman', color: '#3c4c96', borderColor: '#A3A9C4', borderWidth: 1, height: 40, paddingLeft: 10, paddingRight: 10,}}
                                autoCapitalize="none"
                                underlineColorAndroid={'transparent'}
                                autoCorrect={false}
                                keyboardType='default'
                                returnKeyLabel="next"
                                placeholder='Recipient Name'
                                placeholderTextColor='#A3A9C4'
                                value={this.state.recipientName}
                                onChangeText={(text) => this.setState({ recipientName: text })}  />
                        </View>
                        <View>
                            <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Recipient Address: 
                                <Text 
                                    style={{fontSize: 12, color: '#3c4c96', fontFamily: 'AvenirLTStd-Roman', textAlign: 'left', marginBottom: 15, textDecorationStyle: 'solid', textDecorationLine: 'underline',}}
                                    onPress={(e) => this.props.navigation.navigate('Map', {title: 'Recipient Address', type: 'recipientAddress', onGoBack: this.getLocationInfo.bind(this)})}> Pick Location from Map</Text>
                            </Text>
                            <TextInput
                                style={styles.input}
                                autoCapitalize="none"
                                autoCorrect={false}
                                underlineColorAndroid={'transparent'}
                                returnKeyLabel="next"
                                placeholder='Recipient Address'
                                keyboardType={'default'}
                                placeholderTextColor='#939ABA'
                                value={this.state.recipientAddress}
                                onChangeText={(text) => this.setState({ recipientAddress: text })} /> */}
                            {/* <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Recipient Address:  </Text>
                            <TouchableOpacity
                                style={{height: 50, backgroundColor: '#fff', marginBottom: 5, padding: 10, borderColor: '#3c4c96', borderWidth: 1, }}
                                onPress={() => this.props.navigation.navigate('Map', {title: 'Recipient Address', type: 'recipientAddress', onGoBack: this.getLocationInfo.bind(this)})}>
                                {
                                    (this.state.recipientAddress === '') ? <Text style={{fontSize: 20, fontFamily: 'Raleway-Bold', color: '#8289AC', }}>Recipient Address</Text> :
                                    <Text style={{fontSize: 20, fontFamily: 'Raleway-Bold', color: '#3c4c96', }}>{this.state.recipientAddress}</Text>
                                }
                            </TouchableOpacity> */}
                            <Text style={{paddingLeft: 0, paddingTop: 10, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'AvenirLTStd-Heavy',}}>Recipient Address  </Text>
                            <TouchableOpacity
                                style={{height: 40, backgroundColor: '#EFEFEF', padding: 10, borderColor: '#A3A9C4', borderWidth: 1,}}
                                onPress={() => this.props.navigation.navigate('Map', {title: 'Recipient Address', type: 'recipientAddress', onGoBack: this.getLocationInfo.bind(this)})}>
                                {
                                    (this.state.recipientAddress === '') ? <Text style={{fontSize: 14, fontFamily: 'AvenirLTStd-Roman', color: '#A3A9C4', }}>Recipient Address</Text> :
                                    <Text style={{fontSize: 14, fontFamily: 'AvenirLTStd-Roman', color: '#3c4c96', }}>{this.state.recipientAddress}</Text>
                                }
                            </TouchableOpacity>
                        </View>
                        {/* <View>
                            <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Recipient Email Address: </Text>
                            <TextInput
                                style={styles.input}
                                autoCapitalize="none"
                                underlineColorAndroid={'transparent'}
                                autoCorrect={false}
                                keyboardType='email-address'
                                returnKeyLabel="next"
                                placeholder='Recipient Email Address'
                                placeholderTextColor='#939ABA'
                                value={this.state.recipientEmail}
                                onChangeText={(text) => this.setState({ recipientEmail: text })}  />
                        </View> */}
                        <View>
                            <Text style={{paddingLeft: 0, paddingTop: 10, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'AvenirLTStd-Heavy',}}>Recipient Email Address </Text>
                            <TextInput
                                style={{fontSize: 14, fontFamily: 'AvenirLTStd-Roman', color: '#3c4c96', borderColor: '#A3A9C4', borderWidth: 1, height: 40, paddingLeft: 10, paddingRight: 10,}}
                                autoCapitalize="none"
                                underlineColorAndroid={'transparent'}
                                autoCorrect={false}
                                keyboardType='email-address'
                                returnKeyLabel="next"
                                placeholder='Recipient Email Address'
                                placeholderTextColor='#A3A9C4'
                                value={this.state.recipientEmail}
                                onChangeText={(text) => this.setState({ recipientEmail: text })}  />
                        </View>
                        <View>
                            {/* <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Recipient Phone Number: </Text> */}
                            {/* <TextInput
                                style={styles.input}
                                autoCapitalize="none"
                                underlineColorAndroid={'transparent'}
                                autoCorrect={false}
                                returnKeyLabel="next"
                                keyboardType={'default'}
                                placeholder='Recipient Phone Number'
                                placeholderTextColor='#939ABA'
                                value={this.state.recipientPhoneNumber}
                                onChangeText={(text) => this.setState({ recipientPhoneNumber: text })} /> */}
                            <Text style={{paddingLeft: 0, paddingTop: 10, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'AvenirLTStd-Heavy',}}>Recipient Phone Number </Text>                            
                            <TextInputMask
                                style={{fontSize: 14, fontFamily: 'AvenirLTStd-Roman', color: '#3c4c96', borderColor: '#A3A9C4', borderWidth: 1, height: 40, paddingLeft: 10, paddingRight: 10,}}
                                underlineColorAndroid={'transparent'}
                                keyboardType='default'
                                placeholder='Recipient Phone Number'
                                placeholderTextColor='#A3A9C4'
                                type={'custom'}
                                options={{
                                    mask: '999-99999999', 
                                }}
                                value={this.state.recipientPhoneNumber}
                                onChangeText={text => {
                                    this.setState({
                                        recipientPhoneNumber: text
                                    })
                                }}
                            />
                        </View>
                        {/* <View>
                            <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Lorry Type: </Text>
                            <ModalSelector
                                data={this.state.lorryTypeList}
                                supportedOrientations={['portrait']}
                                keyExtractor= {item => item.lorryTypeId}
                                labelExtractor= {item => item.lorryTypeName}
                                accessible={true}
                                scrollViewAccessibilityLabel={'Scrollable options'}
                                cancelButtonAccessibilityLabel={'Cancel Button'}
                                onChange={(option)=>{ 
                                    this.setState({
                                        selectedLorryType: option.lorryTypeName,
                                        selectedLorryTypeId: option.lorryTypeId,
                                    })
                                }}>
                                <TextInput
                                    style={{height: 50, backgroundColor: '#fff', marginBottom: 10, padding: 10, color: '#3c4c96', fontSize: 20, borderColor: '#3c4c96', borderWidth: 1, marginLeft: 0, marginRight: 0, fontFamily: 'Raleway-Bold',}}
                                    editable={false}
                                    placeholder='Select Lorry Type'
                                    underlineColorAndroid={'transparent'}
                                    placeholderTextColor='#939ABA'
                                    value={this.state.selectedLorryType}/>
                            </ModalSelector>
                        </View> */}
                        <View>
                            <Text style={{paddingLeft: 0, paddingTop: 10, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'AvenirLTStd-Heavy',}}>Lorry Type </Text>
                            <ModalSelector
                                data={this.state.lorryTypeList}
                                supportedOrientations={['portrait']}
                                keyExtractor= {item => item.lorryTypeId}
                                labelExtractor= {item => item.lorryTypeName}
                                accessible={true}
                                scrollViewAccessibilityLabel={'Scrollable options'}
                                cancelButtonAccessibilityLabel={'Cancel Button'}
                                onChange={(option)=>{ 
                                    this.setState({
                                        selectedLorryType: option.lorryTypeName,
                                        selectedLorryTypeId: option.lorryTypeId,
                                    })
                                }}>
                                <TextInput
                                    style={{fontSize: 14, fontFamily: 'AvenirLTStd-Roman', color: '#3c4c96', borderColor: '#A3A9C4', borderWidth: 1, height: 40, paddingLeft: 10, paddingRight: 10,}}
                                    editable={false}
                                    placeholder='Select Lorry Type'
                                    underlineColorAndroid={'transparent'}
                                    placeholderTextColor='#A3A9C4'
                                    value={this.state.selectedLorryType}/>
                            </ModalSelector>
                        </View>
                        {/* <View>
                            <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>No. of ManPower (RM {this.state.manPowerPrice} per man): </Text>
                            <ModalSelector
                                data={this.state.totalNumberOfManPowerList}
                                supportedOrientations={['portrait']}
                                keyExtractor= {item => item.id}
                                labelExtractor= {item => item.manPowerValue}
                                accessible={true}
                                scrollViewAccessibilityLabel={'Scrollable options'}
                                cancelButtonAccessibilityLabel={'Cancel Button'}
                                onChange={(option)=>{ 
                                    this.setState({
                                        selectedNumberOfManPower: option.manPowerValue,
                                    })
                                }}>
                                <TextInput
                                    style={{height: 50, backgroundColor: '#fff', marginBottom: 10, padding: 10, color: '#3c4c96', fontSize: 20, borderColor: '#3c4c96', borderWidth: 1, marginLeft: 0, marginRight: 0, fontFamily: 'Raleway-Bold',}}
                                    editable={false}
                                    placeholder='Select No. of ManPower'
                                    underlineColorAndroid={'transparent'}
                                    placeholderTextColor='#939ABA'
                                    value={this.state.selectedNumberOfManPower.toString()}/>
                                </ModalSelector>
                        </View> */}
                        <View>
                            <Text style={{paddingLeft: 0, paddingTop: 10, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'AvenirLTStd-Heavy',}}>No. of ManPower (RM {this.state.manPowerPrice} per man) </Text>
                            <ModalSelector
                                data={this.state.totalNumberOfManPowerList}
                                supportedOrientations={['portrait']}
                                keyExtractor= {item => item.id}
                                labelExtractor= {item => item.manPowerValue}
                                accessible={true}
                                scrollViewAccessibilityLabel={'Scrollable options'}
                                cancelButtonAccessibilityLabel={'Cancel Button'}
                                onChange={(option)=>{ 
                                    this.setState({
                                        selectedNumberOfManPower: option.manPowerValue,
                                    })
                                }}>
                                <TextInput
                                    style={{fontSize: 14, fontFamily: 'AvenirLTStd-Roman', color: '#3c4c96', borderColor: '#A3A9C4', borderWidth: 1, height: 40, paddingLeft: 10, paddingRight: 10,}}
                                    editable={false}
                                    placeholder='Select No. of ManPower'
                                    underlineColorAndroid={'transparent'}
                                    placeholderTextColor='#A3A9C4'
                                    value={this.state.selectedNumberOfManPower.toString()}/>
                                </ModalSelector>
                        </View>
                        {/* <View>
                            <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>No. of Trolley (RM {this.state.trolleyPrice} per trolley): </Text>
                            <ModalSelector
                                data={this.state.totalNumberOfTrolleyList}
                                supportedOrientations={['portrait']}
                                keyExtractor= {item => item.id}
                                labelExtractor= {item => item.trolleyValue}
                                accessible={true}
                                scrollViewAccessibilityLabel={'Scrollable options'}
                                cancelButtonAccessibilityLabel={'Cancel Button'}
                                onChange={(option)=>{ 
                                    this.setState({
                                        selectedNumberOfTrolley: option.trolleyValue
                                    })
                                }}>
                                <TextInput
                                    style={{height: 50, backgroundColor: '#fff', marginBottom: 10, padding: 10, color: '#3c4c96', fontSize: 20, borderColor: '#3c4c96', borderWidth: 1, marginLeft: 0, marginRight: 0, fontFamily: 'Raleway-Bold',}}
                                    editable={false}
                                    placeholder='Select No. of Trolley'
                                    underlineColorAndroid={'transparent'}
                                    placeholderTextColor='#939ABA'
                                    value={this.state.selectedNumberOfTrolley.toString()}/>
                            </ModalSelector>
                        </View> */}
                        <View>
                            <Text style={{paddingLeft: 0, paddingTop: 10, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'AvenirLTStd-Heavy',}}>No. of Trolley (RM {this.state.trolleyPrice} per trolley) </Text>
                            <ModalSelector
                                data={this.state.totalNumberOfTrolleyList}
                                supportedOrientations={['portrait']}
                                keyExtractor= {item => item.id}
                                labelExtractor= {item => item.trolleyValue}
                                accessible={true}
                                scrollViewAccessibilityLabel={'Scrollable options'}
                                cancelButtonAccessibilityLabel={'Cancel Button'}
                                onChange={(option)=>{ 
                                    this.setState({
                                        selectedNumberOfTrolley: option.trolleyValue
                                    })
                                }}>
                                <TextInput
                                    style={{fontSize: 14, fontFamily: 'AvenirLTStd-Roman', color: '#3c4c96', borderColor: '#A3A9C4', borderWidth: 1, height: 40, paddingLeft: 10, paddingRight: 10,}}
                                    editable={false}
                                    placeholder='Select No. of Trolley'
                                    underlineColorAndroid={'transparent'}
                                    placeholderTextColor='#A3A9C4'
                                    value={this.state.selectedNumberOfTrolley.toString()}/>
                            </ModalSelector>
                        </View>
                        {/* <View>
                            <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Order Weight (kg): </Text>
                            <TextInput
                                style={styles.input}
                                autoCapitalize="none"
                                underlineColorAndroid={'transparent'}
                                autoCorrect={false}
                                returnKeyLabel="next"
                                keyboardType={'default'}
                                placeholder='Order Weight (kg)'
                                placeholderTextColor='#939ABA'
                                value={this.state.orderWeight}
                                onChangeText={(text) => this.setState({ orderWeight: text })} />
                        </View> */}
                        <View>
                            <Text style={{paddingLeft: 0, paddingTop: 10, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'AvenirLTStd-Heavy',}}>Order Weight (kg) </Text>
                            <TextInput
                                style={{fontSize: 14, fontFamily: 'AvenirLTStd-Roman', color: '#3c4c96', borderColor: '#A3A9C4', borderWidth: 1, height: 40, paddingLeft: 10, paddingRight: 10,}}
                                autoCapitalize="none"
                                underlineColorAndroid={'transparent'}
                                autoCorrect={false}
                                returnKeyLabel="next"
                                keyboardType={'default'}
                                placeholder='Order Weight (kg)'
                                placeholderTextColor='#A3A9C4'
                                value={this.state.orderWeight}
                                onChangeText={(text) => this.setState({ orderWeight: text })} />
                        </View>
                        {/* <View>
                            <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Order Description: </Text>
                            <TextInput
                                style={styles.input}
                                autoCapitalize="none"
                                underlineColorAndroid={'transparent'}
                                autoCorrect={false}
                                returnKeyLabel="next"
                                keyboardType={'default'}
                                placeholder='Order Description'
                                placeholderTextColor='#939ABA'
                                value={this.state.orderDescription}
                                onChangeText={(text) => this.setState({ orderDescription: text })} />
                        </View> */}
                        <View>
                            <Text style={{paddingLeft: 0, paddingTop: 10, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'AvenirLTStd-Heavy',}}>Order Description </Text>
                            <TextInput
                                style={{fontSize: 14, fontFamily: 'AvenirLTStd-Roman', color: '#3c4c96', borderColor: '#A3A9C4', borderWidth: 1, height: 40, paddingLeft: 10, paddingRight: 10,}}
                                autoCapitalize="none"
                                underlineColorAndroid={'transparent'}
                                autoCorrect={false}
                                returnKeyLabel="next"
                                keyboardType={'default'}
                                placeholder='Order Description'
                                placeholderTextColor='#A3A9C4'
                                value={this.state.orderDescription}
                                onChangeText={(text) => this.setState({ orderDescription: text })} />
                        </View>
                        {/* <View>
                            <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Vechicle Spec: </Text>
                            <MultiSelect
                                hideTags
                                style={styles.input}
                                items={this.state.vehicleSpecList}
                                uniqueKey="vehicleSpecificationId"
                                ref={(component) => { this.multiSelect = component }}
                                onSelectedItemsChange={this.onSelectedItemsChange}
                                selectedItems={this.state.vehicleSpec}
                                selectText="Select Vechicle Spec"
                                searchInputPlaceholderText="Search Vehicle Spec..."
                                onChangeInput={ (text)=> console.log(text)}
                                altFontFamily="AvenirLTStd-Roman"
                                itemFontSize={20}
                                fontSize={20}
                                tagRemoveIconColor="#3c4c96"
                                tagBorderColor="#3c4c96"
                                tagTextColor="#3c4c96"
                                selectedItemTextColor="#3c4c96"
                                selectedItemIconColor="#3c4c96"
                                itemTextColor="#3c4c96"
                                displayKey="vehicleSpecificationName"
                                searchInputStyle={{ color: '#3c4c96', height: 25, }}
                                submitButtonColor="#3c4c96"
                                submitButtonText="Done"
                            />
                        </View> */}
                        <View>
                            <Text style={{paddingLeft: 0, paddingTop: 10, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'AvenirLTStd-Heavy',}}>Vechicle Spec </Text>
                            <MultiSelect
                                hideTags
                                style={{fontSize: 14, fontFamily: 'AvenirLTStd-Roman', backgroundColor: '#EFEFEF', color: '#3c4c96', borderColor: '#A3A9C4', borderWidth: 1, paddingLeft: 10, height: 40,}}
                                items={this.state.vehicleSpecList}
                                uniqueKey="vehicleSpecificationId"
                                ref={(component) => { this.multiSelect = component }}
                                onSelectedItemsChange={this.onSelectedItemsChange}
                                selectedItems={this.state.vehicleSpec}
                                selectText="Select Vechicle Spec"
                                searchInputPlaceholderText="Search Vehicle Spec"
                                onChangeInput={ (text)=> console.log(text)}
                                altFontFamily="AvenirLTStd-Roman"
                                fontFamily="AvenirLTStd-Roman"
                                itemFontSize={14}
                                fontSize={14}
                                styleTextDropdownSelected={{backgroundColor: '#EFEFEF', color: '#3c4c96', }}
                                styleDropdownMenu={{backgroundColor: '#EFEFEF', borderColor: '#A3A9C4', borderWidth: 1, paddingLeft: 10, }}
                                styleDropdownMenuSubsection={{backgroundColor: '#EFEFEF', }}
                                styleTextDropdown={{backgroundColor: '#EFEFEF', color: '#A3A9C4', }}
                                tagRemoveIconColor="#3c4c96"
                                tagBorderColor="#3c4c96"
                                tagTextColor="#3c4c96"
                                selectedItemTextColor="#3c4c96"
                                selectedItemIconColor="#3c4c96"
                                itemTextColor="#3c4c96"
                                displayKey="vehicleSpecificationName"
                                searchInputStyle={{ color: '#3c4c96', height: 40,}}
                                submitButtonColor="#2C2E6D"
                                submitButtonText="Done"
                            />
                        </View>
                        {/* <TextInput
                            style={{height: 50, backgroundColor: '#fff', marginBottom: 5, padding: 10, color: '#3c4c96', fontSize: 20, borderColor: '#3c4c96', borderWidth: 1, fontFamily: 'Raleway-Bold',}}
                            autoCapitalize="none"
                            autoCorrect={false}
                            underlineColorAndroid={'transparent'}
                            autoFocus={false}
                            keyboardType='default'
                            returnKeyLabel="next"
                            placeholder='Pick Up Location'
                            placeholderTextColor='#939ABA'
                            value={this.state.pickUpLocation}
                            onChangeText={(text) => {this.setState({ pickUpLocation: text });}}  />
                        <DatePicker
                            style={{width: '100%', height: 50, marginBottom: 10,}}
                            customStyles={{
                                dateTouchBody: {
                                    width: '100%',
                                    height: 50,
                                    backgroundColor: '#fff',
                                    marginBottom: 20,
                                    padding: 0,
                                    borderColor: '#3c4c96',
                                    borderWidth: 1,
                                },
                                placeholderText: {
                                    fontFamily: 'Raleway-Bold',
                                    color: '#939ABA',
                                    fontSize: 20,
                                    textAlign: 'left',
                                },
                                dateText: {
                                    fontFamily: 'Raleway-Bold',
                                    color: '#3c4c96',
                                    fontSize: 20,
                                    textAlign: 'left',
                                },
                                dateInput: {
                                    width: '100%',
                                    height: 50,
                                    backgroundColor: '#fff',
                                    borderColor: '#3c4c96',
                                    borderWidth: 1,
                                },
                            }}
                            placeholder={'Pick Up Date'}
                            date={this.state.pickUpDate}
                            mode="datetime"
                            format="DD/MM/YYYY h:mm a"
                            is24Hour={false}
                            confirmBtnText="Confirm"
                            cancelBtnText="Cancel"
                            showIcon={false}
                            onDateChange={(datetime) => {this.setState({pickUpDate: datetime});}} />
                        <DatePicker
                            style={{width: '100%', height: 50, marginBottom: 10,}}
                            customStyles={{
                                dateTouchBody: {
                                    width: '100%',
                                    height: 50,
                                    backgroundColor: '#fff',
                                    marginBottom: 20,
                                    padding: 0,
                                    borderColor: '#3c4c96',
                                    borderWidth: 1,
                                },
                                placeholderText: {
                                    fontFamily: 'Raleway-Bold',
                                    color: '#939ABA',
                                    fontSize: 20,
                                    textAlign: 'left',
                                },
                                dateText: {
                                    fontFamily: 'Raleway-Bold',
                                    color: '#3c4c96',
                                    fontSize: 20,
                                    textAlign: 'left',
                                },
                                dateInput: {
                                    width: '100%',
                                    height: 50,
                                    backgroundColor: '#fff',
                                    borderColor: '#3c4c96',
                                    borderWidth: 1,
                                },
                            }}
                            placeholder={'Expected Arrival Date'}
                            date={this.state.expectedArrivalDate}
                            mode="datetime"
                            format="DD/MM/YYYY h:mm a"
                            is24Hour={false}
                            confirmBtnText="Confirm"
                            cancelBtnText="Cancel"
                            showIcon={false}
                            onDateChange={(datetime) => {this.setState({expectedArrivalDate: datetime});}} />
                        <ModalSelector
                            data={this.state.favRecipientList}
                            supportedOrientations={['portrait']}
                            keyExtractor= {item => item.recipientId}
                            labelExtractor= {item => item.recipientName}
                            accessible={true}
                            scrollViewAccessibilityLabel={'Scrollable options'}
                            cancelButtonAccessibilityLabel={'Cancel Button'}
                            onChange={(option)=>{ 
                                if(option.id === 0){
                                    this.setState({
                                        recipientName: "",
                                        favRecipientName: option.recipientName,
                                        recipientAddress: option.recipientAddress,
                                        recipientEmail: option.recipientEmailAddress,
                                        recipientPhoneNumber: option.recipientPhoneNumber,
                                        recipientPostcode: option.recipientPostCode.toString(),
                                        recipientState: option.recipientState,
                                        favRecipientId: option.id
                                    })
                                }else{
                                    this.setState({
                                        recipientName: option.recipientName,
                                        favRecipientName: option.recipientName,
                                        recipientAddress: option.recipientAddress,
                                        recipientEmail: option.recipientEmailAddress,
                                        recipientPhoneNumber: option.recipientPhoneNumber,
                                        recipientPostcode: option.recipientPostCode.toString(),
                                        recipientState: option.recipientState,
                                        favRecipientId: option.id
                                    })     
                                }
                            }}>
                            <TextInput
                                style={styles.input}
                                editable={false}
                                placeholder='Your Favourite Recipient'
                                underlineColorAndroid={'transparent'}
                                placeholderTextColor='#939ABA'
                                value={this.state.favRecipientName}/>
                        </ModalSelector>
                        <TextInput
                            style={{height: 50, backgroundColor: '#fff', marginBottom: 5, padding: 10, color: '#3c4c96', fontSize: 20, borderColor: '#3c4c96', borderWidth: 1, fontFamily: 'Raleway-Bold',}}
                            autoCapitalize="none"
                            underlineColorAndroid={'transparent'}
                            autoCorrect={false}
                            keyboardType='default'
                            returnKeyLabel="next"
                            placeholder='Recipient Name'
                            placeholderTextColor='#939ABA'
                            value={this.state.recipientName}
                            onChangeText={(text) => this.setState({ recipientName: text })}  />
                        <TextInput
                            style={styles.input}
                            autoCapitalize="none"
                            autoCorrect={false}
                            underlineColorAndroid={'transparent'}
                            returnKeyLabel="next"
                            placeholder='Recipient Address'
                            keyboardType={'default'}
                            placeholderTextColor='#939ABA'
                            value={this.state.recipientAddress}
                            onChangeText={(text) => this.setState({ recipientAddress: text })} />
                        <TextInput
                            style={styles.input}
                            autoCapitalize="none"
                            underlineColorAndroid={'transparent'}
                            autoCorrect={false}
                            returnKeyLabel="next"
                            keyboardType={'default'}
                            placeholder='Recipient State'
                            placeholderTextColor='#939ABA'
                            value={this.state.recipientState}
                            onChangeText={(text) => this.setState({ recipientState: text })} />
                        <TextInput
                            style={styles.input}
                            underlineColorAndroid={'transparent'}
                            autoCapitalize="none"
                            autoCorrect={false}
                            keyboardType='numeric'
                            returnKeyLabel="next"
                            placeholder='Recipient Postcode'
                            placeholderTextColor='#939ABA'
                            value={this.state.recipientPostcode}
                            onChangeText={(text) => this.setState({ recipientPostcode: text })}  />
                        <TextInput
                            style={styles.input}
                            autoCapitalize="none"
                            underlineColorAndroid={'transparent'}
                            autoCorrect={false}
                            keyboardType='email-address'
                            returnKeyLabel="next"
                            placeholder='Recipient Email Address'
                            placeholderTextColor='#939ABA'
                            value={this.state.recipientEmail}
                            onChangeText={(text) => this.setState({ recipientEmail: text })}  />
                        <TextInput
                            style={styles.input}
                            autoCapitalize="none"
                            underlineColorAndroid={'transparent'}
                            autoCorrect={false}
                            returnKeyLabel="next"
                            keyboardType={'default'}
                            placeholder='Recipient Phone Number'
                            placeholderTextColor='#939ABA'
                            value={this.state.recipientPhoneNumber}
                            onChangeText={(text) => this.setState({ recipientPhoneNumber: text })} />
                        <TextInput
                            style={styles.input}
                            autoCapitalize="none"
                            underlineColorAndroid={'transparent'}
                            autoCorrect={false}
                            returnKeyLabel="next"
                            keyboardType={'default'}
                            placeholder='Order Weight (kg)'
                            placeholderTextColor='#939ABA'
                            value={this.state.orderWeight}
                            onChangeText={(text) => this.setState({ orderWeight: text })} />
                        <TextInput
                            style={styles.input}
                            autoCapitalize="none"
                            underlineColorAndroid={'transparent'}
                            autoCorrect={false}
                            returnKeyLabel="next"
                            keyboardType={'default'}
                            placeholder='Order Description'
                            placeholderTextColor='#939ABA'
                            value={this.state.orderDescription}
                            onChangeText={(text) => this.setState({ orderDescription: text })} />
                        <MultiSelect
                            hideTags
                            style={styles.input}
                            items={this.state.vehicleSpecList}
                            uniqueKey="vehicleSpecificationId"
                            ref={(component) => { this.multiSelect = component }}
                            onSelectedItemsChange={this.onSelectedItemsChange}
                            selectedItems={this.state.vehicleSpec}
                            selectText="Select Vechicle Spec"
                            searchInputPlaceholderText="Search Vehicle Spec..."
                            onChangeInput={ (text)=> console.log(text)}
                            altFontFamily="AvenirLTStd-Roman"
                            itemFontSize={20}
                            fontSize={20}
                            tagRemoveIconColor="#3c4c96"
                            tagBorderColor="#3c4c96"
                            tagTextColor="#3c4c96"
                            selectedItemTextColor="#3c4c96"
                            selectedItemIconColor="#3c4c96"
                            itemTextColor="#3c4c96"
                            displayKey="vehicleSpecificationName"
                            searchInputStyle={{ color: '#3c4c96', height: 25, }}
                            submitButtonColor="#3c4c96"
                            submitButtonText="Done"
                        /> */}
                        <View>
                            {this.multiSelect ? this.multiSelect.getSelectedItemsExt(this.state.vehicleSpec) : null}
                        </View>
                        {/* <View style={{paddingLeft: 0, paddingRight: 0, paddingTop: 5, }}>
                            <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Order Image: </Text>
                            <View style={{flexDirection: 'row',}}>
                                {
                                    (this.state.orderImage !== "") ? <View style={{flexDirection: 'row',}}>
                                        <Image resizeMode="cover" source={{ uri: this.state.orderImage }} style={{width: 50, height: 40, marginLeft: 5, marginRight: 0,}} /> 
                                        <TouchableOpacity
                                            style={{backgroundColor: '#3c4c96', marginLeft: 20, marginRight: 20, marginBottom: 5, marginTop: 0, paddingVertical: 10, width: 150, }}
                                            onPress={(e) => this.openImage()}>
                                            <Text style={{color: '#fff', textAlign: 'center', fontWeight: '700', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Choose Image</Text>
                                        </TouchableOpacity>
                                    </View>
                                    : <TouchableOpacity
                                        style={{backgroundColor: '#3c4c96', marginLeft: 0, marginRight: 0, marginBottom: 5, marginTop: 0, paddingVertical: 10, width: 150,}}
                                        onPress={(e) => this.openImage()}>
                                        <Text style={{color: '#fff', textAlign: 'center', fontWeight: '700', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Choose Image</Text>
                                    </TouchableOpacity>
                                }
                            </View>
                        </View> */}
                        <View style={{paddingLeft: 0, paddingRight: 0, paddingTop: 0, }}>
                            <Text style={{paddingLeft: 0, paddingTop: 10, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'AvenirLTStd-Heavy',}}>Order Image 1</Text>
                            <View style={{flexDirection: 'row',}}>
                                {
                                    (this.state.orderImage !== "") ? <View style={{flexDirection: 'row',}}>
                                        <Image resizeMode="cover" source={{ uri: this.state.orderImage }} style={{width: 40, height: 30, marginLeft: 0, marginRight: 0,}} /> 
                                        <TouchableOpacity
                                            style={{backgroundColor: '#F2BB45', marginLeft: 10, marginRight: 10, marginBottom: 0, marginTop: 0, paddingVertical: 10, width: 150, }}
                                            onPress={(e) => this.openImage()}>
                                            <Text style={{color: '#fff', textAlign: 'center', fontSize: 15, fontFamily: 'AvenirLTStd-Medium',}}>Choose Image</Text>
                                        </TouchableOpacity>
                                    </View> 
                                    : <TouchableOpacity
                                        style={{backgroundColor: '#F2BB45', marginLeft: 0, marginRight: 0, marginBottom: 0, marginTop: 0, paddingVertical: 10, width: 150,}}
                                        onPress={(e) => this.openImage()}>
                                        <Text style={{color: '#fff', textAlign: 'center', fontSize: 15, fontFamily: 'AvenirLTStd-Medium',}}>Choose Image</Text>
                                    </TouchableOpacity>
                                }
                            </View>
                        </View>
                        <View style={{paddingLeft: 0, paddingRight: 0, paddingTop: 0, }}>
                            <Text style={{paddingLeft: 0, paddingTop: 10, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'AvenirLTStd-Heavy',}}>Order Image 2</Text>
                            <View style={{flexDirection: 'row',}}>
                                {
                                    (this.state.orderImage2 !== "") ? <View style={{flexDirection: 'row',}}>
                                        <Image resizeMode="cover" source={{ uri: this.state.orderImage2 }} style={{width: 40, height: 30, marginLeft: 0, marginRight: 0,}} /> 
                                        <TouchableOpacity
                                            style={{backgroundColor: '#F2BB45', marginLeft: 10, marginRight: 10, marginBottom: 0, marginTop: 0, paddingVertical: 10, width: 150, }}
                                            onPress={(e) => this.openImage2()}>
                                            <Text style={{color: '#fff', textAlign: 'center', fontSize: 15, fontFamily: 'AvenirLTStd-Medium',}}>Choose Image</Text>
                                        </TouchableOpacity>
                                    </View> 
                                    : <TouchableOpacity
                                        style={{backgroundColor: '#F2BB45', marginLeft: 0, marginRight: 0, marginBottom: 0, marginTop: 0, paddingVertical: 10, width: 150,}}
                                        onPress={(e) => this.openImage2()}>
                                        <Text style={{color: '#fff', textAlign: 'center', fontSize: 15, fontFamily: 'AvenirLTStd-Medium',}}>Choose Image</Text>
                                    </TouchableOpacity>
                                }
                            </View>
                        </View>
                        <View style={{paddingLeft: 0, paddingRight: 0, paddingTop: 0, }}>
                            <Text style={{paddingLeft: 0, paddingTop: 10, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'AvenirLTStd-Heavy',}}>Order Image 3</Text>
                            <View style={{flexDirection: 'row',}}>
                                {
                                    (this.state.orderImage3 !== "") ? <View style={{flexDirection: 'row',}}>
                                        <Image resizeMode="cover" source={{ uri: this.state.orderImage3 }} style={{width: 40, height: 30, marginLeft: 0, marginRight: 0,}} /> 
                                        <TouchableOpacity
                                            style={{backgroundColor: '#F2BB45', marginLeft: 10, marginRight: 10, marginBottom: 0, marginTop: 0, paddingVertical: 10, width: 150, }}
                                            onPress={(e) => this.openImage3()}>
                                            <Text style={{color: '#fff', textAlign: 'center', fontSize: 15, fontFamily: 'AvenirLTStd-Medium',}}>Choose Image</Text>
                                        </TouchableOpacity>
                                    </View> 
                                    : <TouchableOpacity
                                        style={{backgroundColor: '#F2BB45', marginLeft: 0, marginRight: 0, marginBottom: 0, marginTop: 0, paddingVertical: 10, width: 150,}}
                                        onPress={(e) => this.openImage3()}>
                                        <Text style={{color: '#fff', textAlign: 'center', fontSize: 15, fontFamily: 'AvenirLTStd-Medium',}}>Choose Image</Text>
                                    </TouchableOpacity>
                                }
                            </View>
                        </View>
                    </View>
                    {spinnerView}
                    </View>
                    {/* <View style={{paddingTop: 10,}}>
                        <TouchableOpacity
                            disabled={this.state.isSubmit}
                            style={this.state.isSubmit ? {backgroundColor: '#7D839C', paddingVertical: 15,} : styles.buttonContainer}
                            onPress={(e) => this.addOrder()}>
                            <Text style={styles.buttonText}>Add Order</Text>
                        </TouchableOpacity>
                    </View> */}
                    <View style={this.state.isSubmit ? {backgroundColor: '#F4D549', borderRadius: 20, paddingLeft: 10, paddingRight: 10, marginLeft: 10, marginRight: 10, marginBottom: 20, marginTop: 20,} : {backgroundColor: '#2C2E6D', borderRadius: 20, paddingLeft: 10, paddingRight: 10, marginLeft: 10, marginRight: 10, marginBottom: 20, marginTop: 20,}}>
                        <TouchableOpacity
                            disabled={this.state.isSubmit}
                            style={this.state.isSubmit ? {backgroundColor: '#F4D549', borderRadius: 20, paddingVertical: 15,} : styles.buttonContainer}
                            onPress={(e) => this.addOrder()}>
                            <Text style={this.state.isSubmit ? {color: '#2C2E6D', textAlign: 'center', fontSize: 16, fontFamily: 'AvenirLTStd-Black',} : {color: '#fff', textAlign: 'center', fontSize: 16, fontFamily: 'AvenirLTStd-Black',}}>Add Order</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView> : <KeyboardAvoidingView style={{backgroundColor: '#fff', padding: 10,}}>
                {/* <ScrollView>
                    <View>
                        <View>
                            <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Pick Up Location:  </Text>
                            <TouchableOpacity
                                style={{height: 50, backgroundColor: '#fff', marginBottom: 5, padding: 10, borderColor: '#3c4c96', borderWidth: 1, }}
                                onPress={() => this.props.navigation.navigate('Map', {title: 'Pick Up Location', type: 'pickUp', onGoBack: this.getLocationInfo.bind(this)})}>
                                {
                                    (this.state.pickUpLocation === '') ? <Text style={{fontSize: 20, fontFamily: 'Raleway-Bold', color: '#8289AC', }}>Pick Up Location</Text> :
                                    <Text style={{fontSize: 20, fontFamily: 'Raleway-Bold', color: '#3c4c96', }}>{this.state.pickUpLocation}</Text>
                                }
                            </TouchableOpacity>
                        </View>
                        <View>
                            <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Pick Up Date: </Text>
                            <DatePicker
                                style={{width: '100%', height: 50, marginBottom: 10,}}
                                customStyles={{
                                    dateTouchBody: {
                                        width: '100%',
                                        height: 50,
                                        backgroundColor: '#fff',
                                        marginBottom: 20,
                                        padding: 0,
                                        borderColor: '#3c4c96',
                                        borderWidth: 1,
                                    },
                                    placeholderText: {
                                        fontFamily: 'Raleway-Bold',
                                        color: '#939ABA',
                                        fontSize: 20,
                                        textAlign: 'left',
                                    },
                                    dateText: {
                                        fontFamily: 'Raleway-Bold',
                                        color: '#3c4c96',
                                        fontSize: 20,
                                        textAlign: 'left',
                                    },
                                    dateInput: {
                                        width: '100%',
                                        height: 50,
                                        backgroundColor: '#fff',
                                        borderColor: '#3c4c96',
                                        borderWidth: 1,
                                    },
                                }}
                                placeholder={'Pick Up Date'}
                                date={this.state.pickUpDate}
                                mode="datetime"
                                format="DD/MM/YYYY h:mm a"
                                is24Hour={false}
                                confirmBtnText="Confirm"
                                cancelBtnText="Cancel"
                                showIcon={false}
                                onDateChange={(datetime) => {this.setState({pickUpDate: datetime});}} />
                        </View>
                        <View>
                            <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Expected Arrival Date: </Text>
                            <DatePicker
                                style={{width: '100%', height: 50, marginBottom: 10,}}
                                customStyles={{
                                    dateTouchBody: {
                                        width: '100%',
                                        height: 50,
                                        backgroundColor: '#fff',
                                        marginBottom: 20,
                                        padding: 0,
                                        borderColor: '#3c4c96',
                                        borderWidth: 1,
                                    },
                                    placeholderText: {
                                        fontFamily: 'Raleway-Bold',
                                        color: '#939ABA',
                                        fontSize: 20,
                                        textAlign: 'left',
                                    },
                                    dateText: {
                                        fontFamily: 'Raleway-Bold',
                                        color: '#3c4c96',
                                        fontSize: 20,
                                        textAlign: 'left',
                                    },
                                    dateInput: {
                                        width: '100%',
                                        height: 50,
                                        backgroundColor: '#fff',
                                        borderColor: '#3c4c96',
                                        borderWidth: 1,
                                    },
                                }}
                                placeholder={'Expected Arrival Date'}
                                date={this.state.expectedArrivalDate}
                                mode="datetime"
                                format="DD/MM/YYYY h:mm a"
                                is24Hour={false}
                                confirmBtnText="Confirm"
                                cancelBtnText="Cancel"
                                showIcon={false}
                                onDateChange={(datetime) => {this.setState({expectedArrivalDate: datetime});}} />
                        </View>
                        <View>
                            <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Your Favourite Recipient: </Text>
                            <ModalSelector
                                data={this.state.favRecipientList}
                                supportedOrientations={['portrait']}
                                keyExtractor= {item => item.recipientId}
                                labelExtractor= {item => item.recipientName}
                                accessible={true}
                                scrollViewAccessibilityLabel={'Scrollable options'}
                                cancelButtonAccessibilityLabel={'Cancel Button'}
                                onChange={(option)=>{ 
                                    if(option.id === 0){
                                        this.setState({
                                            recipientName: "",
                                            favRecipientName: option.recipientName,
                                            recipientAddress: option.recipientAddress,
                                            recipientEmail: option.recipientEmailAddress,
                                            recipientPhoneNumber: option.recipientPhoneNumber,
                                            // recipientPostcode: option.recipientPostCode.toString(),
                                            // recipientState: option.recipientState,
                                            recipientAddressLatitude: option.recipientAddressLatitude,
                                            recipientAddressLongitude: option.recipientAddressLongitude,
                                            favRecipientId: option.recipientId
                                        })
                                    }else{
                                        this.setState({
                                            recipientName: option.recipientName,
                                            favRecipientName: option.recipientName,
                                            recipientAddress: option.recipientAddress,
                                            recipientEmail: option.recipientEmailAddress,
                                            recipientPhoneNumber: option.recipientPhoneNumber,
                                            // recipientPostcode: option.recipientPostCode.toString(),
                                            // recipientState: option.recipientState,
                                            recipientAddressLatitude: option.recipientAddressLatitude,
                                            recipientAddressLongitude: option.recipientAddressLongitude,
                                            favRecipientId: option.recipientId
                                        })     
                                    }
                                }}>
                                    <TextInput
                                    style={styles.input}
                                    editable={false}
                                    placeholder='Your Favourite Recipient'
                                    underlineColorAndroid={'transparent'}
                                    placeholderTextColor='#939ABA'
                                    value={this.state.favRecipientName}/>
                            </ModalSelector>
                        </View>
                        <View>
                            <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Recipient Name: </Text>
                            <TextInput
                                style={{height: 50, backgroundColor: '#fff', marginBottom: 5, padding: 10, color: '#3c4c96', fontSize: 20, borderColor: '#3c4c96', borderWidth: 1, fontFamily: 'Raleway-Bold',}}
                                autoCapitalize="none"
                                underlineColorAndroid={'transparent'}
                                autoCorrect={false}
                                keyboardType='default'
                                returnKeyLabel="next"
                                placeholder='Recipient Name'
                                placeholderTextColor='#939ABA'
                                value={this.state.recipientName}
                                onChangeText={(text) => this.setState({ recipientName: text })}  />
                        </View>
                        <View>
                            <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Recipient Address:  </Text>
                            <TouchableOpacity
                                style={{height: 50, backgroundColor: '#fff', marginBottom: 5, padding: 10, borderColor: '#3c4c96', borderWidth: 1, }}
                                onPress={() => this.props.navigation.navigate('Map', {title: 'Recipient Address', type: 'recipientAddress', onGoBack: this.getLocationInfo.bind(this)})}>
                                {
                                    (this.state.recipientAddress === '') ? <Text style={{fontSize: 20, fontFamily: 'Raleway-Bold', color: '#8289AC', }}>Recipient Address</Text> :
                                    <Text style={{fontSize: 20, fontFamily: 'Raleway-Bold', color: '#3c4c96', }}>{this.state.recipientAddress}</Text>
                                }
                            </TouchableOpacity>
                        </View>
                        <View>
                            <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Recipient Email Address: </Text>
                            <TextInput
                                style={styles.input}
                                autoCapitalize="none"
                                underlineColorAndroid={'transparent'}
                                autoCorrect={false}
                                keyboardType='email-address'
                                returnKeyLabel="next"
                                placeholder='Recipient Email Address'
                                placeholderTextColor='#939ABA'
                                value={this.state.recipientEmail}
                                onChangeText={(text) => this.setState({ recipientEmail: text })}  />
                        </View>
                        <View>
                            <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Recipient Phone Number: </Text>
                            <TextInputMask
                                style={styles.input}
                                underlineColorAndroid={'transparent'}
                                keyboardType='default'
                                placeholder='Recipient Phone Number'
                                placeholderTextColor='#939ABA'
                                type={'custom'}
                                options={{
                                    mask: '999-99999999', 
                                }}
                                value={this.state.recipientPhoneNumber}
                                onChangeText={text => {
                                    this.setState({
                                        recipientPhoneNumber: text
                                    })
                                }}
                            />
                        </View>
                        <View>
                            <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Lorry Type: </Text>
                            <ModalSelector
                                data={this.state.lorryTypeList}
                                supportedOrientations={['portrait']}
                                keyExtractor= {item => item.lorryTypeId}
                                labelExtractor= {item => item.lorryTypeName}
                                accessible={true}
                                scrollViewAccessibilityLabel={'Scrollable options'}
                                cancelButtonAccessibilityLabel={'Cancel Button'}
                                onChange={(option)=>{ 
                                    this.setState({
                                        selectedLorryType: option.lorryTypeName,
                                        selectedLorryTypeId: option.lorryTypeId,
                                    })
                                }}>
                                <TextInput
                                    style={{height: 50, backgroundColor: '#fff', marginBottom: 10, padding: 10, color: '#3c4c96', fontSize: 20, borderColor: '#3c4c96', borderWidth: 1, marginLeft: 0, marginRight: 0, fontFamily: 'Raleway-Bold',}}
                                    editable={false}
                                    placeholder='Select Lorry Type'
                                    underlineColorAndroid={'transparent'}
                                    placeholderTextColor='#939ABA'
                                    value={this.state.selectedLorryType}/>
                            </ModalSelector>
                        </View>
                        <View>
                            <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Order Weight (kg): </Text>
                            <TextInput
                                style={styles.input}
                                autoCapitalize="none"
                                underlineColorAndroid={'transparent'}
                                autoCorrect={false}
                                returnKeyLabel="next"
                                keyboardType={'default'}
                                placeholder='Order Weight (kg)'
                                placeholderTextColor='#939ABA'
                                value={this.state.orderWeight}
                                onChangeText={(text) => this.setState({ orderWeight: text })} />
                        </View>
                        <View>
                            <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Order Description: </Text>
                            <TextInput
                                style={styles.input}
                                autoCapitalize="none"
                                underlineColorAndroid={'transparent'}
                                autoCorrect={false}
                                returnKeyLabel="next"
                                keyboardType={'default'}
                                placeholder='Order Description'
                                placeholderTextColor='#939ABA'
                                value={this.state.orderDescription}
                                onChangeText={(text) => this.setState({ orderDescription: text })} />
                        </View>
                        <View>
                            <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Vechicle Spec: </Text>
                            <MultiSelect
                                hideTags
                                style={styles.input}
                                items={this.state.vehicleSpecList}
                                uniqueKey="vehicleSpecificationId"
                                ref={(component) => { this.multiSelect = component }}
                                onSelectedItemsChange={this.onSelectedItemsChange}
                                selectedItems={this.state.vehicleSpec}
                                selectText="Select Vechicle Spec"
                                searchInputPlaceholderText="Search Vehicle Spec..."
                                onChangeInput={ (text)=> console.log(text)}
                                altFontFamily="AvenirLTStd-Roman"
                                itemFontSize={20}
                                fontSize={20}
                                tagRemoveIconColor="#3c4c96"
                                tagBorderColor="#3c4c96"
                                tagTextColor="#3c4c96"
                                selectedItemTextColor="#3c4c96"
                                selectedItemIconColor="#3c4c96"
                                itemTextColor="#3c4c96"
                                displayKey="vehicleSpecificationName"
                                searchInputStyle={{ color: '#3c4c96', height: 25, }}
                                submitButtonColor="#3c4c96"
                                submitButtonText="Done"
                            />
                        </View>
                        <View>
                            {this.multiSelect ? this.multiSelect.getSelectedItemsExt(this.state.vehicleSpec) : null}
                        </View>
                        <View style={{paddingLeft: 0, paddingRight: 0, paddingTop: 5, }}>
                            <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Order Image: </Text>
                            <View style={{flexDirection: 'row',}}>
                                {
                                    (this.state.orderImage !== "") ? <View style={{flexDirection: 'row',}}>
                                        <Image resizeMode="cover" source={{ uri: this.state.orderImage }} style={{width: 50, height: 40, marginLeft: 5, marginRight: 0,}} /> 
                                        <TouchableOpacity
                                            style={{backgroundColor: '#3c4c96', marginLeft: 20, marginRight: 20, marginBottom: 5, marginTop: 0, paddingVertical: 10, width: 150, }}
                                            onPress={(e) => this.openImage()}>
                                            <Text style={{color: '#fff', textAlign: 'center', fontWeight: '700', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Choose Image</Text>
                                        </TouchableOpacity>
                                    </View>
                                    : <TouchableOpacity
                                        style={{backgroundColor: '#3c4c96', marginLeft: 0, marginRight: 0, marginBottom: 5, marginTop: 0, paddingVertical: 10, width: 150,}}
                                        onPress={(e) => this.openImage()}>
                                        <Text style={{color: '#fff', textAlign: 'center', fontWeight: '700', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Choose Image</Text>
                                    </TouchableOpacity>
                                }
                            </View>
                        </View>
                    </View>
                    {spinnerView}
                    <View style={{paddingTop: 10,}}>
                        <TouchableOpacity
                            disabled={this.state.isSubmit}
                            style={this.state.isSubmit ? {backgroundColor: '#7D839C', paddingVertical: 15,} : styles.buttonContainer}
                            onPress={(e) => this.addOrder()}>
                            <Text style={styles.buttonText}>Add Order</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView> */}
                <ScrollView ref={ref => this.scrollView = ref}
                    onContentSizeChange={(contentWidth, contentHeight)=>{
                        if(this.state.isClicked){
                            this.scrollView.scrollToEnd({animated: true});
                        }
                    }}>
                    <View style={{margin: 0, paddingLeft: 15, paddingRight: 15, paddingTop: 20, paddingBottom: 20, backgroundColor: '#EFEFEF', borderRadius: 20,}}>
                    <View>
                        <View style={{flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginTop: -20, marginBottom: -10, }}>
                            <Image resizeMode='contain' style={{width: '10%',}} source={require('../assets/shipper.png')} />
                            <Text style={{fontSize: 18, alignItems: 'center', textAlign: 'center', fontFamily: 'AvenirLTStd-Roman', color: '#2C2E6D', paddingLeft: 10,}}>PICK UP DETAILS</Text>
                        </View>
                        <View>
                            <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'AvenirLTStd-Heavy',}}>Pick Up Location  </Text>
                            <TouchableOpacity
                                style={{height: 40, backgroundColor: '#EFEFEF', padding: 10, borderColor: '#A3A9C4', borderWidth: 1, }}
                                onPress={() => this.props.navigation.navigate('Map', {title: 'Pick Up Location', type: 'pickUp', onGoBack: this.getLocationInfo.bind(this)})}>
                                {
                                    (this.state.pickUpLocation === '') ? <Text style={{fontSize: 14, fontFamily: 'AvenirLTStd-Roman', color: '#A3A9C4', }}>Pick Up Location</Text> :
                                    <Text style={{fontSize: 14, fontFamily: 'AvenirLTStd-Roman', color: '#3c4c96', }}>{this.state.pickUpLocation}</Text>
                                }
                            </TouchableOpacity>
                        </View>
                        <View>
                            <Text style={{paddingLeft: 0, paddingTop: 10, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'AvenirLTStd-Heavy',}}>Pick Up Date </Text>
                            <DatePicker
                                style={{width: '100%', marginBottom: 5, height: 40,}}
                                customStyles={{
                                    dateTouchBody: {
                                        width: '100%',
                                        height: 40,
                                        backgroundColor: '#EFEFEF',
                                        marginBottom: 0,
                                        padding: 0,
                                    },
                                    placeholderText: {
                                        fontFamily: 'AvenirLTStd-Roman',
                                        color: '#A3A9C4',
                                        fontSize: 14,
                                        justifyContent: 'flex-start',
                                        alignContent: 'flex-start',
                                        textAlign: 'left',
                                    },
                                    dateText: {
                                        fontFamily: 'AvenirLTStd-Roman',
                                        color: '#3c4c96',
                                        fontSize: 14,
                                        textAlign: 'left',
                                    },
                                    dateInput: {
                                        width: '100%',
                                        height: 40,
                                        backgroundColor: '#EFEFEF',
                                        borderColor: '#A3A9C4',
                                        borderWidth: 1,
                                        justifyContent: 'flex-start',
                                        alignItems: 'flex-start',
                                        padding: 10,
                                    },
                                }}
                                placeholder={'Pick Up Date'}
                                date={this.state.pickUpDate}
                                mode="datetime"
                                format="DD/MM/YYYY h:mm a"
                                is24Hour={false}
                                confirmBtnText="Confirm"
                                cancelBtnText="Cancel"
                                showIcon={false}
                                onDateChange={(datetime) => {this.setState({pickUpDate: datetime});}} />
                        </View>
                        <View>
                            <Text style={{paddingLeft: 0, paddingTop: 10, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'AvenirLTStd-Heavy',}}>Expected Arrival Date </Text>
                            <DatePicker
                                style={{width: '100%', marginBottom: 5, height: 40,}}
                                customStyles={{
                                    dateTouchBody: {
                                        width: '100%',
                                        height: 40,
                                        backgroundColor: '#EFEFEF',
                                        marginBottom: 0,
                                        padding: 0,
                                    },
                                    placeholderText: {
                                        fontFamily: 'AvenirLTStd-Roman',
                                        color: '#A3A9C4',
                                        fontSize: 14,
                                        justifyContent: 'flex-start',
                                        alignContent: 'flex-start',
                                        textAlign: 'left',
                                    },
                                    dateText: {
                                        fontFamily: 'AvenirLTStd-Roman',
                                        color: '#3c4c96',
                                        fontSize: 14,
                                        textAlign: 'left',
                                    },
                                    dateInput: {
                                        width: '100%',
                                        height: 40,
                                        backgroundColor: '#EFEFEF',
                                        borderColor: '#A3A9C4',
                                        borderWidth: 1,
                                        justifyContent: 'flex-start',
                                        alignItems: 'flex-start',
                                        padding: 10,
                                    },
                                }}
                                placeholder={'Expected Arrival Date'}
                                date={this.state.expectedArrivalDate}
                                mode="datetime"
                                format="DD/MM/YYYY h:mm a"
                                is24Hour={false}
                                confirmBtnText="Confirm"
                                cancelBtnText="Cancel"
                                showIcon={false}
                                onDateChange={(datetime) => {this.setState({expectedArrivalDate: datetime});}} />
                        </View>
                        <View>
                            <Text style={{paddingLeft: 0, paddingTop: 10, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'AvenirLTStd-Heavy',}}>Your Favourite Recipient </Text>
                            <ModalSelector
                                data={this.state.favRecipientList}
                                supportedOrientations={['portrait']}
                                keyExtractor= {item => item.recipientId}
                                labelExtractor= {item => item.recipientName}
                                accessible={true}
                                scrollViewAccessibilityLabel={'Scrollable options'}
                                cancelButtonAccessibilityLabel={'Cancel Button'}
                                onChange={(option)=>{ 
                                    if(option.id === 0){
                                        this.setState({
                                            recipientName: "",
                                            favRecipientName: option.recipientName,
                                            recipientAddress: option.recipientAddress,
                                            recipientEmail: option.recipientEmailAddress,
                                            recipientPhoneNumber: option.recipientPhoneNumber,
                                            // recipientPostcode: option.recipientPostCode.toString(),
                                            // recipientState: option.recipientState,
                                            recipientAddressLatitude: option.recipientAddressLatitude,
                                            recipientAddressLongitude: option.recipientAddressLongitude,
                                            favRecipientId: option.recipientId
                                        })
                                    }else{
                                        this.setState({
                                            recipientName: option.recipientName,
                                            favRecipientName: option.recipientName,
                                            recipientAddress: option.recipientAddress,
                                            recipientEmail: option.recipientEmailAddress,
                                            recipientPhoneNumber: option.recipientPhoneNumber,
                                            // recipientPostcode: option.recipientPostCode.toString(),
                                            // recipientState: option.recipientState,
                                            recipientAddressLatitude: option.recipientAddressLatitude,
                                            recipientAddressLongitude: option.recipientAddressLongitude,
                                            favRecipientId: option.recipientId
                                        })
                                    }
                                    console.log(option)
                                    console.log(this.state.favRecipientId)
                                }}>
                                    <TextInput
                                    style={{fontSize: 14, fontFamily: 'AvenirLTStd-Roman', color: '#3c4c96', borderColor: '#A3A9C4', borderWidth: 1, height: 40, paddingLeft: 10, paddingRight: 10,}}
                                    editable={false}
                                    placeholder='Your Favourite Recipient'
                                    underlineColorAndroid={'transparent'}
                                    placeholderTextColor='#A3A9C4'
                                    value={this.state.favRecipientName}/>
                            </ModalSelector>
                        </View>
                        <View>
                            <Text style={{paddingLeft: 0, paddingTop: 10, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'AvenirLTStd-Heavy',}}>Recipient Name </Text>
                            <TextInput
                                style={{fontSize: 14, fontFamily: 'AvenirLTStd-Roman', color: '#3c4c96', borderColor: '#A3A9C4', borderWidth: 1, height: 40, paddingLeft: 10, paddingRight: 10,}}
                                autoCapitalize="none"
                                underlineColorAndroid={'transparent'}
                                autoCorrect={false}
                                keyboardType='default'
                                returnKeyLabel="next"
                                placeholder='Recipient Name'
                                placeholderTextColor='#A3A9C4'
                                value={this.state.recipientName}
                                onChangeText={(text) => this.setState({ recipientName: text })}  />
                        </View>
                        <View>
                            <Text style={{paddingLeft: 0, paddingTop: 10, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'AvenirLTStd-Heavy',}}>Recipient Address  </Text>
                            <TouchableOpacity
                                style={{height: 40, backgroundColor: '#EFEFEF', padding: 10, borderColor: '#A3A9C4', borderWidth: 1,}}
                                onPress={() => this.props.navigation.navigate('Map', {title: 'Recipient Address', type: 'recipientAddress', onGoBack: this.getLocationInfo.bind(this)})}>
                                {
                                    (this.state.recipientAddress === '') ? <Text style={{fontSize: 14, fontFamily: 'AvenirLTStd-Roman', color: '#A3A9C4', }}>Recipient Address</Text> :
                                    <Text style={{fontSize: 14, fontFamily: 'AvenirLTStd-Roman', color: '#3c4c96', }}>{this.state.recipientAddress}</Text>
                                }
                            </TouchableOpacity>
                        </View>
                        <View>
                            <Text style={{paddingLeft: 0, paddingTop: 10, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'AvenirLTStd-Heavy',}}>Recipient Email Address </Text>
                            <TextInput
                                style={{fontSize: 14, fontFamily: 'AvenirLTStd-Roman', color: '#3c4c96', borderColor: '#A3A9C4', borderWidth: 1, height: 40, paddingLeft: 10, paddingRight: 10,}}
                                autoCapitalize="none"
                                underlineColorAndroid={'transparent'}
                                autoCorrect={false}
                                keyboardType='email-address'
                                returnKeyLabel="next"
                                placeholder='Recipient Email Address'
                                placeholderTextColor='#A3A9C4'
                                value={this.state.recipientEmail}
                                onChangeText={(text) => this.setState({ recipientEmail: text })}  />
                        </View>
                        <View>
                            <Text style={{paddingLeft: 0, paddingTop: 10, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'AvenirLTStd-Heavy',}}>Recipient Phone Number </Text>                            
                            <TextInputMask
                                style={{fontSize: 14, fontFamily: 'AvenirLTStd-Roman', color: '#3c4c96', borderColor: '#A3A9C4', borderWidth: 1, height: 40, paddingLeft: 10, paddingRight: 10,}}
                                underlineColorAndroid={'transparent'}
                                keyboardType='default'
                                placeholder='Recipient Phone Number'
                                placeholderTextColor='#A3A9C4'
                                type={'custom'}
                                options={{
                                    mask: '999-99999999', 
                                }}
                                value={this.state.recipientPhoneNumber}
                                onChangeText={text => {
                                    this.setState({
                                        recipientPhoneNumber: text
                                    })
                                }}
                            />
                        </View>
                        <View>
                            <Text style={{paddingLeft: 0, paddingTop: 10, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'AvenirLTStd-Heavy',}}>Lorry Type </Text>
                            <ModalSelector
                                data={this.state.lorryTypeList}
                                supportedOrientations={['portrait']}
                                keyExtractor= {item => item.lorryTypeId}
                                labelExtractor= {item => item.lorryTypeName}
                                accessible={true}
                                scrollViewAccessibilityLabel={'Scrollable options'}
                                cancelButtonAccessibilityLabel={'Cancel Button'}
                                onChange={(option)=>{ 
                                    this.setState({
                                        selectedLorryType: option.lorryTypeName,
                                        selectedLorryTypeId: option.lorryTypeId,
                                    })
                                }}>
                                <TextInput
                                    style={{fontSize: 14, fontFamily: 'AvenirLTStd-Roman', color: '#3c4c96', borderColor: '#A3A9C4', borderWidth: 1, height: 40, paddingLeft: 10, paddingRight: 10,}}
                                    editable={false}
                                    placeholder='Select Lorry Type'
                                    underlineColorAndroid={'transparent'}
                                    placeholderTextColor='#A3A9C4'
                                    value={this.state.selectedLorryType}/>
                            </ModalSelector>
                        </View>
                        <View>
                            <Text style={{paddingLeft: 0, paddingTop: 10, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'AvenirLTStd-Heavy',}}>No. of ManPower (RM {this.state.manPowerPrice} per man) </Text>
                            <ModalSelector
                                data={this.state.totalNumberOfManPowerList}
                                supportedOrientations={['portrait']}
                                keyExtractor= {item => item.id}
                                labelExtractor= {item => item.manPowerValue}
                                accessible={true}
                                scrollViewAccessibilityLabel={'Scrollable options'}
                                cancelButtonAccessibilityLabel={'Cancel Button'}
                                onChange={(option)=>{ 
                                    this.setState({
                                        selectedNumberOfManPower: option.manPowerValue,
                                    })
                                }}>
                                <TextInput
                                    style={{fontSize: 14, fontFamily: 'AvenirLTStd-Roman', color: '#3c4c96', borderColor: '#A3A9C4', borderWidth: 1, height: 40, paddingLeft: 10, paddingRight: 10,}}
                                    editable={false}
                                    placeholder='Select No. of ManPower'
                                    underlineColorAndroid={'transparent'}
                                    placeholderTextColor='#A3A9C4'
                                    value={this.state.selectedNumberOfManPower.toString()}/>
                                </ModalSelector>
                        </View>
                        <View>
                            <Text style={{paddingLeft: 0, paddingTop: 10, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'AvenirLTStd-Heavy',}}>No. of Trolley (RM {this.state.trolleyPrice} per trolley) </Text>
                            <ModalSelector
                                data={this.state.totalNumberOfTrolleyList}
                                supportedOrientations={['portrait']}
                                keyExtractor= {item => item.id}
                                labelExtractor= {item => item.trolleyValue}
                                accessible={true}
                                scrollViewAccessibilityLabel={'Scrollable options'}
                                cancelButtonAccessibilityLabel={'Cancel Button'}
                                onChange={(option)=>{ 
                                    this.setState({
                                        selectedNumberOfTrolley: option.trolleyValue
                                    })
                                }}>
                                <TextInput
                                    style={{fontSize: 14, fontFamily: 'AvenirLTStd-Roman', color: '#3c4c96', borderColor: '#A3A9C4', borderWidth: 1, height: 40, paddingLeft: 10, paddingRight: 10,}}
                                    editable={false}
                                    placeholder='Select No. of Trolley'
                                    underlineColorAndroid={'transparent'}
                                    placeholderTextColor='#A3A9C4'
                                    value={this.state.selectedNumberOfTrolley.toString()}/>
                            </ModalSelector>
                        </View>
                        <View>
                            <Text style={{paddingLeft: 0, paddingTop: 10, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'AvenirLTStd-Heavy',}}>Order Weight (kg) </Text>
                            <TextInput
                                style={{fontSize: 14, fontFamily: 'AvenirLTStd-Roman', color: '#3c4c96', borderColor: '#A3A9C4', borderWidth: 1, height: 40, paddingLeft: 10, paddingRight: 10,}}
                                autoCapitalize="none"
                                underlineColorAndroid={'transparent'}
                                autoCorrect={false}
                                returnKeyLabel="next"
                                keyboardType={'default'}
                                placeholder='Order Weight (kg)'
                                placeholderTextColor='#A3A9C4'
                                value={this.state.orderWeight}
                                onChangeText={(text) => this.setState({ orderWeight: text })} />
                        </View>
                        <View>
                            <Text style={{paddingLeft: 0, paddingTop: 10, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'AvenirLTStd-Heavy',}}>Order Description </Text>
                            <TextInput
                                style={{fontSize: 14, fontFamily: 'AvenirLTStd-Roman', color: '#3c4c96', borderColor: '#A3A9C4', borderWidth: 1, height: 40, paddingLeft: 10, paddingRight: 10,}}
                                autoCapitalize="none"
                                underlineColorAndroid={'transparent'}
                                autoCorrect={false}
                                returnKeyLabel="next"
                                keyboardType={'default'}
                                placeholder='Order Description'
                                placeholderTextColor='#A3A9C4'
                                value={this.state.orderDescription}
                                onChangeText={(text) => this.setState({ orderDescription: text })} />
                        </View>
                        <View>
                            <Text style={{paddingLeft: 0, paddingTop: 10, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'AvenirLTStd-Heavy',}}>Vechicle Spec </Text>
                            <MultiSelect
                                hideTags
                                style={{fontSize: 14, fontFamily: 'AvenirLTStd-Roman', backgroundColor: '#EFEFEF', color: '#3c4c96', borderColor: '#A3A9C4', borderWidth: 1, paddingLeft: 10, height: 40,}}
                                items={this.state.vehicleSpecList}
                                uniqueKey="vehicleSpecificationId"
                                underlineColorAndroid={'transparent'}
                                ref={(component) => { this.multiSelect = component }}
                                onSelectedItemsChange={this.onSelectedItemsChange}
                                selectedItems={this.state.vehicleSpec}
                                selectText="Select Vechicle Spec"
                                searchInputPlaceholderText="Search Vehicle Spec"
                                onChangeInput={ (text)=> console.log(text)}
                                altFontFamily="AvenirLTStd-Roman"
                                fontFamily="AvenirLTStd-Roman"
                                itemFontSize={14}
                                fontSize={14}
                                styleTextDropdownSelected={{backgroundColor: '#EFEFEF', color: '#3c4c96', }}
                                styleDropdownMenu={{backgroundColor: '#EFEFEF', borderColor: '#A3A9C4', borderWidth: 1, paddingLeft: 10, }}
                                styleDropdownMenuSubsection={{backgroundColor: '#EFEFEF', height: 30,}}
                                styleTextDropdown={{backgroundColor: '#EFEFEF', color: '#A3A9C4', }}
                                tagRemoveIconColor="#3c4c96"
                                tagBorderColor="#3c4c96"
                                tagTextColor="#3c4c96"
                                selectedItemTextColor="#3c4c96"
                                selectedItemIconColor="#3c4c96"
                                itemTextColor="#3c4c96"
                                displayKey="vehicleSpecificationName"
                                searchInputStyle={{ color: '#3c4c96', height: 40,}}
                                submitButtonColor="#2C2E6D"
                                submitButtonText="Done"
                            />
                        </View>
                        <View>
                            {this.multiSelect ? this.multiSelect.getSelectedItemsExt(this.state.vehicleSpec) : null}
                        </View>
                        <View style={{paddingLeft: 0, paddingRight: 0, paddingTop: 0, }}>
                            <Text style={{paddingLeft: 0, paddingTop: 10, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'AvenirLTStd-Heavy',}}>Order Image 1</Text>
                            <View style={{flexDirection: 'row',}}>
                                {
                                    (this.state.orderImage !== "") ? <View style={{flexDirection: 'row',}}>
                                        <Image resizeMode="cover" source={{ uri: this.state.orderImage }} style={{width: 40, height: 30, marginLeft: 0, marginRight: 0,}} /> 
                                        <TouchableOpacity
                                            style={{backgroundColor: '#F2BB45', marginLeft: 10, marginRight: 10, marginBottom: 0, marginTop: 0, paddingVertical: 10, width: 150, }}
                                            onPress={(e) => this.openImage()}>
                                            <Text style={{color: '#fff', textAlign: 'center', fontSize: 15, fontFamily: 'AvenirLTStd-Medium',}}>Choose Image</Text>
                                        </TouchableOpacity>
                                    </View> 
                                    : <TouchableOpacity
                                        style={{backgroundColor: '#F2BB45', marginLeft: 0, marginRight: 0, marginBottom: 0, marginTop: 0, paddingVertical: 10, width: 150,}}
                                        onPress={(e) => this.openImage()}>
                                        <Text style={{color: '#fff', textAlign: 'center', fontSize: 15, fontFamily: 'AvenirLTStd-Medium',}}>Choose Image</Text>
                                    </TouchableOpacity>
                                }
                            </View>
                        </View>
                        <View style={{paddingLeft: 0, paddingRight: 0, paddingTop: 0, }}>
                            <Text style={{paddingLeft: 0, paddingTop: 10, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'AvenirLTStd-Heavy',}}>Order Image 2</Text>
                            <View style={{flexDirection: 'row',}}>
                                {
                                    (this.state.orderImage2 !== "") ? <View style={{flexDirection: 'row',}}>
                                        <Image resizeMode="cover" source={{ uri: this.state.orderImage2 }} style={{width: 40, height: 30, marginLeft: 0, marginRight: 0,}} /> 
                                        <TouchableOpacity
                                            style={{backgroundColor: '#F2BB45', marginLeft: 10, marginRight: 10, marginBottom: 0, marginTop: 0, paddingVertical: 10, width: 150, }}
                                            onPress={(e) => this.openImage2()}>
                                            <Text style={{color: '#fff', textAlign: 'center', fontSize: 15, fontFamily: 'AvenirLTStd-Medium',}}>Choose Image</Text>
                                        </TouchableOpacity>
                                    </View> 
                                    : <TouchableOpacity
                                        style={{backgroundColor: '#F2BB45', marginLeft: 0, marginRight: 0, marginBottom: 0, marginTop: 0, paddingVertical: 10, width: 150,}}
                                        onPress={(e) => this.openImage2()}>
                                        <Text style={{color: '#fff', textAlign: 'center', fontSize: 15, fontFamily: 'AvenirLTStd-Medium',}}>Choose Image</Text>
                                    </TouchableOpacity>
                                }
                            </View>
                        </View>
                        <View style={{paddingLeft: 0, paddingRight: 0, paddingTop: 0, }}>
                            <Text style={{paddingLeft: 0, paddingTop: 10, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'AvenirLTStd-Heavy',}}>Order Image 3</Text>
                            <View style={{flexDirection: 'row',}}>
                                {
                                    (this.state.orderImage3 !== "") ? <View style={{flexDirection: 'row',}}>
                                        <Image resizeMode="cover" source={{ uri: this.state.orderImage3 }} style={{width: 40, height: 30, marginLeft: 0, marginRight: 0,}} /> 
                                        <TouchableOpacity
                                            style={{backgroundColor: '#F2BB45', marginLeft: 10, marginRight: 10, marginBottom: 0, marginTop: 0, paddingVertical: 10, width: 150, }}
                                            onPress={(e) => this.openImage3()}>
                                            <Text style={{color: '#fff', textAlign: 'center', fontSize: 15, fontFamily: 'AvenirLTStd-Medium',}}>Choose Image</Text>
                                        </TouchableOpacity>
                                    </View> 
                                    : <TouchableOpacity
                                        style={{backgroundColor: '#F2BB45', marginLeft: 0, marginRight: 0, marginBottom: 0, marginTop: 0, paddingVertical: 10, width: 150,}}
                                        onPress={(e) => this.openImage3()}>
                                        <Text style={{color: '#fff', textAlign: 'center', fontSize: 15, fontFamily: 'AvenirLTStd-Medium',}}>Choose Image</Text>
                                    </TouchableOpacity>
                                }
                            </View>
                        </View>
                    </View>
                    {spinnerView}
                    </View>
                    <View style={this.state.isSubmit ? {backgroundColor: '#F4D549', borderRadius: 20, paddingLeft: 10, paddingRight: 10, marginLeft: 10, marginRight: 10, marginBottom: 20, marginTop: 20,} : {backgroundColor: '#2C2E6D', borderRadius: 20, paddingLeft: 10, paddingRight: 10, marginLeft: 10, marginRight: 10, marginBottom: 20, marginTop: 20,}}>
                        <TouchableOpacity
                            disabled={this.state.isSubmit}
                            style={this.state.isSubmit ? {backgroundColor: '#F4D549', borderRadius: 20, paddingVertical: 15,} : styles.buttonContainer}
                            onPress={(e) => this.addOrder()}>
                            <Text style={this.state.isSubmit ? {color: '#2C2E6D', textAlign: 'center', fontSize: 16, fontFamily: 'AvenirLTStd-Black',} : {color: '#fff', textAlign: 'center', fontSize: 16, fontFamily: 'AvenirLTStd-Black',}}>Add Order</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        )
    }
}