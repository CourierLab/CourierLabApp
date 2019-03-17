import React, { Component } from 'react';
import { Text, TextInput, View, Image, TouchableOpacity, KeyboardAvoidingView, Alert, ScrollView, Platform,  } from 'react-native';
import { styles } from '../utils/Style';
import NetworkConnection from '../utils/NetworkConnection';
import MyRealm from '../utils/Realm';
import Spinner from 'react-native-spinkit';
import DeviceInfo from 'react-native-device-info';
import MultiSelect from 'react-native-multiple-select';
import Geocoder from 'react-native-geocoding';
import DatePicker from 'react-native-datepicker';
import ModalSelector from 'react-native-modal-selector';

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
        title: 'Add Shipper Order',
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
                id: 0,
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

    addOrder(){
        this.setState({
            spinnerVisible: true,
            isClicked: true,
            isSubmit: true,
        })
        if(this.state.pickUpLocation === "" || this.state.pickUpDate === "" || this.state.expectedArrivalDate === "" || this.state.selectedLorryTypeId === "" || this.state.recipientName === "" || this.state.recipientAddress === "" || this.state.recipientEmail === "" || this.state.recipientPhoneNumber === "" || this.state.orderWeight === "" || this.state.orderDescription === "" || this.state.vehicleSpec === ""){
            Alert.alert('Cannot Add', "Please key in Pick Up Location, Pick Up Date, Expected Arrival Date, Lorry Type, Recipient Name, Recipient Address, Recipient Email, Recipient Phone Number, Order Weight(kg), Order Description and Vechicle Specification", [{
                text: 'OK',
                onPress: () => {},
            }], {cancelable: false});
            this.setState({
                spinnerVisible: false,
                isClicked: false,
                isSubmit: false,
            })
        }else{
            Geocoder.from(this.state.pickUpLocation)
            .then(json => {
                var location = json.results[0].geometry.location;
                console.log(location);
                this.setState({
                    pickUpLatitude: location.lat,
                    pickUpLongitude: location.lng,
                })
                
                Geocoder.from(this.state.recipientAddress)
                .then(json => {
                    var location = json.results[0].geometry.location;
                    console.log(location);
                    this.setState({
                        recipientAddressLatitude: location.lat,
                        recipientAddressLatitude: location.lng,
                    })

                    fetch(`${myApiUrl}/${addOrderPath}`, {
                        method: 'POST',
                        headers: new Headers({
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'Authorization': loginAsset[0].accessToken,
                        }),
                        body: JSON.stringify({
                            pickUpLocation: this.state.pickUpLocation,
                            pickUpLocationLatitude: this.state.pickUpLatitude,
                            pickUpLocationLongitude: this.state.pickUpLongitude,
                            orderDescription: this.state.orderDescription,
                            orderWeight: this.state.orderWeight,
                            pickUpDateTime: this.state.pickUpDate,
                            arrivalDateTime: this.state.expectedArrivalDate,
                            favouriteRecipientId: this.state.favRecipientId,
                            recipientName: this.state.recipientName,
                            recipientAddress: this.state.recipientAddress,
                            recipientAddressLatitude: this.state.recipientAddressLatitude,
                            recipientAddressLongitude: this.state.recipientAddressLongitude,
                            lorryTypeId: this.state.selectedLorryTypeId,
                            // recipientState: this.state.recipientState,
                            // recipientPostCode: this.state.recipientPostcode,
                            recipientEmailAddress: this.state.recipientEmail,
                            recipientPhoneNumber: this.state.recipientPhoneNumber,
                            vehicleSpecificationId: this.state.vehicleSpec,
                            deviceId: deviceId,
                            userId: loginAsset[0].userId,
                        }),
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
                                onPress: () => {},
                            }], {cancelable: false})
                            this.setState({
                                spinnerVisible: false,
                                isClicked: false,
                                isSubmit: false,
                            })
                        }
                    }).catch(err => {
                        console.log(err);
                        this.setState({
                            spinnerVisible: false,
                            isClicked: false,
                            isSubmit: false,
                        })
                    });
                })
                .catch(error => console.warn(error));
            })
            .catch(error => console.warn(error));
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
                        <View>
                            <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Pick Up Location: </Text>
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
                                onChangeText={(text) => {this.setState({ pickUpLocation: text });}}  />
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
                                            favRecipientId: option.id
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
                            <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Recipient Address: </Text>
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
                                altFontFamily="Raleway-Regular"
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
                            altFontFamily="Raleway-Regular"
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
                </ScrollView>
            </KeyboardAvoidingView> : <KeyboardAvoidingView style={styles.container}>
                <ScrollView>
                    <View>
                        <View>
                            <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Pick Up Location: </Text>
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
                                onChangeText={(text) => {this.setState({ pickUpLocation: text });}}  />
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
                                            favRecipientId: option.id
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
                            <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Recipient Address: </Text>
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
                                altFontFamily="Raleway-Regular"
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
                            altFontFamily="Raleway-Regular"
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
                </ScrollView>
            </KeyboardAvoidingView>
        )
    }
}