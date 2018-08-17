import React, { Component } from 'react';
import { View, Text, Alert, ScrollView, TouchableOpacity, Linking, Platform } from 'react-native';
import NetworkConnection from '../utils/NetworkConnection';
import DeviceInfo from 'react-native-device-info';
import MyRealm from '../utils/Realm';
import { styles } from '../utils/Style';
import Spinner from 'react-native-spinkit';
import { Card, } from 'react-native-elements';
import { StackActions } from 'react-navigation';

let myApiUrl = 'http://courierlabapi.azurewebsites.net/api/v1/MobileApi';
let orderConfirmationPath = 'OrderConfirmation';
let submitOrderPath = 'SubmitOrder';
let deviceId = DeviceInfo.getUniqueID();
let realm = new MyRealm();
let loginAsset = realm.objects('LoginAsset');

export default class SelectShipperOrder extends Component{
    static navigationOptions = {
        title: 'Order Confirmation',
    };
    
    constructor(props){
        super(props);
        this.state = {
            spinnerVisible: false,
            isClicked: false,
            driverDetails: [],
            shipperDetails: [],
        };
    }

    componentDidMount() {
        setTimeout(() => {
            this.checkInternetConnection();
        }, 500);
        this.getOrderConfirmation();
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

    openGps = (addr) => {
        var scheme = Platform.OS === 'ios' ? 'maps://?daddr=' : 'https://www.google.com/maps/search/?api=1&query=';
        var url = scheme + addr;
        this.openExternalApp(url);
    }

    openExternalApp(url) {
        Linking.canOpenURL(url).then(supported => {
            if (supported) {
                Linking.openURL(url);
            } else {
                console.log('error');
            }
        });
    }

    confirmOrder(){
        this.setState({
            spinnerVisible: true,
            isClicked: true,
        })
        fetch(`${myApiUrl}/${submitOrderPath}`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': loginAsset[0].accessToken,
            },
            body: JSON.stringify({
                shipperId: this.state.shipperDetails.shipperId,
                driverId: loginAsset[0].driverId,
                shipperOrderId: this.state.shipperDetails.shipperOrderId,
                driverOrderId: this.state.driverDetails.driverOrderId,
                deviceId: deviceId,
                userId: loginAsset[0].userId,
            }),
        })
        .then((response) => response.json())
        .then((json) => {
            console.log(json);
            if(json.succeeded){
                Alert.alert('Order Confirmed', json.message, [
                {
                    text: 'OK',
                    onPress: () => {}
                }], {cancelable: false})
                this.props.navigation.dispatch(StackActions.popToTop());
            }else{
                Alert.alert('Cannot Confirm', json.message, [
                {
                    text: 'OK',
                    onPress: () => {}
                }], {cancelable: false})
            }
            this.setState({
                spinnerVisible: false,
                isClicked: false,
            }) 
        }).catch(err => {
            console.log(err);
            this.setState({
                spinnerVisible: false,
                isClicked: false,
            })
        });
    }

    getOrderConfirmation(){
        this.setState({
            spinnerVisible: true,
        })
        fetch(`${myApiUrl}/${orderConfirmationPath}?deviceId=` + deviceId + `&userId=` + loginAsset[0].userId + `&driverOrderId=` + this.props.navigation.getParam('driverOrderId') + `&shipperOrderId=` + this.props.navigation.getParam('shipperOrderId'), {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': loginAsset[0].accessToken,
            },
        })
        .then((response) => response.json())
        .then((json) => {
            console.log(json);
            if(json.succeeded){
                this.setState({
                    driverDetails: json.results.driverOrder,
                    shipperDetails: json.results.shipperOrder,
                    spinnerVisible: false,
                })
            }else{
                Alert.alert('Error', json.message, [
                {
                    text: 'OK',
                    onPress: () => {}
                }], {cancelable: false})
            }
            this.setState({
                spinnerVisible: false,
            }) 
        }).catch(err => {
            console.log(err);
            this.setState({
                spinnerVisible: false,
            })
        });
    }

    render(){
        let spinnerView = this.state.isClicked ? <View style={{alignItems: 'center', marginTop: 20,}}> 
                    <Spinner
                        isVisible={this.state.spinnerVisible}
                        type={'9CubeGrid'}
                        color='#3c4c96'
                        paddingLeft={20}
                        size={50}/>
                </View> : <View/>;
        return (
            <ScrollView style={styles.scrollViewContainer}>
                {
                    (this.state.spinnerVisible && !this.state.isClicked) ? <View style={{marginBottom: 20, marginTop: 20, alignItems: 'center',}}>
                            <Spinner
                                isVisible={this.state.spinnerVisible}
                                type={'9CubeGrid'}
                                color='#3c4c96'
                                paddingLeft={20}
                                size={50}/>
                        </View> : <View/>
                }
                {(this.state.driverDetails !== [] && !this.state.spinnerVisible) ? <Card title={'Driver Order Details'} titleStyle={{fontFamily: 'Raleway-Bold', fontSize: 20,}} containerStyle={{margin: 20,}}>
                    <View style={{paddingTop: 10, paddingBottom: 10, paddingLeft: 0, paddingRight: 0, flexDirection: 'column', borderBottomColor:'#fff', borderBottomWidth: 1, backgroundColor: '#fff',}}>
                        <View style={{flexDirection: 'column',}}>
                            <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Order Number: </Text>
                            <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.driverDetails.orderNumber}</Text>
                        </View>
                        <View style={{flexDirection: 'column',}}>
                            <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Depart Location: </Text>
                            <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.driverDetails.departLocation}</Text>
                        </View>
                        <View style={{flexDirection: 'column',}}>
                            <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Arrive Location: </Text>
                            <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.driverDetails.arriveLocation}</Text>
                        </View>
                        <View style={{flexDirection: 'column',}}>
                            <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Car Length (m): </Text>
                            <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.driverDetails.carLength}</Text>
                        </View>
                        <View style={{flexDirection: 'column',}}>
                            <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Car Weight (kg): </Text>
                            <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.driverDetails.carWeight}</Text>
                        </View>
                        <View style={{flexDirection: 'column',}}>
                            <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Car Plate Number: </Text>
                            <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.driverDetails.carPlateNumber}</Text>
                        </View>
                        <View style={{flexDirection: 'column',}}>
                            <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Order Description: </Text>
                            <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.driverDetails.orderDescription}</Text>
                        </View>
                        <View style={{flexDirection: 'column',}}>
                            <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Expected Departure Date: </Text>
                            <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.driverDetails.expectedDepartureDate}</Text>
                        </View>
                        <View style={{flexDirection: 'column',}}>
                            <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Expected Arrival Date: </Text>
                            <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.driverDetails.expectedArrivalDate}</Text>
                        </View>
                        <View style={{flexDirection: 'column',}}>
                            <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Vehicle Specification: </Text>
                            <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.driverDetails.vehicleSpecifications}</Text>
                        </View>
                    </View>
                </Card> : <View />}
                {(this.state.shipperDetails !== [] && !this.state.spinnerVisible) ? <View style={{marginBottom: 20,}}> 
                    <Card title={(
                            <View style={{flexDirection: 'column',}}>
                                <Text style={{fontFamily: 'Raleway-Bold', fontSize: 20, textAlign: 'center',}}>Shipper Order Details</Text>
                                <Text style={{fontFamily: 'Raleway-Italic', fontSize: 15, textAlign: 'center',}}>{this.state.shipperDetails.distance} away from your departure</Text>
                                <View style={{borderBottomWidth: 1, borderBottomColor: '#e0e0e0', marginTop: 10,}}/>
                            </View>
                        )} 
                        containerStyle={{margin: 20,}}>
                    <View style={{paddingTop: 10, paddingBottom: 10, paddingLeft: 0, paddingRight: 0, flexDirection: 'column', borderBottomColor:'#fff', borderBottomWidth: 1, backgroundColor: '#fff',}}>
                        <View style={{flexDirection: 'column',}}>
                            <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Shipper Name: </Text>
                            <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.shipperDetails.shipperName}</Text>
                        </View>
                        <View style={{flexDirection: 'column',}}>
                            <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Shipper Contact Number: </Text>
                            <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.shipperDetails.shipperPhoneNumber}</Text>
                        </View>
                        <View style={{flexDirection: 'column',}}>
                            <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Order Number: </Text>
                            <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.shipperDetails.orderNumber}</Text>
                        </View>
                        <View style={{flexDirection: 'column',}}>
                            <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Order Description: </Text>
                            <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.shipperDetails.orderDescription}</Text>
                        </View>
                        <View style={{flexDirection: 'column',}}>
                            <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Order Weight (kg): </Text>
                            <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.shipperDetails.orderWeight}</Text>
                        </View>
                        <View style={{flexDirection: 'column',}}>
                            <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Vehicle Specification: </Text>
                            <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.shipperDetails.vehicleSpecifications}</Text>
                        </View>
                        <View style={{flexDirection: 'column',}}>
                            <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Pick Up Location: </Text>
                            <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.shipperDetails.pickupLocation}</Text>
                        </View>
                        <View style={{flexDirection: 'column',}}>
                            <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Pick Up Date: </Text>
                            <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.shipperDetails.pickUpDate}</Text>
                        </View>
                        <View style={{flexDirection: 'column',}}>
                            <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Expected Arrival Date: </Text>
                            <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.shipperDetails.expectedArrivalDate}</Text>
                        </View>
                        <View style={{flexDirection: 'column',}}>
                            <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Recipient Name: </Text>
                            <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.shipperDetails.recipientName}</Text>
                        </View>
                        <View style={{flexDirection: 'column',}}>
                            <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Recipient Contact Number: </Text>
                            <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.shipperDetails.recipientPhoneNumber}</Text>
                        </View>
                        <View style={{flexDirection: 'column',}}>
                            <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Recipient Email: </Text>
                            <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.shipperDetails.recipientEmailAddress}</Text>
                        </View>
                        <View style={{flexDirection: 'column',}}>
                            <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Recipient Address: </Text>
                            <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.shipperDetails.recipientAddress}</Text>
                        </View>
                        <View style={{flexDirection: 'column',}}>
                            <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Recipient State: </Text>
                            <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.shipperDetails.recipientState}</Text>
                        </View>
                        <View style={{flexDirection: 'column',}}>
                            <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Recipient Postcode: </Text>
                            <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.shipperDetails.recipientPostCode}</Text>
                        </View>
                    </View>
                </Card>
            </View> : <View />}
                {spinnerView}
                {
                    (!this.state.spinnerVisible) ? <View>
                        <View style={{backgroundColor: '#fff', paddingLeft: 10, paddingRight: 10, marginLeft: 20, marginRight: 20, marginBottom: 20,}}>
                            <TouchableOpacity
                                style={{backgroundColor: '#fb3f33', paddingVertical: 15,}}
                                onPress={() => this.props.navigation.dispatch(StackActions.popToTop())}>
                                <Text style={styles.buttonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{backgroundColor: '#fff', paddingLeft: 10, paddingRight: 10, marginLeft: 20, marginRight: 20, marginBottom: 40,}}>
                            <TouchableOpacity
                                style={styles.buttonContainer}
                                onPress={() => this.confirmOrder()}>
                                <Text style={styles.buttonText}>Confirm</Text>
                            </TouchableOpacity>
                        </View> 
                    </View> : <View/>
                }
            </ScrollView>
        )
    }
}