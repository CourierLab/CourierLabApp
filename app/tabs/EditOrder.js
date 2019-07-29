import React, { Component } from 'react';
import { Text, TextInput, View, Image, TouchableOpacity, KeyboardAvoidingView, Modal, Alert, ScrollView, Platform, } from 'react-native';
import { styles } from '../utils/Style';
import NetworkConnection from '../utils/NetworkConnection';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MyRealm from '../utils/Realm';
import Spinner from 'react-native-spinkit';
import DeviceInfo from 'react-native-device-info';
import MultiSelect from 'react-native-multiple-select';
import Geocoder from 'react-native-geocoding';
import DatePicker from 'react-native-datepicker';

let myApiUrl = 'http://courierlabapi.azurewebsites.net/api/v1/MobileApi';
let driverOrderPath = 'ViewPendingShipper';
let editOrderPath = 'EditDriverOrder';
let vehicleSpecPath = 'GetVehicleSpecification';
let deviceId = DeviceInfo.getUniqueID();
let realm = new MyRealm();
let loginAsset = realm.objects('LoginAsset');
let spec = [];
let _this = this;
  
export default class EditOrder extends Component{
    static navigationOptions = {
        // title: 'Edit Order',
        headerTitle: <View style={{flexDirection: 'row',}}>
                <FeatherIcon name="edit" size={19} color="#fff" style={{paddingLeft: 10, paddingRight: 10,}}/>
                <Text style={{color: '#fff', fontWeight: 'bold', fontFamily: 'AvenirLTStd-Black', fontSize: 15, paddingTop: 3,}}>Edit Order</Text>
            </View>,
    }
    
    constructor(props){
        super(props);
        this.state = {
            spinnerVisible: false,
            isClicked: false,
            departLocation: '',
            departLatitude: null,
            departLongitude: null,
            arriveLocation: '',
            arriveLatitude: '',
            arriveLongitude: '',
            // lorryLength: '',
            // lorryWeight: '',
            lorryPlateNumber: '',
            orderDescription: '',
            expectedDepartureDate: '',
            expectedArrivalDate: '',
            vehicleSpecString: '',
            vehicleSpec: [],
            vehicleSpecList: [],
            isSubmit: false,
            editedDepartFromMap: false,
            editedArriveFromMap: false,
            validAddress: false,
            modalVisible: false,
        }
    }

    onSelectedItemsChange = vehicleSpec => {
        this.setState({ vehicleSpec });
    };

    componentDidMount() {
        setTimeout(() => {
            this.checkInternetConnection();
        }, 500);
        this.getDriverOrder();
        this.getLorryDetail();
        this.getVehicleSpec();
        // Geocoder.init('AIzaSyAfqLd5k68W11gB03CqwNq5ikAjNpAle2c');
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
            if(type == 'editDepart'){
                this.setState({
                    departLocation: address,
                    departLatitude: lat,
                    departLongitude: long,
                    editedDepartFromMap: true,
                })
            }else if(type == 'editArrive'){
                this.setState({
                    arriveLocation: address,
                    arriveLatitude: lat,
                    arriveLongitude: long,
                    editedArriveFromMap: true,
                })
            }
        }
    }

    getDriverOrder(){
        this.setState({
            spinnerVisible: true,
            modalVisible: true,
        })

        fetch(`${myApiUrl}/${driverOrderPath}?deviceId=` + deviceId + `&userId=` + loginAsset[0].userId + `&driverOrderId=` + this.props.navigation.getParam('driverOrderId'), {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': loginAsset[0].accessToken,
            },
        })
        .then((response) => response.json())
        .then((json) => {
            console.log(json)
            if(json.succeeded){
                var location = {};
                Geocoder.from(json.results.driverOrder.departLocation)
                .then(jsonData => {
                    location = jsonData.results[0].geometry.location;
                    console.log(location);
                    this.setState({
                        departLocation: json.results.driverOrder.departLocation,
                        departLatitude: location.lat,
                        departLongitude: location.lng,
                        arriveLocation: json.results.driverOrder.arriveLocation,
                        // carLength: (json.results.driverOrder.carLength).toString(),
                        // carWeight: (json.results.driverOrder.carWeight).toString(),
                        // carPlateNumber: json.results.driverOrder.carPlateNumber,
                        orderDescription: json.results.driverOrder.orderDescription,
                        expectedDepartureDate: json.results.driverOrder.expectedDepartureDate,
                        expectedArrivalDate: json.results.driverOrder.expectedArrivalDate,
                        vehicleSpecString: json.results.driverOrder.vehicleSpecifications,
                        spinnerVisible: false,
                        modalVisible: false,
                    })
                    console.log('get d ', this.state.departLatitude);
                    spec = this.state.vehicleSpecString.split(', ');
                    console.log(spec);
                    let id = [];
                    if(this.state.vehicleSpecList !== []){
                        for(var i=0; i<spec.length; i++){
                            for(var j=0; j<this.state.vehicleSpecList.length; j++){
                                if(spec[i] === this.state.vehicleSpecList[j].vehicleSpecificationName){
                                    id.push(this.state.vehicleSpecList[j].vehicleSpecificationId);
                                }
                            }
                        }
                        this.setState({
                            vehicleSpec: id,
                        })
                    }
                })
                .catch(error => console.log('e ', error));
            }
        }).catch(err => {
            console.log(err);
            this.setState({
                spinnerVisible: false,
                modalVisible: false,
            })
        });
    }

    async editOrder(){
        this.setState({
            spinnerVisible: true,
            isClicked: true,
            isSubmit: true,
        })
        if(this.state.departLocation === "" || this.state.arriveLocation === "" || this.state.carLength === "" || this.state.carWeight === "" || this.state.carPlateNumber === "" || this.state.expectedDepartureDate === "" || this.state.expectedArrivalDate === "" || this.state.vehicleSpec === ""){
            Alert.alert('Cannot Edit', "Please key in Depart Location, Arrive Location, Car Length(m), Car Weight(kg), Car Plate Number, Expected Departure Date, Expected Arrival Date and Vechicle Specification", [{
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
            console.log(this.state.expectedDepartureDate);
            console.log(this.state.expectedArrivalDate);
            if(!this.state.editedDepartFromMap){
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

            if(!this.state.editedArriveFromMap){
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

            // await Geocoder.from(this.state.departLocation)
            // .then(json => {
            //     var location = json.results[0].geometry.location;
            //     console.log(location);
            //     this.setState({
            //         departLatitude: location.lat,
            //         departLongitude: location.lng,
            //     })
            // })
            // .catch(error => console.warn(error));

            // await Geocoder.from(this.state.arriveLocation)
            // .then(json => {
            //     var location = json.results[0].geometry.location;
            //     console.log(location);
            //     this.setState({
            //         arriveLatitude: location.lat,
            //         arriveLongitude: location.lng,
            //     })
            // }).catch(error => console.warn(error));

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
                Alert.alert('Cannot Add', 'The Arrive Location is invalid', [
                {
                    text: 'OK',
                    onPress: () => {},
                }], {cancelable: false})
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
            }else{
                fetch(`${myApiUrl}/${editOrderPath}`, {
                    method: 'POST',
                    headers: new Headers({
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': loginAsset[0].accessToken,
                    }),
                    body: JSON.stringify({
                        driverOrderId: this.props.navigation.getParam('driverOrderId'),
                        // carLength: this.state.carLength,
                        // carWeight: this.state.carWeight,
                        // carPlateNumber: this.state.carPlateNumber,
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
                    console.log(json);
                    if(json.succeeded){
                        Alert.alert('Successfully Edited', json.message, [
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
                        this.props.navigation.state.params.rerenderFunction();
                        this.props.navigation.goBack();
                    }else{
                        Alert.alert('Cannot Edit', json.message, [
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
            <KeyboardAvoidingView style={{backgroundColor: '#fff', padding: 10, flex: 1,}}>
                {
                    (this.state.modalVisible) ? <Modal
                        animationType="slide"
                        transparent={true}
                        visible={this.state.modalVisible}>
                        <View style={{flex: 1, backgroundColor: 'rgba(0,0,0,.4)', position: 'absolute', top: 0, right: 0, bottom: 0, left: 0}}>
                            <View style={{flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center',}}> 
                                <Spinner
                                    isVisible={this.state.modalVisible}
                                    type={'ThreeBounce'}
                                    color='#F4D549'
                                    size={30}/>
                            </View>
                        </View>
                    </Modal> : <View/>
                }
                <ScrollView ref={ref => this.scrollView = ref}
                    onContentSizeChange={(contentWidth, contentHeight)=>{
                        if(this.state.isSubmit){
                            this.scrollView.scrollToEnd({animated: true});
                        }
                    }}>
                        <View>
                            <View style={{margin: 0, paddingLeft: 15, paddingRight: 15, paddingTop: 20, paddingBottom: 20, backgroundColor: '#EFEFEF', borderRadius: 20,}}>
                                <View style={{flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginTop: -20, marginBottom: -10, }}>
                                    <Image resizeMode='contain' style={{width: '10%',}} source={require('../assets/shipper.png')} />
                                    <Text style={{fontSize: 18, alignItems: 'center', textAlign: 'center', fontFamily: 'AvenirLTStd-Roman', color: '#2C2E6D', paddingLeft: 10,}}>DEAPRT DETAILS</Text>
                                </View>
                                <View>
                                    <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'AvenirLTStd-Heavy',}}>Depart Location  </Text>
                                    <TouchableOpacity
                                        style={{height: 40, backgroundColor: '#EFEFEF', padding: 10, borderColor: '#A3A9C4', borderWidth: 1, }}
                                        onPress={() => this.props.navigation.navigate('Map', {title: 'Pick Depart Location', type: 'editDepart', onGoBack: this.getLocationInfo.bind(this)})}>
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
                                        onPress={() => this.props.navigation.navigate('Map', {title: 'Pick Arrive Location', type: 'editArrive', onGoBack: this.getLocationInfo.bind(this)})}>
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
                                        editable={false} />
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
                                        underlineColorAndroid={'transparent'}
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
                                <View>
                                    {this.multiSelect ? this.multiSelect.getSelectedItemsExt(this.state.vehicleSpec) : null}
                                </View>
                                {spinnerView}
                            </View>
                        </View>
                        <View style={this.state.isSubmit ? {backgroundColor: '#F4D549', borderRadius: 20, paddingLeft: 10, paddingRight: 10, marginLeft: 0, marginRight: 0, marginBottom: 20, marginTop: 20,} : {backgroundColor: '#2C2E6D', borderRadius: 20, paddingLeft: 10, paddingRight: 10, marginLeft: 0, marginRight: 0, marginBottom: 20, marginTop: 20,}}>
                            <TouchableOpacity
                                disabled={this.state.isSubmit}
                                style={this.state.isSubmit ? {backgroundColor: '#F4D549', borderRadius: 20, paddingVertical: 15,} : styles.buttonContainer}
                                onPress={(e) => this.editOrder()}>
                                <Text style={this.state.isSubmit ? {color: '#2C2E6D', textAlign: 'center', fontSize: 16, fontFamily: 'AvenirLTStd-Black',} : {color: '#fff', textAlign: 'center', fontSize: 16, fontFamily: 'AvenirLTStd-Black',}}>Edit Order</Text>
                            </TouchableOpacity>
                        </View>

                    {/* {
                        (!this.state.spinnerVisible && !this.state.isClicked) ? <View>
                            <View>
                                <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Depart Location: 
                                    <Text 
                                        style={{fontSize: 12, color: '#3c4c96', fontFamily: 'Raleway-Regular', textAlign: 'left', marginBottom: 15, textDecorationStyle: 'solid', textDecorationLine: 'underline',}}
                                        onPress={(e) => this.props.navigation.navigate('Map', {title: 'Pick Depart Location', type: 'editDepart', onGoBack: this.getLocationInfo.bind(this)})}> Pick Location from Map</Text>
                                </Text>
                                <TextInput
                                    style={{height: 50, backgroundColor: '#fff', marginBottom: 5, padding: 10, color: '#3c4c96', fontSize: 20, borderColor: '#3c4c96', borderWidth: 1, fontFamily: 'Raleway-Bold',}}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    underlineColorAndroid={'transparent'}
                                    autoFocus={false}
                                    keyboardType='default'
                                    returnKeyLabel="next"
                                    placeholder='Depart Location'
                                    placeholderTextColor='#939ABA'
                                    value={this.state.departLocation}
                                    onChangeText={(text) => {this.setState({ departLocation: text });}}  />
                            </View>
                            <View>
                                <Text style={{paddingLeft: 0, paddingTop: 5, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Arrive Location: 
                                    <Text 
                                        style={{fontSize: 12, color: '#3c4c96', fontFamily: 'Raleway-Regular', textAlign: 'left', marginBottom: 15, textDecorationStyle: 'solid', textDecorationLine: 'underline',}}
                                        onPress={(e) => this.props.navigation.navigate('Map', {title: 'Pick Arrive Location', type: 'editArrive', onGoBack: this.getLocationInfo.bind(this)})}> Pick Location from Map</Text>
                                </Text>
                                <TextInput
                                    style={{height: 50, backgroundColor: '#fff', marginBottom: 5, padding: 10, color: '#3c4c96', fontSize: 20, borderColor: '#3c4c96', borderWidth: 1, fontFamily: 'Raleway-Bold',}}
                                    autoCapitalize="none"
                                    underlineColorAndroid={'transparent'}
                                    autoCorrect={false}
                                    keyboardType='default'
                                    returnKeyLabel="next"
                                    placeholder='Arrive Location'
                                    placeholderTextColor='#939ABA'
                                    value={this.state.arriveLocation}
                                    onChangeText={(text) => this.setState({ arriveLocation: text })}  />
                            </View>
                            <View>
                                <Text style={{paddingLeft: 0, paddingTop: 5, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Lorry Plate Number: </Text>
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
                                <Text style={{paddingLeft: 0, paddingTop: 5, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Order Description: </Text>
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
                                <Text style={{paddingLeft: 0, paddingTop: 5, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Expected Departure Date: </Text>
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
                                <Text style={{paddingLeft: 0, paddingTop: 5, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Expected Arrival Date: </Text>
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
                                <Text style={{paddingLeft: 0, paddingTop: 5, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Vechicle Spec: </Text>
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
                            <View>
                                {this.multiSelect ? this.multiSelect.getSelectedItemsExt(this.state.vehicleSpec) : null}
                            </View>
                            <View style={{paddingTop: 10,}}>
                                <TouchableOpacity
                                    disabled={this.state.isSubmit}
                                    style={this.state.isSubmit ? {backgroundColor: '#7D839C', paddingVertical: 15,} : styles.buttonContainer}
                                    onPress={(e) => this.editOrder()}>
                                    <Text style={styles.buttonText}>Edit Order</Text>
                                </TouchableOpacity>
                            </View>
                        </View> : <View style={{alignItems: 'center', paddingBottom: 10,}}> 
                            <Spinner
                                isVisible={this.state.spinnerVisible}
                                type={'9CubeGrid'}
                                color='#3c4c96'
                                paddingLeft={20}
                                size={50}/>
                        </View>
                    } */}
                    {/* {spinnerView}
                    {
                        (!this.state.spinnerVisible && !this.state.isClicked) ? <View style={{paddingTop: 10,}}>
                            <TouchableOpacity
                                style={styles.buttonContainer}
                                onPress={(e) => this.editOrder()}>
                                <Text style={styles.buttonText}>Edit Order</Text>
                            </TouchableOpacity>
                        </View> : <View/>
                    } */}
                </ScrollView>
            </KeyboardAvoidingView>
        )
    }
}