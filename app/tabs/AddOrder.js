import React, { Component } from 'react';
import { Text, TextInput, View, Image, TouchableOpacity, KeyboardAvoidingView, Alert, ScrollView,  } from 'react-native';
import { styles } from '../utils/Style';
import NetworkConnection from '../utils/NetworkConnection';
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
  
export default class AddOrder extends Component{
    static navigationOptions = {
        title: 'Add Order',
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
            lorryLength: '',
            lorryWeight: '',
            lorryPlateNumber: '',
            orderDescription: '',
            expectedDepartureDate: '',
            expectedArrivalDate: '',
            vehicleSpec: [],
            vehicleSpecList: [],
            currentDate: new Date(),
            isSubmit: false,
        }
    }

    onSelectedItemsChange = vehicleSpec => {
        this.setState({ vehicleSpec });
    };

    componentDidMount() {
        setTimeout(() => {
            this.checkInternetConnection();
        }, 500);
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
            lorryLength: loginAsset[0].lorryLengthAmount.toString(),
            lorryWeight: loginAsset[0].lorryWeigthAmount.toString(),
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

    addOrder(){
        this.setState({
            spinnerVisible: true,
            isClicked: true,
            isSubmit: true,
        })
        if(this.state.departLocation === "" || this.state.arriveLocation === "" || this.state.carLength === "" || this.state.carWeight === "" || this.state.carPlateNumber === "" || this.state.expectedDepartureDate === "" || this.state.expectedArrivalDate === "" || this.state.vehicleSpec === ""){
            Alert.alert('Cannot Add', "Please key in Depart Location, Arrive Location, Car Length(m), Car Weight(kg), Car Plate Number, Expected Departure Date, Expected Arrival Date and Vechicle Specification", [{
                text: 'OK',
                onPress: () => {},
            }], {cancelable: false});
            this.setState({
                spinnerVisible: false,
                isClicked: false,
                isSubmit: false,
            })
        }else{
            console.log(this.state.expectedDepartureDate);
            console.log(this.state.expectedArrivalDate);
            console.log(this.state.vehicleSpec);
            Geocoder.from(this.state.departLocation)
            .then(json => {
                var location = json.results[0].geometry.location;
                console.log(location);
                this.setState({
                    departLatitude: location.lat,
                    departLongitude: location.lng,
                })

                Geocoder.from(this.state.arriveLocation)
                .then(json => {
                    var location = json.results[0].geometry.location;
                    console.log(location);
                    this.setState({
                        arriveLatitude: location.lat,
                        arriveLongitude: location.lng,
                    })

                    console.log('arrivelat ', this.state.arriveLatitude)
                    console.log('arrivelong ', this.state.arriveLongitude)

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
                            shipperOrderId: this.props.navigation.getParam('shipperOrderId'),
                        }),
                    })
                    .then((response) => response.json())
                    .then((json) => {
                        console.log(json);
                        if(json.succeeded){
                            this.setState({
                                spinnerVisible: false,
                                isClicked: false,
                                isSubmit: false,
                            })
                            this.props.navigation.navigate('ConfirmDriverShipperOrder', {
                                orderConfirmationDetails : json.results,
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
                }).catch(error => console.warn(error));
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

        const { vehicleSpec } = this.state;
        return(
            <KeyboardAvoidingView style={styles.container}>
                <ScrollView>
                    <View>
                        <View>
                            <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Depart Location: </Text>
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
                        {/* <Text 
                                style={{fontSize: 15, color: '#3c4c96', fontFamily: 'Raleway-Regular', textAlign: 'left', marginBottom: 15, textDecorationStyle: 'solid', textDecorationLine: 'underline',}}
                                onPress={(e) => this.props.navigation.navigate('Map', {title: 'Pick Depart Location', departLocation: ''})}> Pick Location from Map</Text> */}
                        <View>
                            <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Arrive Location: </Text>
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
                        {/* <Text 
                                style={{fontSize: 15, color: '#3c4c96', fontFamily: 'Raleway-Regular', textAlign: 'left', marginBottom: 15, textDecorationStyle: 'solid', textDecorationLine: 'underline',}}
                                onPress={(e) => this.props.navigation.navigate('Map', {title: 'Pick Arrive Location', arriveLocation: ''})}> Pick Location from Map</Text> */}
                        <View>
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
                        </View>
                        <View>
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
                        </View>
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