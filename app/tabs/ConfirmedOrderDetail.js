import React, { Component } from 'react';
import { View, Text, Alert, ScrollView, TouchableOpacity, Linking, Platform, Dimensions, } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import NetworkConnection from '../utils/NetworkConnection';
import DeviceInfo from 'react-native-device-info';
import MyRealm from '../utils/Realm';
import { styles } from '../utils/Style';
import Spinner from 'react-native-spinkit';
import { Card, Badge, Avatar, } from 'react-native-elements';
import ProgressBar from 'react-native-progress/Bar';

let myApiUrl = 'http://courierlabapi.azurewebsites.net/api/v1/MobileApi';
let orderSummaryPath = 'OrderSummary';
let deviceId = DeviceInfo.getUniqueID();
let realm = new MyRealm();
let loginAsset = realm.objects('LoginAsset');
let {height, width} = Dimensions.get('window');

export default class ConfirmedOrderDetail extends Component{
    static navigationOptions = {
        title: 'Order Details',
    };
    
    constructor(props){
        super(props);
        this.state = {
            spinnerVisible: false,
            orderSummary: [],
        };
    }

    componentDidMount() {
        setTimeout(() => {
            this.checkInternetConnection();
        }, 500);
        this.getOrderSummary();
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

    getOrderSummary(){
        this.setState({
            spinnerVisible: true,
        })
        fetch(`${myApiUrl}/${orderSummaryPath}?deviceId=` + deviceId + `&userId=` + loginAsset[0].userId + `&driverOrderId=` + this.props.navigation.getParam('driverOrderId'), {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': loginAsset[0].accessToken,
            },
        })
        .then((response) => response.json())
        .then((json) => {
            console.log('getResult: ', json);
            console.log(json.results.driverOrder);
            if(json.succeeded){
                this.setState({
                    orderSummary: json.results,
                });
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
        return (
            <ScrollView style={styles.scrollViewContainer}>
                {
                    (this.state.spinnerVisible) ? <View style={{marginBottom: 20, marginTop: 20, alignItems: 'center',}}>
                            <Spinner
                                isVisible={this.state.spinnerVisible}
                                type={'9CubeGrid'}
                                color='#3c4c96'
                                paddingLeft={20}
                                size={50}/>
                        </View> : <View/>
                }
                {
                    (this.state.orderSummary.currentTrackingStatus === "Processing") ? <Card title='Tracking Status' titleStyle={{fontFamily: 'Raleway-Bold', fontSize: 20,}} containerStyle={{margin: 20,}}>
                            <View style={{flexDirection: 'row'}}>
                                <View style={{width: '25%', flexDirection: 'column', marginBottom: 10,}}>
                                    <Icon name={'stop-circle'} size={15} color={'#3c4c96'} style={{marginLeft: 0, marginRight: 0, textAlign: 'center',}}/>
                                    <Text style={{fontSize: 12, color: '#3c4c96', textAlign: 'center', padding: 0, fontFamily: 'Raleway-Regular',}}>Processing</Text>
                                </View>
                                <View style={{width: '25%', flexDirection: 'column', marginBottom: 10,}}>
                                    <Icon name={'check'} size={15} color={'grey'} style={{marginLeft: 0, marginRight: 0, textAlign: 'center',}}/> 
                                    <Text style={{fontSize: 12, color: 'grey', textAlign: 'center', padding: 0, fontFamily: 'Raleway-Regular',}}>Accepted</Text>
                                </View>
                                <View style={{width: '25%', flexDirection: 'column', marginBottom: 10,}}>
                                    <Icon name={'truck'} size={15} color={'grey'} style={{marginLeft: 0, marginRight: 0, textAlign: 'center',}}/>
                                    <Text style={{fontSize: 12, color: 'grey', textAlign: 'center', padding: 0, fontFamily: 'Raleway-Regular',}}>Shipping</Text>
                                </View>
                                <View style={{width: '25%', flexDirection: 'column', marginBottom: 10,}}>
                                    <Icon name={'dropbox'} size={15} color={'grey'} style={{marginLeft: 0, marginRight: 0, textAlign: 'center',}}/>
                                    <Text style={{fontSize: 12, color: 'grey', textAlign: 'center', padding: 0, fontFamily: 'Raleway-Regular',}}>Delivered</Text>
                                </View>
                            </View>
                            <ProgressBar 
                                progress={0.25} 
                                width={null} 
                                color={'#3c4c96'} 
                                borderColor={'#e0e0e0'} 
                                height={20} />
                        </Card> : (this.state.orderSummary.currentTrackingStatus === "Accepted") ? <Card title='Tracking Status' titleStyle={{fontFamily: 'Raleway-Bold', fontSize: 20,}} containerStyle={{margin: 20,}}>
                            <View style={{flexDirection: 'row'}}>
                                <View style={{width: '25%', flexDirection: 'column', marginBottom: 10,}}>
                                    <Icon name={'stop-circle'} size={15} color={'#3c4c96'} style={{marginLeft: 0, marginRight: 0, textAlign: 'center',}}/>
                                    <Text style={{fontSize: 12, color: '#3c4c96', textAlign: 'center', padding: 0, fontFamily: 'Raleway-Regular',}}>Processing</Text>
                                </View>
                                <View style={{width: '25%', flexDirection: 'column', marginBottom: 10,}}>
                                    <Icon name={'check'} size={15} color={'#3c4c96'} style={{marginLeft: 0, marginRight: 0, textAlign: 'center',}}/> 
                                    <Text style={{fontSize: 12, color: '#3c4c96', textAlign: 'center', padding: 0, fontFamily: 'Raleway-Regular',}}>Accepted</Text>
                                </View>
                                <View style={{width: '25%', flexDirection: 'column', marginBottom: 10,}}>
                                    <Icon name={'truck'} size={15} color={'grey'} style={{marginLeft: 0, marginRight: 0, textAlign: 'center',}}/>
                                    <Text style={{fontSize: 12, color: 'grey', textAlign: 'center', padding: 0, fontFamily: 'Raleway-Regular',}}>Shipping</Text>
                                </View>
                                <View style={{width: '25%', flexDirection: 'column', marginBottom: 10,}}>
                                    <Icon name={'dropbox'} size={15} color={'grey'} style={{marginLeft: 0, marginRight: 0, textAlign: 'center',}}/>
                                    <Text style={{fontSize: 12, color: 'grey', textAlign: 'center', padding: 0, fontFamily: 'Raleway-Regular',}}>Delivered</Text>
                                </View>
                            </View>
                            <ProgressBar 
                                progress={0.50} 
                                width={null} 
                                color={'#3c4c96'} 
                                borderColor={'#e0e0e0'} 
                                height={20} />
                        </Card> : (this.state.orderSummary.currentTrackingStatus === "Shipping") ? <Card title='Tracking Status' titleStyle={{fontFamily: 'Raleway-Bold', fontSize: 20,}} containerStyle={{margin: 20,}}>
                            <View style={{flexDirection: 'row'}}>
                                <View style={{width: '25%', flexDirection: 'column', marginBottom: 10,}}>
                                    <Icon name={'stop-circle'} size={15} color={'#3c4c96'} style={{marginLeft: 0, marginRight: 0, textAlign: 'center',}}/>
                                    <Text style={{fontSize: 12, color: '#3c4c96', textAlign: 'center', padding: 0, fontFamily: 'Raleway-Regular',}}>Processing</Text>
                                </View>
                                <View style={{width: '25%', flexDirection: 'column', marginBottom: 10,}}>
                                    <Icon name={'check'} size={15} color={'#3c4c96'} style={{marginLeft: 0, marginRight: 0, textAlign: 'center',}}/> 
                                    <Text style={{fontSize: 12, color: '#3c4c96', textAlign: 'center', padding: 0, fontFamily: 'Raleway-Regular',}}>Accepted</Text>
                                </View>
                                <View style={{width: '25%', flexDirection: 'column', marginBottom: 10,}}>
                                    <Icon name={'truck'} size={15} color={'#3c4c96'} style={{marginLeft: 0, marginRight: 0, textAlign: 'center',}}/>
                                    <Text style={{fontSize: 12, color: '#3c4c96', textAlign: 'center', padding: 0, fontFamily: 'Raleway-Regular',}}>Shipping</Text>
                                </View>
                                <View style={{width: '25%', flexDirection: 'column', marginBottom: 10,}}>
                                    <Icon name={'dropbox'} size={15} color={'grey'} style={{marginLeft: 0, marginRight: 0, textAlign: 'center',}}/>
                                    <Text style={{fontSize: 12, color: 'grey', textAlign: 'center', padding: 0, fontFamily: 'Raleway-Regular',}}>Delivered</Text>
                                </View>
                            </View>
                            <ProgressBar 
                                progress={0.75} 
                                width={null} 
                                color={'#3c4c96'} 
                                borderColor={'#e0e0e0'} 
                                height={20} />
                        </Card> : (this.state.orderSummary.currentTrackingStatus === "Delivered") ? <Card title='Tracking Status' titleStyle={{fontFamily: 'Raleway-Bold', fontSize: 20,}} containerStyle={{margin: 20,}}>
                            <View style={{flexDirection: 'row'}}>
                                <View style={{width: '25%', flexDirection: 'column', marginBottom: 10,}}>
                                    <Icon name={'stop-circle'} size={15} color={'#3c4c96'} style={{marginLeft: 0, marginRight: 0, textAlign: 'center',}}/>
                                    <Text style={{fontSize: 12, color: '#3c4c96', textAlign: 'center', padding: 0, fontFamily: 'Raleway-Regular',}}>Processing</Text>
                                </View>
                                <View style={{width: '25%', flexDirection: 'column', marginBottom: 10,}}>
                                    <Icon name={'check'} size={15} color={'#3c4c96'} style={{marginLeft: 0, marginRight: 0, textAlign: 'center',}}/> 
                                    <Text style={{fontSize: 12, color: '#3c4c96', textAlign: 'center', padding: 0, fontFamily: 'Raleway-Regular',}}>Accepted</Text>
                                </View>
                                <View style={{width: '25%', flexDirection: 'column', marginBottom: 10,}}>
                                    <Icon name={'truck'} size={15} color={'#3c4c96'} style={{marginLeft: 0, marginRight: 0, textAlign: 'center',}}/>
                                    <Text style={{fontSize: 12, color: '#3c4c96', textAlign: 'center', padding: 0, fontFamily: 'Raleway-Regular',}}>Shipping</Text>
                                </View>
                                <View style={{width: '25%', flexDirection: 'column', marginBottom: 10,}}>
                                    <Icon name={'dropbox'} size={15} color={'#3c4c96'} style={{marginLeft: 0, marginRight: 0, textAlign: 'center',}}/>
                                    <Text style={{fontSize: 12, color: '#3c4c96', textAlign: 'center', padding: 0, fontFamily: 'Raleway-Regular',}}>Delivered</Text>
                                </View>
                            </View>
                            <ProgressBar 
                                progress={1.00} 
                                width={null} 
                                color={'#3c4c96'} 
                                borderColor={'#e0e0e0'} 
                                height={20} />
                        </Card> : <View/>
                }
                {(this.state.orderSummary.driverOrder !== undefined) ? <Card title={(
                            <View style={{flexDirection: 'column',}}>
                                <Text style={{fontFamily: 'Raleway-Bold', fontSize: 20, textAlign: 'center',}}>Driver Status</Text>
                                <View style={{justifyContent: 'center', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#e0e0e0',}}>
                                {(this.state.orderSummary.driverStatus === "Pending") ? <Badge
                                    value={this.state.orderSummary.driverStatus}
                                    textStyle={{ color: '#fff', fontWeight: 'bold', fontSize: 12, }}
                                    containerStyle={{backgroundColor: 'orange', width: 90, marginTop: 5, marginLeft: 5, marginBottom: 10,}}
                                    />  :
                                (this.state.orderSummary.driverStatus === "Accepted") ? <Badge
                                    value={this.state.orderSummary.driverStatus}
                                    textStyle={{ color: '#fff', fontWeight: 'bold', fontSize: 12, }}
                                    containerStyle={{backgroundColor: 'green', width: 90, marginTop: 5, marginLeft: 5, marginBottom: 10,}}
                                    /> : <Badge
                                    value={this.state.orderSummary.driverStatus}
                                    textStyle={{ color: '#fff', fontWeight: 'bold', fontSize: 12, }}
                                    containerStyle={{backgroundColor: 'red', width: 90, marginTop: 5, marginLeft: 5, marginBottom: 10,}}
                                />}
                                </View>
                            </View>
                        )} 
                        containerStyle={{margin: 20,}}>
                    <View style={{paddingTop: 10, paddingBottom: 10, paddingLeft: 0, paddingRight: 0, flexDirection: 'column', borderBottomColor:'#fff', borderBottomWidth: 1, backgroundColor: '#fff',}}>
                        <View style={{flexDirection: 'column',}}>
                            <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Booking Number: </Text>
                            <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.orderSummary.bookingNumber}</Text>
                        </View>
                        <View style={{flexDirection: 'column',}}>
                            <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Order Number: </Text>
                            <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.orderSummary.driverOrder.orderNumber}</Text>
                        </View>
                        <View style={{flexDirection: 'column',}}>
                            <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Depart Location: </Text>
                            <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.orderSummary.driverOrder.departLocation}</Text>
                        </View>
                        <View style={{flexDirection: 'column',}}>
                            <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Arrive Location: </Text>
                            <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.orderSummary.driverOrder.arriveLocation}</Text>
                        </View>
                        {/* <View style={{flexDirection: 'column',}}>
                            <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Car Length (m): </Text>
                            <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.orderSummary.driverOrder.carLength}</Text>
                        </View>
                        <View style={{flexDirection: 'column',}}>
                            <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Car Weight (kg): </Text>
                            <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.orderSummary.driverOrder.carWeight}</Text>
                        </View>
                        <View style={{flexDirection: 'column',}}>
                            <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Car Plate Number: </Text>
                            <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.orderSummary.driverOrder.carPlateNumber}</Text>
                        </View> */}
                        <View style={{flexDirection: 'column',}}>
                            <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Lorry Type: </Text>
                            <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.orderSummary.driverOrder.lorryType}</Text>
                        </View>
                        {/* <View style={{flexDirection: 'column',}}>
                            <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Lorry Length(m): </Text>
                            <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{loginAsset[0].lorryLengthAmount.toString()}</Text>
                        </View>
                        <View style={{flexDirection: 'column',}}>
                            <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Lorry Weight(kg): </Text>
                            <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{loginAsset[0].lorryWeigthAmount.toString()}</Text>
                        </View> */}
                        <View style={{flexDirection: 'column',}}>
                            <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Lorry Plate Number:: </Text>
                            <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{loginAsset[0].lorryPlateNumber}</Text>
                        </View>
                        <View style={{flexDirection: 'column',}}>
                            <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Lorry Return: </Text>
                            <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{(this.state.orderSummary.driverOrder.isReturn) ? 'Yes' : 'No'}</Text>
                        </View>
                        <View style={{flexDirection: 'column',}}>
                            <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Order Description: </Text>
                            <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.orderSummary.driverOrder.orderDescription}</Text>
                        </View>
                        <View style={{flexDirection: 'column',}}>
                            <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Expected Departure Date: </Text>
                            <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.orderSummary.driverOrder.expectedDepartureDate}</Text>
                        </View>
                        <View style={{flexDirection: 'column',}}>
                            <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Expected Arrival Date: </Text>
                            <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.orderSummary.driverOrder.expectedArrivalDate}</Text>
                        </View>
                        <View style={{flexDirection: 'column',}}>
                            <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Vehicle Specification: </Text>
                            <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.orderSummary.driverOrder.vehicleSpecifications}</Text>
                        </View>
                    </View>
                </Card> : <View />}
                {(this.state.orderSummary.shipperOrder !== undefined) ? <View style={{marginBottom: 20,}}> 
                    <Card title={(
                            <View style={{flexDirection: 'column',}}>
                                <Text style={{fontFamily: 'Raleway-Bold', fontSize: 20, textAlign: 'center',}}>Shipper Status</Text>
                                <Text style={{fontFamily: 'Raleway-Italic', fontSize: 15, textAlign: 'center',}}>{this.state.orderSummary.distanceBetween} away from your departure</Text>
                                <View style={{justifyContent: 'center', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#e0e0e0',}}>
                                {(this.state.orderSummary.shipperStatus === "Pending") ? <Badge
                                    value={this.state.orderSummary.shipperStatus}
                                    textStyle={{ color: '#fff', fontWeight: 'bold', fontSize: 12, }}
                                    containerStyle={{backgroundColor: 'orange', width: 90, marginTop: 5, marginLeft: 5, marginBottom: 10,}}
                                    />  :
                                (this.state.orderSummary.shipperStatus === "Accepted") ? <Badge
                                    value={this.state.orderSummary.shipperStatus}
                                    textStyle={{ color: '#fff', fontWeight: 'bold', fontSize: 12, }}
                                    containerStyle={{backgroundColor: 'green', width: 90, marginTop: 5, marginLeft: 5, marginBottom: 10,}}
                                    /> : <Badge
                                    value={this.state.orderSummary.shipperStatus}
                                    textStyle={{ color: '#fff', fontWeight: 'bold', fontSize: 12, }}
                                    containerStyle={{backgroundColor: 'red', width: 90, marginTop: 5, marginLeft: 5, marginBottom: 10,}}
                                />}
                                </View>
                            </View>
                        )} 
                        containerStyle={{margin: 20,}}>
                    <View style={{paddingTop: 10, paddingBottom: 10, paddingLeft: 0, paddingRight: 0, flexDirection: 'column', borderBottomColor:'#fff', borderBottomWidth: 1, backgroundColor: '#fff',}}>
                        {(this.state.orderSummary.shipperOrder.hasPaid) ? <View>
                            <View style={{flexDirection: 'column',}}>
                                <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Shipper Name: </Text>
                                <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.orderSummary.shipperOrder.shipperName}</Text>
                            </View>
                            <View style={{flexDirection: 'column',}}>
                                <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Shipper Contact Number: </Text>
                                <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.orderSummary.shipperOrder.shipperPhoneNumber}</Text>
                            </View>
                        </View> : <View/>}
                        
                        <View style={{flexDirection: 'column',}}>
                            <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Order Number: </Text>
                            <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.orderSummary.shipperOrder.orderNumber}</Text>
                        </View>
                        <View style={{flexDirection: 'column',}}>
                            <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Order Description: </Text>
                            <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.orderSummary.shipperOrder.orderDescription}</Text>
                        </View>
                        <View style={{flexDirection: 'column',}}>
                            <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Order Weight (kg): </Text>
                            <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.orderSummary.shipperOrder.orderWeight}</Text>
                        </View>
                        <View style={{flexDirection: 'column',}}>
                            <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Vehicle Specification: </Text>
                            <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.orderSummary.shipperOrder.vehicleSpecifications}</Text>
                        </View>
                        <View style={{flexDirection: 'column',}}>
                            <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Shipper Delivery Distance(km): </Text>
                            <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.orderSummary.shipperDeliveryDistance}</Text>
                        </View>
                        <View style={{flexDirection: 'column',}}>
                            <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Pick Up Location: </Text>
                            <View style={{flexDirection: 'row', flex: 1,}}>
                                <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.orderSummary.shipperOrder.pickupLocation}</Text>
                                <View style={{width: '10%', paddingTop: 0, paddingBottom: 10, right: 0, marginLeft: 'auto',}}>
                                    <Icon name={'location-arrow'} size={25} color={'#3c4c96'} style={styles.mapIcon} onPress={() => this.openGps(this.state.orderSummary.shipperOrder.pickupLocation)}/>
                                </View>
                            </View>
                        </View>
                        <View style={{flexDirection: 'column',}}>
                            <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Pick Up Date: </Text>
                            <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.orderSummary.shipperOrder.pickUpDate}</Text>
                        </View>
                        <View style={{flexDirection: 'column',}}>
                            <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Expected Arrival Date: </Text>
                            <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.orderSummary.shipperOrder.expectedArrivalDate}</Text>
                        </View>
                        {(this.state.orderSummary.shipperOrder.hasPaid) ? <View>
                            <View style={{flexDirection: 'column',}}>
                                <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Recipient Name: </Text>
                                <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.orderSummary.shipperOrder.recipientName}</Text>
                            </View>
                            <View style={{flexDirection: 'column',}}>
                                <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Recipient Contact Number: </Text>
                                <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.orderSummary.shipperOrder.recipientPhoneNumber}</Text>
                            </View>
                            <View style={{flexDirection: 'column',}}>
                                <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Recipient Email: </Text>
                                <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.orderSummary.shipperOrder.recipientEmailAddress}</Text>
                            </View>
                        </View> : <View/>}
                        
                        <View style={{flexDirection: 'column',}}>
                            <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Recipient Address: </Text>
                            <View style={{flexDirection: 'row', flex: 1,}}>
                                <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.orderSummary.shipperOrder.recipientAddress}</Text>
                                <View style={{width: '10%', paddingTop: 0, paddingBottom: 10, right: 0, marginLeft: 'auto',}}>
                                    <Icon name={'location-arrow'} size={25} color={'#3c4c96'} style={styles.mapIcon} onPress={() => this.openGps(this.state.orderSummary.shipperOrder.recipientAddress)}/>
                                </View>
                            </View>
                        </View>
                        <View style={{flexDirection: 'column',}}>
                            <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Order Image: </Text>
                            {
                                (this.state.orderSummary.shipperOrder.shipperOrderImage !== '') ? <View style={{flexDirection: 'row', paddingBottom: 10, paddingTop: 0, paddingLeft: 5, paddingRight: 5, justifyContent: 'flex-start', }}>
                                    <Avatar
                                        size={width-100}
                                        source={{uri: this.state.orderSummary.shipperOrder.shipperOrderImage}}
                                        activeOpacity={0.7}
                                    />
                                </View> : <View />
                            }
                        </View>
                        {/* <View style={{flexDirection: 'column',}}>
                            <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Recipient State: </Text>
                            <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.orderSummary.shipperOrder.recipientState}</Text>
                        </View>
                        <View style={{flexDirection: 'column',}}>
                            <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Recipient Postcode: </Text>
                            <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.orderSummary.shipperOrder.recipientPostCode}</Text>
                        </View> */}
                    </View>
                </Card>
            </View> : <View />}
                {(this.state.orderSummary.currentTrackingStatus === "Accepted") ? <View style={{backgroundColor: '#3c4c96', paddingLeft: 10, paddingRight: 10, marginLeft: 20, marginRight: 20, marginBottom: 40,}}>
                        <TouchableOpacity
                            style={styles.buttonContainer}
                            onPress={() => this.props.navigation.navigate('Scanner', { rerenderFunction : () => this.getOrderSummary() })}>
                            <Text style={styles.buttonText}>Scan</Text>
                        </TouchableOpacity>
                    </View> : (this.state.orderSummary.currentTrackingStatus === "Shipping") ? <View style={{backgroundColor: '#3c4c96', paddingLeft: 10, paddingRight: 10, marginLeft: 20, marginRight: 20, marginBottom: 40,}}>
                        <TouchableOpacity
                            style={styles.buttonContainer}
                            onPress={() => this.props.navigation.navigate('Verification', { shipperOrderId: this.state.orderSummary.shipperOrder.shipperOrderId, rerenderFunction : () => this.getOrderSummary() })}>
                            <Text style={styles.buttonText}>Delivered</Text>
                        </TouchableOpacity>
                    </View> : <View/>
                }
            </ScrollView>
        )
    }
}