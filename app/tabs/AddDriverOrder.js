import React, { Component } from 'react';
import { Text, TextInput, View, Image, TouchableOpacity, KeyboardAvoidingView, Alert, ScrollView, Platform, } from 'react-native';
import { styles } from '../utils/Style';
import NetworkConnection from '../utils/NetworkConnection';
import Icon from 'react-native-vector-icons/FontAwesome';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialComIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import MyRealm from '../utils/Realm';
import Spinner from 'react-native-spinkit';
import DeviceInfo from 'react-native-device-info';
import MultiSelect from 'react-native-multiple-select';
import Geocoder from 'react-native-geocoding';
import DatePicker from 'react-native-datepicker';

let myApiUrl = 'http://courierlabapi.azurewebsites.net/api/v1/MobileApi';
let addOrderPath = 'AddDriverOrder';
let vehicleSpecPath = 'GetVehicleSpecification';
let deviceId = DeviceInfo.getUniqueID();
let realm = new MyRealm();
let loginAsset = realm.objects('LoginAsset');
  
export default class AddDriverOrder extends Component{
    static navigationOptions = {
        // title: 'Add Driver Order',
        headerTitle: <View style={{flexDirection: 'row',}}>
                <FeatherIcon name="file-plus" size={19} color="#fff" style={{paddingLeft: 10, paddingRight: 10,}}/>
                <Text style={{color: '#fff', fontWeight: 'bold', fontFamily: 'AvenirLTStd-Black', fontSize: 15, paddingTop: 3,}}>Add Driver Order</Text>
            </View>,
    }
    
    constructor(props){
        super(props);
        this.state = {
            spinnerVisible: false,
            isClicked: false,
            departLocation: '',
            departLatitude: '',
            departLongitude: '',
            arriveLocation: '',
            arriveLatitude: '',
            arriveLongitude: '',
            // lorryLength: '',
            // lorryWeight: '',
            lorryPlateNumber: '',
            orderDescription: '',
            expectedDepartureDate: '',
            expectedArrivalDate: '',
            vehicleSpec: [],
            vehicleSpecList: [],
            currentDate: new Date(),
            isSubmit: false,
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
        this.getLorryDetail();
        //Geocoder.init('AIzaSyAfqLd5k68W11gB03CqwNq5ikAjNpAle2c');
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

    getLorryDetail(){
        this.setState({
            // lorryLength: loginAsset[0].lorryLengthAmount.toString(),
            // lorryWeight: loginAsset[0].lorryWeigthAmount.toString(),
            lorryPlateNumber: loginAsset[0].lorryPlateNumber,
        })
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

    getCoordination(){
        Geocoder.from(this.state.departLocation)
		.then(json => {
			var location = json.results[0].geometry.location;
            console.log(location);
            this.setState({
                departLatitude: location.lat,
                departLongitude: location.lng,
            })
		})
		.catch(error => console.warn(error));
    }

    getLocationInfo(type, address, lat, long){
        if(address != '' && lat != '' && long != ''){
            if(type == 'depart'){
                this.setState({
                    departLocation: address,
                    departLatitude: lat,
                    departLongitude: long,
                })
            }else{
                this.setState({
                    arriveLocation: address,
                    arriveLatitude: lat,
                    arriveLongitude: long,
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
        if(this.state.departLocation === "" || this.state.arriveLocation === "" || this.state.expectedDepartureDate === "" || this.state.expectedArrivalDate === "" || this.state.vehicleSpec === ""){
            Alert.alert('Cannot Add', "Please key in Depart Location, Arrive Location, Expected Departure Date, Expected Arrival Date and Vechicle Specification", [{
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
            if(this.state.departLatitude == '' && this.state.departLongitude == ''){
                await Geocoder.from(this.state.departLocation)
                .then(json => {
                    var location = json.results[0].geometry.location;
                    console.log(location);
                    this.setState({
                        departLatitude: location.lat,
                        departLongitude: location.lng,
                    })
                })
                .catch(error => {
                    this.setState({
                        validAddress: true,
                    })
                    console.warn(error)
                });
            }

            if(this.state.arriveLatitude == '' && this.state.arriveLongitude == ''){
                await Geocoder.from(this.state.arriveLocation)
                .then(json => {
                    var location = json.results[0].geometry.location;
                    console.log(location);
                    this.setState({
                        arriveLatitude: location.lat,
                        arriveLongitude: location.lng,
                    })
                    console.log('arrivelat ', this.state.arriveLatitude)
                    console.log('arrivelong ', this.state.arriveLongitude)
                }).catch(error => {
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
                            departLatitude: '',
                            departLongitude: '',
                            arriveLatitude: '',
                            arriveLongitude: '',
                            validAddress: false,
                        })
                    },
                }], {cancelable: false})
            }else if(this.state.validRecipientAddress){
                Alert.alert('Cannot Add', 'The Arrival Location is invalid', [
                {
                    text: 'OK',
                    onPress: () => {
                        this.setState({
                            spinnerVisible: false,
                            isClicked: false,
                            isSubmit: false,
                            departLatitude: '',
                            departLongitude: '',
                            arriveLatitude: '',
                            arriveLongitude: '',
                            validRecipientAddress: false,
                        })
                    },
                }], {cancelable: false})
            }else{
                fetch(`${myApiUrl}/${addOrderPath}`, {
                    method: 'POST',
                    headers: new Headers({
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': loginAsset[0].accessToken,
                    }),
                    body: JSON.stringify({
                        orderDescription: this.state.orderDescription,
                        departLocation: this.state.departLocation,
                        departLocationLatitude: this.state.departLatitude,
                        departLocationLongitude: this.state.departLongitude,
                        arriveLocation: this.state.arriveLocation,
                        arriveLocationLatitude: this.state.arriveLatitude,
                        arriveLocationLongitude: this.state.arriveLongitude,
                        expectedDepartureDate: this.state.expectedDepartureDate,
                        expectedArrivalDate: this.state.expectedArrivalDate,
                        vehicleSpecificationId: this.state.vehicleSpec,
                        driverId: loginAsset[0].loginUserId,
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
                            driverOrderId: json.results.driverOrderId,
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

        const { vehicleSpec } = this.state;
        return(
            <KeyboardAvoidingView style={{backgroundColor: '#fff', padding: 10,}}>
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
                                <Text style={{fontSize: 18, alignItems: 'center', textAlign: 'center', fontFamily: 'AvenirLTStd-Roman', color: '#2C2E6D', paddingLeft: 10,}}>DEPART DETAILS</Text>
                            </View>
                        </View>
                        <View>
                            <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'AvenirLTStd-Heavy',}}>Depart Location  </Text>
                            <TouchableOpacity
                                style={{height: 40, backgroundColor: '#EFEFEF', padding: 10, borderColor: '#A3A9C4', borderWidth: 1, }}
                                onPress={() => this.props.navigation.navigate('Map', {title: 'Pick Depart Location', type: 'depart', onGoBack: this.getLocationInfo.bind(this)})}>
                                {
                                    (this.state.departLocation === '') ? <Text style={{fontSize: 14, fontFamily: 'AvenirLTStd-Roman', color: '#A3A9C4', }}>Depart Location</Text> :
                                    <Text style={{fontSize: 14, fontFamily: 'AvenirLTStd-Roman', color: '#3c4c96', }}>{this.state.departLocation}</Text>
                                }
                            </TouchableOpacity>
                        </View>
                        <View>
                            <Text style={{paddingLeft: 0, paddingTop: 10, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'AvenirLTStd-Heavy',}}>Arrive Location  </Text>
                            <TouchableOpacity
                                style={{height: 40, backgroundColor: '#EFEFEF', padding: 10, borderColor: '#A3A9C4', borderWidth: 1, }}
                                onPress={() => this.props.navigation.navigate('Map', {title: 'Pick Arrive Location', type: 'arrive', onGoBack: this.getLocationInfo.bind(this)})}>
                                {
                                    (this.state.arriveLocation === '') ? <Text style={{fontSize: 14, fontFamily: 'AvenirLTStd-Roman', color: '#A3A9C4', }}>Arrive Location</Text> :
                                    <Text style={{fontSize: 14, fontFamily: 'AvenirLTStd-Roman', color: '#3c4c96', }}>{this.state.arriveLocation}</Text>
                                }
                            </TouchableOpacity>
                        </View>
                        <View>
                            <Text style={{paddingLeft: 0, paddingTop: 10, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'AvenirLTStd-Heavy',}}>Lorry Plate Number </Text>
                            <TextInput
                                style={{fontSize: 14, fontFamily: 'AvenirLTStd-Roman', color: '#3c4c96', borderColor: '#A3A9C4', borderWidth: 1, height: 40, paddingLeft: 10, paddingRight: 10,}}
                                autoCapitalize="none"
                                underlineColorAndroid={'transparent'}
                                autoCorrect={false}
                                returnKeyLabel="next"
                                keyboardType={'default'}
                                placeholder='Lorry Plate Number'
                                placeholderTextColor='#A3A9C4'
                                value={this.state.lorryPlateNumber}
                                onChangeText={(text) => this.setState({ lorryPlateNumber: text })} 
                                editable={false}/>
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
                            <Text style={{paddingLeft: 0, paddingTop: 10, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'AvenirLTStd-Heavy',}}>Expected Departure Date </Text>
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
                                placeholder={'Expected Departure Date'}
                                date={this.state.expectedDepartureDate}
                                mode="datetime"
                                format="DD/MM/YYYY h:mm a"
                                is24Hour={false}
                                confirmBtnText="Confirm"
                                cancelBtnText="Cancel"
                                showIcon={false}
                                onDateChange={(datetime) => {this.setState({expectedDepartureDate: datetime});}} />
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
                            <Text style={{paddingLeft: 0, paddingTop: 10, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'AvenirLTStd-Heavy',}}>Vechicle Spec </Text>
                            <MultiSelect
                                hideTags
                                style={{fontSize: 14, fontFamily: 'AvenirLTStd-Roman', backgroundColor: '#EFEFEF', color: '#3c4c96', borderColor: '#A3A9C4', borderWidth: 1, paddingLeft: 10, height: 40,}}
                                underlineColorAndroid={'transparent'}
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
                                styleDropdownMenuSubsection={(Platform.OS === 'ios') ? {backgroundColor: '#EFEFEF', } : {backgroundColor: '#EFEFEF', height: 30,}}
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

                        {/* <View>
                            <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Depart Location:  </Text>
                            <TouchableOpacity
                                style={{height: 50, backgroundColor: '#fff', marginBottom: 5, padding: 10, borderColor: '#3c4c96', borderWidth: 1, }}
                                onPress={() => this.props.navigation.navigate('Map', {title: 'Pick Depart Location', type: 'depart', onGoBack: this.getLocationInfo.bind(this)})}>
                                {
                                    (this.state.departLocation === '') ? <Text style={{fontSize: 20, fontFamily: 'Raleway-Bold', color: '#8289AC', }}>Depart Location</Text> :
                                    <Text style={{fontSize: 20, fontFamily: 'Raleway-Bold', color: '#3c4c96', }}>{this.state.departLocation}</Text>
                                }
                            </TouchableOpacity>
                        </View> */}
                        {/* <Text 
                                style={{fontSize: 15, color: '#3c4c96', fontFamily: 'Raleway-Regular', textAlign: 'left', marginBottom: 15, textDecorationStyle: 'solid', textDecorationLine: 'underline',}}
                                onPress={(e) => this.props.navigation.navigate('Map', {title: 'Pick Depart Location', departLocation: ''})}> Pick Location from Map</Text> */}
                        {/* <View>
                            <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Arrive Location: </Text>
                            <TouchableOpacity
                                style={{height: 50, backgroundColor: '#fff', marginBottom: 5, padding: 10, borderColor: '#3c4c96', borderWidth: 1, }}
                                onPress={() => this.props.navigation.navigate('Map', {title: 'Pick Arrive Location', type: 'arrive', onGoBack: this.getLocationInfo.bind(this)})}>
                                {
                                    (this.state.arriveLocation === '') ? <Text style={{fontSize: 20, fontFamily: 'Raleway-Bold', color: '#8289AC', }}>Arrive Location</Text> :
                                    <Text style={{fontSize: 20, fontFamily: 'Raleway-Bold', color: '#3c4c96', }}>{this.state.arriveLocation}</Text>
                                }
                            </TouchableOpacity>
                        </View> */}
                        {/* <Text 
                                style={{fontSize: 15, color: '#3c4c96', fontFamily: 'Raleway-Regular', textAlign: 'left', marginBottom: 15, textDecorationStyle: 'solid', textDecorationLine: 'underline',}}
                                onPress={(e) => this.props.navigation.navigate('Map', {title: 'Pick Arrive Location', arriveLocation: ''})}> Pick Location from Map</Text> */}
                        {/* <View>
                            <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Lorry Length(m): </Text>
                            <TextInput
                                style={styles.input}
                                autoCapitalize="none"
                                autoCorrect={false}
                                underlineColorAndroid={'transparent'}
                                returnKeyLabel="next"
                                placeholder='Lorry Length(m)'
                                keyboardType={'numeric'}
                                placeholderTextColor='#939ABA'
                                value={this.state.lorryLength} 
                                editable={false}/>
                        </View>
                        <View>
                            <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Lorry Weight(kg): </Text>
                            <TextInput
                                style={styles.input}
                                autoCapitalize="none"
                                underlineColorAndroid={'transparent'}
                                autoCorrect={false}
                                returnKeyLabel="next"
                                keyboardType={'numeric'}
                                placeholder='Lorry Weight(kg)'
                                placeholderTextColor='#939ABA'
                                value={this.state.lorryWeight} 
                                editable={false}/>
                        </View> */}
                        {/* <View>
                            <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Lorry Plate Number: </Text>
                            <TextInput
                                style={styles.input}
                                underlineColorAndroid={'transparent'}
                                autoCapitalize="none"
                                autoCorrect={false}
                                keyboardType='default'
                                returnKeyLabel="next"
                                placeholder='Lorry Plate Number'
                                placeholderTextColor='#939ABA'
                                value={this.state.lorryPlateNumber}
                                editable={false} />
                        </View>
                        <View>
                            <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Order Description: </Text>
                            <TextInput
                                style={styles.input}
                                autoCapitalize="none"
                                underlineColorAndroid={'transparent'}
                                autoCorrect={false}
                                keyboardType='default'
                                returnKeyLabel="next"
                                placeholder='Order Description'
                                placeholderTextColor='#939ABA'
                                value={this.state.orderDescription}
                                onChangeText={(text) => this.setState({ orderDescription: text })}  />
                        </View>
                        <View>
                            <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Expected Departure Date: </Text>
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
                                placeholder={'Expected Departure Date'}
                                date={this.state.expectedDepartureDate}
                                mode="datetime"
                                format="DD/MM/YYYY h:mm a"
                                is24Hour={false}
                                confirmBtnText="Confirm"
                                cancelBtnText="Cancel"
                                showIcon={false}
                                onDateChange={(datetime) => {this.setState({expectedDepartureDate: datetime});}} />
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
                        </View> */}
                        <View>
                            {this.multiSelect ? this.multiSelect.getSelectedItemsExt(this.state.vehicleSpec) : null}
                        </View>
                        {spinnerView}
                    </View>
                    <View style={this.state.isSubmit ? {backgroundColor: '#F4D549', borderRadius: 20, paddingLeft: 10, paddingRight: 10, marginLeft: 0, marginRight: 0, marginBottom: 20, marginTop: 20,} : {backgroundColor: '#2C2E6D', borderRadius: 20, paddingLeft: 10, paddingRight: 10, marginLeft: 0, marginRight: 0, marginBottom: 20, marginTop: 20,}}>
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