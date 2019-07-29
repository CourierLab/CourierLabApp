import React, { Component } from 'react';
import { View, Text, Alert, ScrollView, TouchableOpacity, Linking, Platform, Dimensions, } from 'react-native';
import NetworkConnection from '../utils/NetworkConnection';
import DeviceInfo from 'react-native-device-info';
import MyRealm from '../utils/Realm';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialComIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import AntIcon from 'react-native-vector-icons/AntDesign';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import SimIcon from 'react-native-vector-icons/SimpleLineIcons';
import Icon from 'react-native-vector-icons/FontAwesome';
import OctiIcon from 'react-native-vector-icons/Octicons';
import { styles } from '../utils/Style';
import Spinner from 'react-native-spinkit';
import { Card, Avatar, } from 'react-native-elements';
import { StackActions } from 'react-navigation';

let myApiUrl = 'http://courierlabapi.azurewebsites.net/api/v1/MobileApi';
let orderConfirmationPath = 'OrderConfirmation';
let submitOrderPath = 'SubmitOrder';
let deviceId = DeviceInfo.getUniqueID();
let realm = new MyRealm();
let loginAsset = realm.objects('LoginAsset');
let {height, width} = Dimensions.get('window');

export default class SelectShipperOrder extends Component{
    static navigationOptions = {
        // title: 'Order Confirmation',
        headerTitle: <View style={{flexDirection: 'row',}}>
                <MaterialComIcon name="truck-check" size={19} color="#fff" style={{paddingLeft: 10, paddingRight: 10,}}/>
                <Text style={{color: '#fff', fontWeight: 'bold', fontFamily: 'AvenirLTStd-Black', fontSize: 15, paddingTop: 3,}}>Order Confirmation</Text>
            </View>,
    };
    
    constructor(props){
        super(props);
        this.state = {
            spinnerVisible: false,
            isClicked: false,
            driverDetails: [],
            shipperDetails: [],
            distance: 0.0,
            isCancelClicked: false,
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
                driverId: 0,
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
                    onPress: () => {
                        this.setState({
                            spinnerVisible: false,
                            isClicked: false,
                        }) 
                    }
                }], {cancelable: false})
            }
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
        console.log(this.props.navigation.getParam('shipperOrderId'), '  ', this.props.navigation.getParam('driverOrderId'));
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
                    distance: json.results.distance,
                    spinnerVisible: false,
                })
            }else{
                Alert.alert('Error', json.message, [
                {
                    text: 'OK',
                    onPress: () => {
                        this.setState({
                            spinnerVisible: false,
                        }) 
                    }
                }], {cancelable: false})
            }
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
                        type={'ThreeBounce'}
                        color='#F4D549'
                        size={30}/>
                </View> : <View/>;
        return (
            <ScrollView style={styles.scrollViewContainer}>
                {
                    (this.state.spinnerVisible && !this.state.isClicked) ? <View style={{marginBottom: 20, marginTop: 20, alignItems: 'center',}}>
                            <Spinner
                                isVisible={this.state.spinnerVisible}
                                type={'ThreeBounce'}
                                color='#F4D549'
                                size={30}/>
                        </View> : <View/>
                }
                {(this.state.shipperDetails !== [] && !this.state.spinnerVisible) ? <View> 
                        <Card title={(
                                <View style={{flexDirection: 'column',}}>
                                    <Text style={{fontFamily: 'AvenirLTStd-Black', fontSize: 16, textAlign: 'center', color: '#2C2E6D',}}>Shipper Order Details</Text>
                                    <Text style={{fontFamily: 'AvenirLTStd-BookOblique', fontSize: 15, textAlign: 'center',}}>{this.state.distance} away from your departure</Text>
                                    <View style={{borderBottomWidth: 1, borderBottomColor: '#e0e0e0', marginTop: 10,}}/>
                                </View>
                            )} 
                            containerStyle={{margin: 15, borderRadius: 20, shadowOpacity: 1, backgroundColor: '#EFEFEF', shadowColor: '#e0e0e0', shadowRadius: 3, shadowOffset: {width: 1, height: 1,},}}>
                                <View style={{flexDirection: 'row', paddingBottom: 10, paddingRight: 10, paddingTop: 10,}}>
                                    <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                                        <MaterialComIcon name="script-text-outline" size={19} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                                    </View>
                                    <View style={{flexDirection: 'column', paddingRight: 20,}}>
                                        <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Order Number</Text>
                                        <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{this.state.shipperDetails.orderNumber}</Text>
                                    </View>
                                </View>
                                <View style={{flexDirection: 'row', paddingBottom: 10, paddingRight: 10,}}>
                                    <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                                        <OctiIcon name="note" size={19} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                                    </View>
                                    <View style={{flexDirection: 'column', paddingRight: 20,}}>
                                        <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Order Description</Text>
                                        <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{this.state.shipperDetails.orderDescription}</Text>
                                    </View>
                                </View>
                                <View style={{flexDirection: 'row', paddingBottom: 10, paddingRight: 10,}}>
                                    <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                                        <MaterialComIcon name="weight-kilogram" size={19} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                                    </View>
                                    <View style={{flexDirection: 'column', paddingRight: 20,}}>
                                        <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Order Weight (kg)</Text>
                                        <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{this.state.shipperDetails.orderWeight}</Text>
                                    </View>
                                </View>
                                <View style={{flexDirection: 'row', paddingBottom: 10, paddingRight: 10,}}>
                                    <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                                        <FeatherIcon name="tag" size={19} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                                    </View>
                                    <View style={{flexDirection: 'column', paddingRight: 20,}}>
                                        <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Estimated Price (RM)</Text>
                                        <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{this.state.shipperDetails.price}</Text>
                                    </View>
                                </View>
                                <View style={{flexDirection: 'row', paddingBottom: 10, paddingRight: 10,}}>
                                    <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                                        <MaterialComIcon name="map-marker-distance" size={19} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                                    </View>
                                    <View style={{flexDirection: 'column', paddingRight: 20,}}>
                                        <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Delivery Distance (km)</Text>
                                        <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{this.state.shipperDetails.shipperDeliveryDistance}</Text>
                                    </View>
                                </View>
                                <View style={{flexDirection: 'row', paddingBottom: 10, paddingRight: 10,}}>
                                    <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                                        <FeatherIcon name="box" size={19} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                                    </View>
                                    <View style={{flexDirection: 'column', paddingRight: 20,}}>
                                        <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Vehicle Specification</Text>
                                        <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{this.state.shipperDetails.vehicleSpecifications}</Text>
                                    </View>
                                </View>
                                <View style={{flexDirection: 'row', paddingBottom: 10, paddingRight: 10,}}>
                                    <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                                        <MaterialComIcon name="map-marker-radius" size={19} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                                    </View>
                                    <View style={{flexDirection: 'column', paddingRight: 20,}}>
                                        <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Pick Up Location &#47; Pick Up Date</Text>
                                        <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{this.state.shipperDetails.pickupLocation} &#47; {this.state.shipperDetails.pickUpDate}</Text>
                                    </View>
                                </View>
                                <View style={{flexDirection: 'row', paddingBottom: 10, paddingRight: 10,}}>
                                    <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                                        <MaterialComIcon name="map-marker-check" size={19} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                                    </View>
                                    <View style={{flexDirection: 'column', paddingRight: 20,}}>
                                        <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Expected Arrival Date</Text>
                                        <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{this.state.shipperDetails.expectedArrivalDate}</Text>
                                    </View>
                                </View>
                                <View style={{flexDirection: 'row', paddingBottom: 10, paddingRight: 10,}}>
                                    <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                                        <MaterialIcon name="person-outline" size={19} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                                    </View>
                                    <View style={{flexDirection: 'column', paddingRight: 20,}}>
                                        <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Recipient Name</Text>
                                        <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{this.state.shipperDetails.recipientName}</Text>
                                    </View>
                                </View>
                                <View style={{flexDirection: 'row', paddingBottom: 10, paddingRight: 10,}}>
                                    <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                                        <MaterialComIcon name="cellphone" size={19} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                                    </View>
                                    <View style={{flexDirection: 'column', paddingRight: 20,}}>
                                        <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Recipient Contact Number</Text>
                                        <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{this.state.shipperDetails.recipientPhoneNumber}</Text>
                                    </View>
                                </View>
                                <View style={{flexDirection: 'row', paddingBottom: 10, paddingRight: 10,}}>
                                    <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                                        <SimIcon name="envelope" size={19} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                                    </View>
                                    <View style={{flexDirection: 'column', paddingRight: 20,}}>
                                        <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Recipient Email</Text>
                                        <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{this.state.shipperDetails.recipientEmailAddress}</Text>
                                    </View>
                                </View>
                                <View style={{flexDirection: 'row', paddingBottom: 10, paddingRight: 10,}}>
                                    <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                                        <Icon name="address-card-o" size={17} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                                    </View>
                                    <View style={{flexDirection: 'column', paddingRight: 20,}}>
                                        <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Recipient Address</Text>
                                        <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{this.state.shipperDetails.recipientAddress}</Text>
                                    </View>
                                </View>
                                <View style={{flexDirection: 'row',}}>
                                    <Icon name="image" size={17} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                                    <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Order Images</Text>
                                </View>
                                <View style={{flexDirection: 'row', paddingLeft: 20, paddingRight: 10,}}>
                                    {
                                        (this.state.shipperDetails.shipperOrderImage !== '' && this.state.shipperDetails.shipperOrderImage !== null) ? <View style={{flexDirection: 'row', paddingBottom: 10, paddingTop: 0, paddingLeft: 0, paddingRight: 0, justifyContent: 'flex-start', }}>
                                            <Avatar
                                                size={width-180}
                                                source={{uri: this.state.shipperDetails.shipperOrderImage}}
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
                                        (this.state.shipperDetails.shipperOrderImage2 !== '' && this.state.shipperDetails.shipperOrderImage2 !== null) ? <View style={{flexDirection: 'row', paddingBottom: 10, paddingTop: 0, paddingLeft: 0, paddingRight: 0, justifyContent: 'flex-start', }}>
                                            <Avatar
                                                size={width-180}
                                                source={{uri: this.state.shipperDetails.shipperOrderImage2}}
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
                                        (this.state.shipperDetails.shipperOrderImage3 !== '' && this.state.shipperDetails.shipperOrderImage3 !== null) ? <View style={{flexDirection: 'row', paddingBottom: 10, paddingTop: 0, paddingLeft: 0, paddingRight: 0, justifyContent: 'flex-start', }}>
                                            <Avatar
                                                size={width-180}
                                                source={{uri: this.state.shipperDetails.shipperOrderImage3}}
                                                onPress={() => console.log("Works!")}
                                                activeOpacity={0.7}
                                                avatarStyle={{borderRadius: 10,}}
                                                overlayContainerStyle={{borderRadius: 10,}}
                                            />
                                        </View> : <View />
                                    }
                                </View>
                        {/* <View style={{paddingTop: 10, paddingBottom: 10, paddingLeft: 0, paddingRight: 0, flexDirection: 'column', borderBottomColor:'#fff', borderBottomWidth: 1, backgroundColor: '#fff',}}>
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
                                <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Estimated Price (RM): </Text>
                                <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.shipperDetails.price}</Text>
                            </View>
                            <View style={{flexDirection: 'column',}}>
                                <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Delivery Distance (km): </Text>
                                <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.shipperDetails.shipperDeliveryDistance}</Text>
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
                        </View> */}
                    </Card>
                </View> : <View />}
                {(this.state.driverDetails !== [] && !this.state.spinnerVisible) ? <View style={{marginBottom: 20,}}><Card title={'Driver Order Details'} titleStyle={{fontFamily: 'AvenirLTStd-Black', fontSize: 16, color: '#2C2E6D',}} containerStyle={{margin: 15, borderRadius: 20, shadowOpacity: 1, backgroundColor: '#EFEFEF', shadowColor: '#e0e0e0', shadowRadius: 3, shadowOffset: {width: 1, height: 1,},}}>
                    <View style={{flexDirection: 'row', paddingBottom: 10, paddingRight: 10,}}>
                        <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                            <FeatherIcon name="type" size={19} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                        </View>
                        <View style={{flexDirection: 'column', paddingRight: 20,}}>
                            <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Driver Name</Text>
                            <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{this.state.driverDetails.driverName}</Text>
                        </View>
                    </View>
                    <View style={{flexDirection: 'row', paddingBottom: 10, paddingRight: 10,}}>
                        <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                            <MaterialComIcon name="cellphone" size={19} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                        </View>
                        <View style={{flexDirection: 'column', paddingRight: 20,}}>
                            <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Driver Phone Number</Text>
                            <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{this.state.driverDetails.driverPhoneNumber}</Text>
                        </View>
                    </View>
                    <View style={{flexDirection: 'row', paddingBottom: 10, paddingRight: 10,}}>
                        <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                            <MaterialComIcon name="script-text-outline" size={19} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                        </View>
                        <View style={{flexDirection: 'column', paddingRight: 20,}}>
                            <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Order Number</Text>
                            <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{this.state.driverDetails.orderNumber}</Text>
                        </View>
                    </View>
                    <View style={{flexDirection: 'row', paddingBottom: 10, paddingRight: 10,}}>
                        <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                            <MaterialComIcon name="map-marker-radius" size={19} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                        </View>
                        <View style={{flexDirection: 'column', paddingRight: 20,}}>
                            <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Depart Location &#47; Expected Departure Date</Text>
                            <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{this.state.driverDetails.departLocation} &#47; {this.state.driverDetails.expectedDepartureDate}</Text>
                        </View>
                    </View>
                    <View style={{flexDirection: 'row', paddingBottom: 10, paddingRight: 10,}}>
                        <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                            <MaterialComIcon name="map-marker-check" size={19} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                        </View>
                        <View style={{flexDirection: 'column', paddingRight: 20,}}>
                            <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Arrive Location &#47; Expected Arrival Date</Text>
                            <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{this.state.driverDetails.arriveLocation} &#47; {this.state.driverDetails.expectedArrivalDate}</Text>
                        </View>
                    </View>
                    <View style={{flexDirection: 'row', paddingBottom: 10, paddingRight: 10,}}>
                        <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                            <FeatherIcon name="truck" size={19} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                        </View>
                        <View style={{flexDirection: 'column', paddingRight: 20,}}>
                            <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Lorry Type</Text>
                            <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{this.state.driverDetails.lorryType}</Text>
                        </View>
                    </View>
                    <View style={{flexDirection: 'row', paddingBottom: 10, paddingRight: 10,}}>
                        <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                            <MaterialComIcon name="numeric" size={19} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                        </View>
                        <View style={{flexDirection: 'column', paddingRight: 20,}}>
                            <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Lorry Plate Number</Text>
                            <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{this.state.driverDetails.lorryPlateNumber}</Text>
                        </View>
                    </View>
                    <View style={{flexDirection: 'row', paddingBottom: 10, paddingRight: 10,}}>
                        <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                            <MaterialComIcon name="keyboard-return" size={19} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                        </View>
                        <View style={{flexDirection: 'column', paddingRight: 20,}}>
                            <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Lorry Return</Text>
                            <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{(this.state.driverDetails.isReturn) ? 'Yes' : 'No'}</Text>
                        </View>
                    </View>
                    <View style={{flexDirection: 'row', paddingBottom: 10, paddingRight: 10,}}>
                        <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                            <OctiIcon name="note" size={19} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                        </View>
                        <View style={{flexDirection: 'column', paddingRight: 20,}}>
                            <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Order Description</Text>
                            <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{this.state.driverDetails.orderDescription}</Text>
                        </View>
                    </View>
                    <View style={{flexDirection: 'row', paddingBottom: 10, paddingRight: 10,}}>
                        <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                            <FeatherIcon name="box" size={19} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                        </View>
                        <View style={{flexDirection: 'column', paddingRight: 20,}}>
                            <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Vehicle Specification</Text>
                            <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{this.state.driverDetails.vehicleSpecifications}</Text>
                        </View>
                    </View>
                    {/* <View style={{paddingTop: 10, paddingBottom: 10, paddingLeft: 0, paddingRight: 0, flexDirection: 'column', borderBottomColor:'#fff', borderBottomWidth: 1, backgroundColor: '#fff',}}>
                        <View style={{flexDirection: 'column',}}>
                            <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Driver Name: </Text>
                            <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.driverDetails.driverName}</Text>
                        </View>
                        <View style={{flexDirection: 'column',}}>
                            <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Driver Phone Number: </Text>
                            <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.driverDetails.driverPhoneNumber}</Text>
                        </View>
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
                            <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Lorry Type: </Text>
                            <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.driverDetails.lorryType}</Text>
                        </View>
                        <View style={{flexDirection: 'column',}}>
                            <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Lorry Plate Number: </Text>
                            <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.driverDetails.lorryPlateNumber}</Text>
                        </View>
                        <View style={{flexDirection: 'column',}}>
                            <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Lorry Return: </Text>
                            <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{(this.state.driverDetails.isReturn) ? 'Yes' : 'No'}</Text>
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
                    </View> */}
                </Card></View> : <View />}
                {spinnerView}
                {
                    (!this.state.spinnerVisible) ? <View>
                        {
                            (this.state.isCancelClicked || this.state.isClicked) ? <View style={{alignItems: 'center', paddingBottom: 0, marginTop: 10,}}> 
                                <Spinner
                                    isVisible={this.state.isSubmit}
                                    type={'ThreeBounce'}
                                    color='#F4D549'
                                    size={30}/>
                            </View> : <View/>
                        }
                        <View style={this.state.isCancelClicked ? {backgroundColor: '#F4D549', borderRadius: 20, paddingLeft: 10, paddingRight: 10, marginLeft: 10, marginRight: 10, marginBottom: 10, marginTop: 0,} : {backgroundColor: '#fb3f33', borderRadius: 20, paddingLeft: 10, paddingRight: 10, marginLeft: 10, marginRight: 10, marginBottom: 10, marginTop: 0,}}>
                            <TouchableOpacity
                                disabled={this.state.isCancelClicked}
                                style={this.state.isCancelClicked ? {backgroundColor: '#F4D549', borderRadius: 20, paddingVertical: 15,} : {backgroundColor: '#fb3f33', borderRadius: 20, paddingVertical: 15,}}
                                onPress={() => {
                                    this.setState({
                                        isCancelClicked: true,
                                    })
                                    this.props.navigation.goBack()
                                    setTimeout(() => {
                                        this.setState({
                                            isCancelClicked: false,
                                        })
                                    }, 500)
                                }}>
                                <Text style={this.state.isCancelClicked ? {color: '#2C2E6D', textAlign: 'center', fontSize: 16, fontFamily: 'AvenirLTStd-Black',} : {color: '#fff', textAlign: 'center', fontSize: 16, fontFamily: 'AvenirLTStd-Black',}}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={this.state.isClicked ? {backgroundColor: '#F4D549', borderRadius: 20, paddingLeft: 10, paddingRight: 10, marginLeft: 10, marginRight: 10, marginBottom: 10, marginTop: 0,} : {backgroundColor: '#2C2E6D', borderRadius: 20, paddingLeft: 10, paddingRight: 10, marginLeft: 10, marginRight: 10, marginBottom: 10, marginTop: 0,}}>
                            <TouchableOpacity
                                disabled={this.state.isClicked}
                                style={this.state.isClicked ? {backgroundColor: '#F4D549', borderRadius: 20, paddingVertical: 15,} : styles.buttonContainer}
                                onPress={() => this.confirmOrder()}>
                                <Text style={this.state.isClicked ? {color: '#2C2E6D', textAlign: 'center', fontSize: 16, fontFamily: 'AvenirLTStd-Black',} : {color: '#fff', textAlign: 'center', fontSize: 16, fontFamily: 'AvenirLTStd-Black',}}>Confirm</Text>
                            </TouchableOpacity>
                        </View>

                        {/* <View style={{backgroundColor: '#fff', paddingLeft: 10, paddingRight: 10, marginLeft: 20, marginRight: 20, marginBottom: 20,}}>
                            <TouchableOpacity
                                style={{backgroundColor: '#fb3f33', paddingVertical: 15,}}
                                onPress={() => this.props.navigation.goBack()}>
                                <Text style={styles.buttonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{backgroundColor: '#fff', paddingLeft: 10, paddingRight: 10, marginLeft: 20, marginRight: 20, marginBottom: 40,}}>
                            <TouchableOpacity
                                style={styles.buttonContainer}
                                onPress={() => this.confirmOrder()}>
                                <Text style={styles.buttonText}>Confirm</Text>
                            </TouchableOpacity>
                        </View>  */}
                    </View> : <View/>
                }
            </ScrollView>
        )
    }
}