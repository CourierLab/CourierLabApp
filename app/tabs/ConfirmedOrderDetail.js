import React, { Component } from 'react';
import { View, Text, Alert, ScrollView, TouchableOpacity, Linking, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialComIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import AntIcon from 'react-native-vector-icons/AntDesign';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import SimIcon from 'react-native-vector-icons/SimpleLineIcons';
import OctiIcon from 'react-native-vector-icons/Octicons';
import NetworkConnection from '../utils/NetworkConnection';
import DeviceInfo from 'react-native-device-info';
import MyRealm from '../utils/Realm';
import { styles } from '../utils/Style';
import Spinner from 'react-native-spinkit';
import { Card, Badge, } from 'react-native-elements';
import ProgressBar from 'react-native-progress/Bar';

let myApiUrl = 'http://courierlabapi.azurewebsites.net/api/v1/MobileApi';
let orderSummaryPath = 'OrderSummary';
let deviceId = DeviceInfo.getUniqueID();
let realm = new MyRealm();
let loginAsset = realm.objects('LoginAsset');

export default class ConfirmedOrderDetail extends Component{
    static navigationOptions = {
        // title: 'Order Details',
        headerTitle: <View style={{flexDirection: 'row',}}>
                <FeatherIcon name="shopping-cart" size={19} color="#fff" style={{paddingLeft: 10, paddingRight: 10,}}/>
                <Text style={{color: '#fff', fontWeight: 'bold', fontFamily: 'AvenirLTStd-Black', fontSize: 15, paddingTop: 3,}}>Order Details</Text>
            </View>,
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
                                type={'ThreeBounce'}
                                color='#F4D549'
                                size={30}/>
                        </View> : <View/>
                }
                {
                    (this.state.orderSummary.currentTrackingStatus === "Processing") ? <Card 
                        // title='Tracking Status' titleStyle={{fontFamily: 'Raleway-Bold', fontSize: 20,}} 
                        containerStyle={{margin: 15, borderRadius: 20, shadowOpacity: 1, backgroundColor: '#EFEFEF', shadowColor: '#e0e0e0', shadowRadius: 3, shadowOffset: {width: 1, height: 1,},}}>
                            <View style={{flexDirection: 'row'}}>
                                <View style={{width: '25%', flexDirection: 'column', marginBottom: 10,}}>
                                    <Icon name={'stop-circle'} size={15} color={'#ffbb16'} style={{marginLeft: 0, marginRight: 0, textAlign: 'center',}}/>
                                    <Text style={{fontSize: 12, color: '#ffbb16', textAlign: 'center', padding: 0, fontFamily: 'AvenirLTStd-Roman',}}>Processing</Text>
                                </View>
                                <View style={{width: '25%', flexDirection: 'column', marginBottom: 10,}}>
                                    <Icon name={'check'} size={15} color={'grey'} style={{marginLeft: 0, marginRight: 0, textAlign: 'center',}}/> 
                                    <Text style={{fontSize: 12, color: 'grey', textAlign: 'center', padding: 0, fontFamily: 'AvenirLTStd-Roman',}}>Accepted</Text>
                                </View>
                                <View style={{width: '25%', flexDirection: 'column', marginBottom: 10,}}>
                                    <Icon name={'truck'} size={15} color={'grey'} style={{marginLeft: 0, marginRight: 0, textAlign: 'center',}}/>
                                    <Text style={{fontSize: 12, color: 'grey', textAlign: 'center', padding: 0, fontFamily: 'AvenirLTStd-Roman',}}>Shipping</Text>
                                </View>
                                <View style={{width: '25%', flexDirection: 'column', marginBottom: 10,}}>
                                    <Icon name={'dropbox'} size={15} color={'grey'} style={{marginLeft: 0, marginRight: 0, textAlign: 'center',}}/>
                                    <Text style={{fontSize: 12, color: 'grey', textAlign: 'center', padding: 0, fontFamily: 'AvenirLTStd-Roman',}}>Delivered</Text>
                                </View>
                            </View>
                            <ProgressBar 
                                progress={0.25} 
                                width={null} 
                                color={'#ffbb16'} 
                                borderColor={'#e0e0e0'} 
                                height={20} />
                        </Card> : (this.state.orderSummary.currentTrackingStatus === "Accepted") ? <Card 
                            // title='Tracking Status' titleStyle={{fontFamily: 'Raleway-Bold', fontSize: 20,}} 
                            containerStyle={{margin: 15, borderRadius: 20, shadowOpacity: 1, backgroundColor: '#EFEFEF', shadowColor: '#e0e0e0', shadowRadius: 3, shadowOffset: {width: 1, height: 1,},}}>
                            <View style={{flexDirection: 'row'}}>
                                <View style={{width: '25%', flexDirection: 'column', marginBottom: 10,}}>
                                    <Icon name={'stop-circle'} size={15} color={'#ffbb16'} style={{marginLeft: 0, marginRight: 0, textAlign: 'center',}}/>
                                    <Text style={{fontSize: 12, color: '#ffbb16', textAlign: 'center', padding: 0, fontFamily: 'AvenirLTStd-Roman',}}>Processing</Text>
                                </View>
                                <View style={{width: '25%', flexDirection: 'column', marginBottom: 10,}}>
                                    <Icon name={'check'} size={15} color={'#ffbb16'} style={{marginLeft: 0, marginRight: 0, textAlign: 'center',}}/> 
                                    <Text style={{fontSize: 12, color: '#ffbb16', textAlign: 'center', padding: 0, fontFamily: 'AvenirLTStd-Roman',}}>Accepted</Text>
                                </View>
                                <View style={{width: '25%', flexDirection: 'column', marginBottom: 10,}}>
                                    <Icon name={'truck'} size={15} color={'grey'} style={{marginLeft: 0, marginRight: 0, textAlign: 'center',}}/>
                                    <Text style={{fontSize: 12, color: 'grey', textAlign: 'center', padding: 0, fontFamily: 'AvenirLTStd-Roman',}}>Shipping</Text>
                                </View>
                                <View style={{width: '25%', flexDirection: 'column', marginBottom: 10,}}>
                                    <Icon name={'dropbox'} size={15} color={'grey'} style={{marginLeft: 0, marginRight: 0, textAlign: 'center',}}/>
                                    <Text style={{fontSize: 12, color: 'grey', textAlign: 'center', padding: 0, fontFamily: 'AvenirLTStd-Roman',}}>Delivered</Text>
                                </View>
                            </View>
                            <ProgressBar 
                                progress={0.50} 
                                width={null} 
                                color={'#ffbb16'} 
                                borderColor={'#e0e0e0'} 
                                height={20} />
                        </Card> : (this.state.orderSummary.currentTrackingStatus === "Shipping") ? <Card 
                            // title='Tracking Status' titleStyle={{fontFamily: 'Raleway-Bold', fontSize: 20,}} 
                            containerStyle={{margin: 15, borderRadius: 20, shadowOpacity: 1, backgroundColor: '#EFEFEF', shadowColor: '#e0e0e0', shadowRadius: 3, shadowOffset: {width: 1, height: 1,},}}>
                            <View style={{flexDirection: 'row'}}>
                                <View style={{width: '25%', flexDirection: 'column', marginBottom: 10,}}>
                                    <Icon name={'stop-circle'} size={15} color={'#ffbb16'} style={{marginLeft: 0, marginRight: 0, textAlign: 'center',}}/>
                                    <Text style={{fontSize: 12, color: '#ffbb16', textAlign: 'center', padding: 0, fontFamily: 'AvenirLTStd-Roman',}}>Processing</Text>
                                </View>
                                <View style={{width: '25%', flexDirection: 'column', marginBottom: 10,}}>
                                    <Icon name={'check'} size={15} color={'#ffbb16'} style={{marginLeft: 0, marginRight: 0, textAlign: 'center',}}/> 
                                    <Text style={{fontSize: 12, color: '#ffbb16', textAlign: 'center', padding: 0, fontFamily: 'AvenirLTStd-Roman',}}>Accepted</Text>
                                </View>
                                <View style={{width: '25%', flexDirection: 'column', marginBottom: 10,}}>
                                    <Icon name={'truck'} size={15} color={'#ffbb16'} style={{marginLeft: 0, marginRight: 0, textAlign: 'center',}}/>
                                    <Text style={{fontSize: 12, color: '#ffbb16', textAlign: 'center', padding: 0, fontFamily: 'AvenirLTStd-Roman',}}>Shipping</Text>
                                </View>
                                <View style={{width: '25%', flexDirection: 'column', marginBottom: 10,}}>
                                    <Icon name={'dropbox'} size={15} color={'grey'} style={{marginLeft: 0, marginRight: 0, textAlign: 'center',}}/>
                                    <Text style={{fontSize: 12, color: 'grey', textAlign: 'center', padding: 0, fontFamily: 'AvenirLTStd-Roman',}}>Delivered</Text>
                                </View>
                            </View>
                            <ProgressBar 
                                progress={0.75} 
                                width={null} 
                                color={'#ffbb16'} 
                                borderColor={'#e0e0e0'} 
                                height={20} />
                        </Card> : (this.state.orderSummary.currentTrackingStatus === "Delivered") ? <Card 
                            // title='Tracking Status' titleStyle={{fontFamily: 'Raleway-Bold', fontSize: 20,}} 
                            containerStyle={{margin: 15, borderRadius: 20, shadowOpacity: 1, backgroundColor: '#EFEFEF', shadowColor: '#e0e0e0', shadowRadius: 3, shadowOffset: {width: 1, height: 1,},}}>
                            <View style={{flexDirection: 'row'}}>
                                <View style={{width: '25%', flexDirection: 'column', marginBottom: 10,}}>
                                    <Icon name={'stop-circle'} size={15} color={'#ffbb16'} style={{marginLeft: 0, marginRight: 0, textAlign: 'center',}}/>
                                    <Text style={{fontSize: 12, color: '#ffbb16', textAlign: 'center', padding: 0, fontFamily: 'AvenirLTStd-Roman',}}>Processing</Text>
                                </View>
                                <View style={{width: '25%', flexDirection: 'column', marginBottom: 10,}}>
                                    <Icon name={'check'} size={15} color={'#ffbb16'} style={{marginLeft: 0, marginRight: 0, textAlign: 'center',}}/> 
                                    <Text style={{fontSize: 12, color: '#ffbb16', textAlign: 'center', padding: 0, fontFamily: 'AvenirLTStd-Roman',}}>Accepted</Text>
                                </View>
                                <View style={{width: '25%', flexDirection: 'column', marginBottom: 10,}}>
                                    <Icon name={'truck'} size={15} color={'#ffbb16'} style={{marginLeft: 0, marginRight: 0, textAlign: 'center',}}/>
                                    <Text style={{fontSize: 12, color: '#ffbb16', textAlign: 'center', padding: 0, fontFamily: 'AvenirLTStd-Roman',}}>Shipping</Text>
                                </View>
                                <View style={{width: '25%', flexDirection: 'column', marginBottom: 10,}}>
                                    <Icon name={'dropbox'} size={15} color={'#ffbb16'} style={{marginLeft: 0, marginRight: 0, textAlign: 'center',}}/>
                                    <Text style={{fontSize: 12, color: '#ffbb16', textAlign: 'center', padding: 0, fontFamily: 'AvenirLTStd-Roman',}}>Delivered</Text>
                                </View>
                            </View>
                            <ProgressBar 
                                progress={1.00} 
                                width={null} 
                                color={'#ffbb16'} 
                                borderColor={'#e0e0e0'} 
                                height={20} />
                        </Card> : <View/>
                }
                {(this.state.orderSummary.driverOrder !== undefined) ? <Card title={(
                            <View style={{flexDirection: 'column',}}>
                                <Text style={{fontFamily: 'AvenirLTStd-Black', fontSize: 16, textAlign: 'center', color: '#2C2E6D',}}>Driver Status</Text>
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
                        containerStyle={{margin: 15, borderRadius: 20, shadowOpacity: 1, backgroundColor: '#EFEFEF', shadowColor: '#e0e0e0', shadowRadius: 3, shadowOffset: {width: 1, height: 1,},}}>
                    <View style={{paddingTop: 10, paddingBottom: 10, paddingLeft: 0, paddingRight: 0, flexDirection: 'column', backgroundColor: '#EFEFEF',}}>
                        <View style={{flexDirection: 'row', paddingBottom: 10, paddingRight: 10,}}>
                            <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                                <MaterialComIcon name="barcode" size={19} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                            </View>
                            <View style={{flexDirection: 'column', paddingRight: 20,}}>
                                <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Booking Number</Text>
                                <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{this.state.orderSummary.bookingNumber}</Text>
                            </View>
                        </View>
                        <View style={{flexDirection: 'row', paddingBottom: 10, paddingRight: 10,}}>
                            <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                                <MaterialComIcon name="script-text-outline" size={19} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                            </View>
                            <View style={{flexDirection: 'column', paddingRight: 20,}}>
                                <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Order Number</Text>
                                <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{this.state.orderSummary.driverOrder.orderNumber}</Text>
                            </View>
                        </View>
                        <View style={{flexDirection: 'row', paddingBottom: 10, paddingRight: 10,}}>
                            <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                                <MaterialComIcon name="map-marker-radius" size={19} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                            </View>
                            <View style={{flexDirection: 'column', paddingRight: 20,}}>
                                <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Depart Location &#47; Expected Departure Date</Text>
                                <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{this.state.orderSummary.driverOrder.departLocation} &#47; {this.state.orderSummary.driverOrder.expectedDepartureDate}</Text>
                            </View>
                        </View>
                        <View style={{flexDirection: 'row', paddingBottom: 10, paddingRight: 10,}}>
                            <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                                <MaterialComIcon name="map-marker-check" size={19} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                            </View>
                            <View style={{flexDirection: 'column', paddingRight: 20,}}>
                                <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Arrive Location &#47; Expected Arrival Date</Text>
                                <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{this.state.orderSummary.driverOrder.arriveLocation} &#47; {this.state.orderSummary.driverOrder.expectedArrivalDate}</Text>
                            </View>
                        </View>
                        <View style={{flexDirection: 'row', paddingBottom: 10, paddingRight: 10,}}>
                            <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                                <FeatherIcon name="truck" size={19} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                            </View>
                            <View style={{flexDirection: 'column', paddingRight: 20,}}>
                                <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Lorry Type</Text>
                                <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{this.state.orderSummary.driverOrder.lorryType}</Text>
                            </View>
                        </View>
                        <View style={{flexDirection: 'row', paddingBottom: 10, paddingRight: 10,}}>
                            <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                                <MaterialComIcon name="numeric" size={19} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                            </View>
                            <View style={{flexDirection: 'column', paddingRight: 20,}}>
                                <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Lorry Plate Number</Text>
                                <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{this.state.orderSummary.driverOrder.lorryPlateNumber}</Text>
                            </View>
                        </View>
                        <View style={{flexDirection: 'row', paddingBottom: 10, paddingRight: 10,}}>
                            <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                                <MaterialComIcon name="keyboard-return" size={19} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                            </View>
                            <View style={{flexDirection: 'column', paddingRight: 20,}}>
                                <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Lorry Return</Text>
                                <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{(this.state.orderSummary.driverOrder.isReturn) ? 'Yes' : 'No'}</Text>
                            </View>
                        </View>
                        <View style={{flexDirection: 'row', paddingBottom: 10, paddingRight: 10,}}>
                            <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                                <OctiIcon name="note" size={19} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                            </View>
                            <View style={{flexDirection: 'column', paddingRight: 20,}}>
                                <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Order Description</Text>
                                <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{this.state.orderSummary.driverOrder.orderDescription}</Text>
                            </View>
                        </View>
                        <View style={{flexDirection: 'row', paddingBottom: 0, paddingRight: 10,}}>
                            <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                                <FeatherIcon name="box" size={19} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                            </View>
                            <View style={{flexDirection: 'column', paddingRight: 20,}}>
                                <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Vehicle Specification</Text>
                                <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{this.state.orderSummary.driverOrder.vehicleSpecifications}</Text>
                            </View>
                        </View>

                        
                        {/* <View style={{flexDirection: 'column',}}>
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
                        <View style={{flexDirection: 'column',}}>
                            <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Lorry Type: </Text>
                            <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.orderSummary.driverOrder.lorryType}</Text>
                        </View>
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
                        </View> */}
                    </View>
                </Card> : <View />}
                {(this.state.orderSummary.shipperOrder !== undefined) ? <View style={{marginBottom: 20,}}> 
                    <Card title={(
                            <View style={{flexDirection: 'column',}}>
                                <Text style={{fontFamily: 'AvenirLTStd-Black', fontSize: 16, textAlign: 'center', color: '#2C2E6D',}}>Shipper Status</Text>
                                <Text style={{fontFamily: 'AvenirLTStd-BookOblique', fontSize: 15, textAlign: 'center',}}>{this.state.orderSummary.distanceBetween} away from your departure</Text>
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
                        containerStyle={{margin: 15, borderRadius: 20, shadowOpacity: 1, backgroundColor: '#EFEFEF', shadowColor: '#e0e0e0', shadowRadius: 3, shadowOffset: {width: 1, height: 1,},}}>
                    <View style={{paddingTop: 10, paddingBottom: 10, paddingLeft: 0, paddingRight: 0, flexDirection: 'column', backgroundColor: '#EFEFEF',}}>
                        {(this.state.orderSummary.shipperOrder.hasPaid) ? <View>
                            <View style={{flexDirection: 'row', paddingBottom: 10, paddingRight: 10,}}>
                                <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                                    <FeatherIcon name="type" size={19} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                                </View>
                                <View style={{flexDirection: 'column', paddingRight: 20,}}>
                                    <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Shipper Name</Text>
                                    <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{this.state.orderSummary.shipperOrder.shipperName}</Text>
                                </View>
                            </View>
                            <View style={{flexDirection: 'row', paddingBottom: 10, paddingRight: 10,}}>
                                <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                                    <MaterialComIcon name="cellphone" size={19} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                                </View>
                                <View style={{flexDirection: 'column', paddingRight: 20,}}>
                                    <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Shipper Contact Number</Text>
                                    <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{this.state.orderSummary.shipperOrder.shipperPhoneNumber}</Text>
                                </View>
                            </View>
                        </View> : <View/>}
                        <View style={{flexDirection: 'row', paddingBottom: 10, paddingRight: 10,}}>
                            <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                                <MaterialComIcon name="script-text-outline" size={19} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                            </View>
                            <View style={{flexDirection: 'column', paddingRight: 20,}}>
                                <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Order Number</Text>
                                <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{this.state.orderSummary.shipperOrder.orderNumber}</Text>
                            </View>
                        </View>
                        <View style={{flexDirection: 'row', paddingBottom: 10, paddingRight: 10,}}>
                            <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                                <OctiIcon name="note" size={19} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                            </View>
                            <View style={{flexDirection: 'column', paddingRight: 20,}}>
                                <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Order Description</Text>
                                <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{this.state.orderSummary.shipperOrder.orderDescription}</Text>
                            </View>
                        </View>
                        <View style={{flexDirection: 'row', paddingBottom: 10, paddingRight: 10,}}>
                            <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                                <MaterialComIcon name="weight-kilogram" size={19} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                            </View>
                            <View style={{flexDirection: 'column', paddingRight: 20,}}>
                                <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Order Weight (kg)</Text>
                                <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{this.state.orderSummary.shipperOrder.orderWeight}</Text>
                            </View>
                        </View>
                        <View style={{flexDirection: 'row', paddingBottom: 10, paddingRight: 10,}}>
                            <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                                <FeatherIcon name="box" size={19} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                            </View>
                            <View style={{flexDirection: 'column', paddingRight: 20,}}>
                                <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Vehicle Specification</Text>
                                <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{this.state.orderSummary.shipperOrder.vehicleSpecifications}</Text>
                            </View>
                        </View>
                        <View style={{flexDirection: 'row', paddingBottom: 10, paddingRight: 10,}}>
                            <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                                <MaterialComIcon name="map-marker-distance" size={19} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                            </View>
                            <View style={{flexDirection: 'column', paddingRight: 20,}}>
                                <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Shipper Delivery Distance (km)</Text>
                                <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{this.state.orderSummary.shipperDeliveryDistance}</Text>
                            </View>
                        </View>
                        <View style={{flexDirection: 'row', paddingBottom: 10, paddingRight: 10,}}>
                            <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                                <MaterialComIcon name="map-marker-radius" size={19} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                            </View>
                            <View style={{flexDirection: 'column', width: '85%',}}>
                                <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Pick Up Location &#47; Pick Up Date</Text>
                                <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{this.state.orderSummary.shipperOrder.pickupLocation} &#47; {this.state.orderSummary.shipperOrder.pickUpDate}</Text>
                            </View>
                            <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                                <Icon name={'location-arrow'} size={25} color={'#3c4c96'} style={styles.mapIcon} onPress={() => this.openGps(this.state.orderSummary.shipperOrder.pickupLocation)}/>
                            </View>
                        </View>
                        <View style={{flexDirection: 'row', paddingBottom: 10, paddingRight: 10,}}>
                            <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                                <MaterialComIcon name="map-marker-check" size={19} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                            </View>
                            <View style={{flexDirection: 'column', paddingRight: 20,}}>
                                <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Expected Arrival Date</Text>
                                <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{this.state.orderSummary.shipperOrder.expectedArrivalDate}</Text>
                            </View>
                        </View>
                        <View style={{flexDirection: 'row', paddingBottom: 10, paddingRight: 10,}}>
                            <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                                <MaterialIcon name="person-outline" size={19} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                            </View>
                            <View style={{flexDirection: 'column', paddingRight: 20,}}>
                                <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Recipient Name</Text>
                                <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{this.state.orderSummary.shipperOrder.recipientName}</Text>
                            </View>
                        </View>
                        <View style={{flexDirection: 'row', paddingBottom: 10, paddingRight: 10,}}>
                            <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                                <MaterialComIcon name="cellphone" size={19} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                            </View>
                            <View style={{flexDirection: 'column', paddingRight: 20,}}>
                                <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Recipient Contact Number</Text>
                                <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{this.state.orderSummary.shipperOrder.recipientPhoneNumber}</Text>
                            </View>
                        </View>
                        <View style={{flexDirection: 'row', paddingBottom: 10, paddingRight: 10,}}>
                            <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                                <SimIcon name="envelope" size={19} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                            </View>
                            <View style={{flexDirection: 'column', paddingRight: 20,}}>
                                <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Recipient Email</Text>
                                <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{this.state.orderSummary.shipperOrder.recipientEmailAddress}</Text>
                            </View>
                        </View>
                        <View style={{flexDirection: 'row', paddingBottom: 10, paddingRight: 10,}}>
                            <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                                <Icon name="address-card-o" size={17} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                            </View>
                            <View style={{flexDirection: 'column', width: '85%',}}>
                                <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Recipient Address</Text>
                                <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{this.state.orderSummary.shipperOrder.recipientAddress}</Text>
                            </View>
                            <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                                <Icon name={'location-arrow'} size={25} color={'#3c4c96'} style={styles.mapIcon} onPress={() => this.openGps(this.state.orderSummary.shipperOrder.recipientAddress)}/>
                            </View>
                        </View>
                        <View style={{flexDirection: 'row',}}>
                            <Icon name="image" size={17} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                            <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Order Images</Text>
                        </View>
                        <View style={{flexDirection: 'row', paddingLeft: 20, paddingRight: 10,}}>
                            {
                                (this.state.orderSummary.shipperOrder.shipperOrderImage !== '' && this.state.orderSummary.shipperOrder.shipperOrderImage !== null) ? <View style={{flexDirection: 'row', paddingBottom: 10, paddingTop: 0, paddingLeft: 0, paddingRight: 0, justifyContent: 'flex-start', }}>
                                    <Avatar
                                        size={width-180}
                                        source={{uri: this.state.orderSummary.shipperOrder.shipperOrderImage}}
                                        onPress={() => console.log("Works!")}
                                        activeOpacity={0.7}
                                        avatarStyle={{borderRadius: 10,}}
                                        overlayContainerStyle={{borderRadius: 10,}}
                                    />
                                </View> : <View />
                            }
                        </View>
                        <View style={{flexDirection: 'row', paddingLeft: 20, paddingRight: 10,}}>
                            {
                                (this.state.orderSummary.shipperOrder.shipperOrderImage2 !== '' && this.state.orderSummary.shipperOrder.shipperOrderImage2 !== null) ? <View style={{flexDirection: 'row', paddingBottom: 10, paddingTop: 0, paddingLeft: 0, paddingRight: 0, justifyContent: 'flex-start', }}>
                                    <Avatar
                                        size={width-180}
                                        source={{uri: this.state.orderSummary.shipperOrder.shipperOrderImage2}}
                                        onPress={() => console.log("Works!")}
                                        activeOpacity={0.7}
                                        avatarStyle={{borderRadius: 10,}}
                                        overlayContainerStyle={{borderRadius: 10,}}
                                    />
                                </View> : <View />
                            }
                        </View>
                        <View style={{flexDirection: 'row', paddingLeft: 20, paddingRight: 10,}}>
                            {
                                (this.state.orderSummary.shipperOrder.shipperOrderImage3 !== '' && this.state.orderSummary.shipperOrder.shipperOrderImage3 !== null) ? <View style={{flexDirection: 'row', paddingBottom: 10, paddingTop: 0, paddingLeft: 0, paddingRight: 0, justifyContent: 'flex-start', }}>
                                    <Avatar
                                        size={width-180}
                                        source={{uri: this.state.orderSummary.shipperOrder.shipperOrderImage3}}
                                        onPress={() => console.log("Works!")}
                                        activeOpacity={0.7}
                                        avatarStyle={{borderRadius: 10,}}
                                        overlayContainerStyle={{borderRadius: 10,}}
                                    />
                                </View> : <View />
                            }
                        </View>
                        {/* <View style={{flexDirection: 'row', paddingBottom: 0, paddingRight: 10,}}>
                            <View style={{flexDirection: 'column',}}>
                                <Icon name="image" size={17} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                            </View>
                            <View style={{flexDirection: 'column', paddingRight: 20,}}>
                                <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Order Image</Text>
                                {
                                    (this.state.orderSummary.shipperOrder.shipperOrderImage !== '') ? <View style={{flexDirection: 'row', paddingBottom: 0, paddingTop: 0, paddingLeft: 0, paddingRight: 0, justifyContent: 'flex-start', }}>
                                        <Avatar
                                            size={width-100}
                                            source={{uri: this.state.orderSummary.shipperOrder.shipperOrderImage}}
                                            onPress={() => console.log("Works!")}
                                            activeOpacity={0.7}
                                            avatarStyle={{borderRadius: 20,}}
                                            overlayContainerStyle={{borderRadius: 20,}}
                                        />
                                    </View> : <View />
                                }
                            </View>
                        </View> */}
                        
                        {/* {(this.state.orderSummary.shipperOrder.hasPaid) ? <View>
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
<<<<<<< HEAD
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
                        </View> */}
=======
>>>>>>> parent of 636a50d... User Deletion Function
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
                {(this.state.orderSummary.currentTrackingStatus === "Accepted") ? <View style={{backgroundColor: '#2C2E6D', borderRadius: 20, paddingLeft: 10, paddingRight: 10, marginLeft: 10, marginRight: 10, marginBottom: 20, marginTop: 0,}}>
                        <TouchableOpacity
                            style={styles.buttonContainer}
                            onPress={() => this.props.navigation.navigate('Scanner', { rerenderFunction : () => this.getOrderSummary() })}>
                            <Text style={{color: '#fff', textAlign: 'center', fontSize: 16, fontFamily: 'AvenirLTStd-Black',}}>Scan</Text>
                        </TouchableOpacity>
                    </View> : (this.state.orderSummary.currentTrackingStatus === "Shipping") ? <View style={{backgroundColor: '#2C2E6D', borderRadius: 20, paddingLeft: 10, paddingRight: 10, marginLeft: 10, marginRight: 10, marginBottom: 20, marginTop: 0,}}>
                        <TouchableOpacity
                            style={styles.buttonContainer}
                            onPress={() => this.props.navigation.navigate('Verification', { shipperOrderId: this.state.orderSummary.shipperOrder.shipperOrderId, rerenderFunction : () => this.getOrderSummary() })}>
                            <Text style={{color: '#fff', textAlign: 'center', fontSize: 16, fontFamily: 'AvenirLTStd-Black',}}>Delivered</Text>
                        </TouchableOpacity>
                    </View> : <View/>
                }
            </ScrollView>
        )
    }
}