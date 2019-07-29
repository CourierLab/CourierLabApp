import React, { Component } from 'react';
import { View, Text, Alert, StatusBar, isAndroid, ScrollView, TouchableOpacity, Linking, Platform } from 'react-native';
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
import { ListItem, Card, } from 'react-native-elements';

let myApiUrl = 'http://courierlabapi.azurewebsites.net/api/v1/MobileApi';
let orderPendingPath = 'ViewPendingShipper';
let deleteOrderPath = 'DeleteDriverOrder';
let deviceId = DeviceInfo.getUniqueID();
let realm = new MyRealm();
let loginAsset = realm.objects('LoginAsset');
let count = 0;
let _this = this;

export default class HistoryOrderDetails extends Component{
    static navigationOptions = {
        // title: 'Order Details',
        headerTitle: <View style={{flexDirection: 'row',}}>
                <FeatherIcon name="shopping-cart" size={19} color="#fff" style={{paddingLeft: 10, paddingRight: 10,}}/>
                <Text style={{color: '#fff', fontWeight: 'bold', fontFamily: 'AvenirLTStd-Black', fontSize: 15, paddingTop: 3,}}>Order Details</Text>
            </View>,
        headerRight: (
            <MaterialComIcon onPress={() => _this.props.navigation.navigate('EditOrder', { driverOrderId: _this.props.navigation.getParam('driverOrderId'), rerenderFunction : () => _this.getOrderPendingList() })} name={'pencil-outline'} size={25} color={'#fff'} style={{paddingRight: 20,}}/>
        ),
    };
    
    constructor(props){
        super(props);
        this.state = {
            spinnerVisible: false,
            orderSummary: [],
            pendingShipperOrderList: [],
            pagination: {},
            isScrollSpinner: false,
            noMoreData: false,
        };
        _this = this;
    }

    componentDidMount() {
        setTimeout(() => {
            this.checkInternetConnection();
        }, 500);
        this.getOrderPendingList();
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

    getOrderPendingList(){
        this.setState({
            spinnerVisible: true,
        })
        fetch(`${myApiUrl}/${orderPendingPath}?deviceId=` + deviceId + `&userId=` + loginAsset[0].userId + `&driverOrderId=` + this.props.navigation.getParam('driverOrderId'), {
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
                    orderSummary: json.results.driverOrder,
                    pendingShipperOrderList: json.results.pendingShipper,
                    pagination: json.paging,
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

    deleteOrder(){
        Alert.alert(
            'Delete Driver Order',
            'Are you sure you want to delete this driver order?',
            [
              {text: 'Cancel', onPress: () => {}},
              {text: 'Yes, Delete it', onPress: () => {
                this.setState({
                    spinnerVisible: true,
                })
                fetch(`${myApiUrl}/${deleteOrderPath}?deviceId=` + deviceId + `&userId=` + loginAsset[0].userId + `&driverOrderId=` + this.props.navigation.getParam('driverOrderId'), {
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
                        Alert.alert('Successfully Deleted', json.message, [
                        {
                            text: 'OK',
                            onPress: () => {}
                        }], {cancelable: false})
                        this.props.navigation.goBack();
                    }else{
                        Alert.alert('Cannot Delete', json.message, [
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
              }},
            ],{ cancelable: false }
        )
    }

    isCloseToBottom({layoutMeasurement, contentOffset, contentSize}){
        const paddingToBottom = 20;
        return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
    }

    callPagination(){
        this.setState({
            isScrollSpinner: true,
        })

        count++;
        if(this.state.pagination !== {}){
            if(this.state.pagination.next !== null && count == 1){
                fetch(this.state.pagination.next, {
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
                            pendingShipperOrderList: [...this.state.pendingShipperOrderList, ...json.results],
                            pagination: json.paging,
                            isScrollSpinner: false,
                        });
                        count = 0;
                    }
                    console.log('latest paging: ', json.paging);
                }).catch(err => {
                    console.log(err);
                    this.setState({
                        isScrollSpinner: false,
                    })
                    count = 0;
                });
            }

            if(this.state.pagination.next === null){
                this.setState({
                    noMoreData: true,
                    isScrollSpinner: false,
                })
            }
        }
    }

    render(){
        var pendingView = <View style={styles.noListContainer}>
                            <Text style={{color: '#9B9B9B', fontFamily: 'AvenirLTStd-Roman', fontSize: 14,}}>No Pending Order</Text> 
                          </View>;
        if(this.state.pendingShipperOrderList !== [] && this.state.pendingShipperOrderList.length > 0){
            pendingView = this.state.pendingShipperOrderList.map((item, index) => (
                <ListItem 
                    key={index}
                    // bottomDivider={true}
                    // rightIcon={<Icon name='chevron-right' color='#3c4c96' style={{marginLeft: 3, marginRight: 20}}/>}
                    // title={ <Text style={styles.listItemText}>{item.shipperName}</Text> }
                    subtitle={
                        // <View style={styles.listItemView}>
                        //     {(item.orderDescription !== "") ? <View style={styles.iconView}>
                        //             <Icon name={'info'} size={15} color={'#3c4c96'} style={{marginLeft: 3, marginRight: 6}}/>
                        //             <Text style={styles.listItemText}> {item.orderDescription}</Text>    
                        //         </View> : <View/>
                        //     }
                        //     <View style={styles.iconView}>
                        //         <Icon name={'map-pin'} size={14} color={'#3c4c96'} style={{marginLeft: 2, marginRight: 6}}/>
                        //         <Text style={{fontSize: 15, fontFamily: 'AvenirLTStd-Roman',}}> {item.pickupLocation}</Text>    
                        //     </View>
                        //     <View style={styles.iconView}>
                        //         <Icon name={'calendar'} size={15} color={'#3c4c96'} style={{marginLeft: 0, marginRight: 3}}/>
                        //         <Text style={styles.listItemText}> {item.pickUpDate}</Text>   
                        //     </View>
                        // </View>
                        <View style={{margin: 0, padding: 20, marginBottom: -10, backgroundColor: '#EFEFEF', borderRadius: 20,}}>
                            <View style={{flexDirection: 'row', justifyContent: 'space-between', }}>
                                <Text style={{fontSize: 14, fontFamily: 'AvenirLTStd-Black', color: '#2C2E6D',}}>{item.orderNumber}</Text>
                                <Text style={{fontSize: 14, fontFamily: 'AvenirLTStd-Roman', color: '#2C2E6D',}}>more info</Text>
                            </View>
                            <View style={{flexDirection: 'row', paddingTop: 10,}}>
                                <Text style={{fontSize: 14, fontFamily: 'AvenirLTStd-Roman', color: '#2C2E6D',}}>{item.shipperName}</Text>
                            </View>
                            <View style={{flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10, }}>
                                <View style={{flexDirection: 'column', width: '40%',}}>
                                    <Text style={{fontSize: 14, fontFamily: 'AvenirLTStd-Black', color: '#2C2E6D',}}>{item.pickupLocation}</Text>
                                    <Text style={{fontSize: 14, fontFamily: 'AvenirLTStd-Roman', color: '#2C2E6D',}}>{item.pickUpDate}</Text>
                                </View>
                                <View style={{flexDirection: 'column', width: '20%', justifyContent: 'center',}}>
                                    <AntIcon name="swapright" size={40} color="#2C2E6D" style={{paddingLeft: 5, paddingRight: 5,}}/>
                                </View>
                                <View style={{flexDirection: 'column', width: '40%',}}>
                                    <Text style={{fontSize: 14, fontFamily: 'AvenirLTStd-Black', color: '#2C2E6D',}}>{item.recipientAddress}</Text>
                                    <Text style={{fontSize: 14, fontFamily: 'AvenirLTStd-Roman', color: '#2C2E6D',}}>{item.expectedArrivalDate}</Text>
                                </View>
                            </View>
                        </View>
                    }
                    onPress={() => this.props.navigation.navigate('SelectShipperOrder', {
                        driverOrderId: this.props.navigation.getParam('driverOrderId'),
                        shipperOrderId: item.shipperOrderId,
                })}/>
            ));
        }
        return (
            <ScrollView style={{backgroundColor: '#fff',}}
                onScroll={({nativeEvent}) => {
                    if (this.isCloseToBottom(nativeEvent)) {
                        this.callPagination();
                    }
                }}
                scrollEventThrottle={0}>
                {
                    (this.state.spinnerVisible) ? <View style={{marginBottom: 20, marginTop: 20, alignItems: 'center',}}>
                            <Spinner
                                isVisible={this.state.spinnerVisible}
                                type={'ThreeBounce'}
                                color='#F4D549'
                                size={30}/>
                        </View> : <View/>
                }
                {(this.state.orderSummary !== undefined && !this.state.spinnerVisible) ? <View> 
                    <Card title={'Driver Status'} titleStyle={{fontFamily: 'AvenirLTStd-Black', fontSize: 16, color: '#2C2E6D',}} containerStyle={{margin: 15, borderRadius: 20, shadowOpacity: 1, backgroundColor: '#EFEFEF', shadowColor: '#e0e0e0', shadowRadius: 3, shadowOffset: {width: 1, height: 1,},}}>
                        <View style={{paddingTop: 10, paddingBottom: 10, paddingLeft: 0, paddingRight: 0, flexDirection: 'column', backgroundColor: '#EFEFEF',}}>
                            <View style={{flexDirection: 'row', paddingBottom: 10, paddingRight: 10,}}>
                                <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                                    <MaterialComIcon name="script-text-outline" size={19} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                                </View>
                                <View style={{flexDirection: 'column', paddingRight: 20,}}>
                                    <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Order Number</Text>
                                    <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{this.state.orderSummary.orderNumber}</Text>
                                </View>
                            </View>
                            <View style={{flexDirection: 'row', paddingBottom: 10, paddingRight: 10,}}>
                                <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                                    <MaterialComIcon name="map-marker-radius" size={19} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                                </View>
                                <View style={{flexDirection: 'column', paddingRight: 20,}}>
                                    <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Depart Location &#47; Expected Departure Date</Text>
                                    <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{this.state.orderSummary.departLocation} &#47; {this.state.orderSummary.expectedDepartureDate}</Text>
                                </View>
                            </View>
                            <View style={{flexDirection: 'row', paddingBottom: 10, paddingRight: 10,}}>
                                <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                                    <MaterialComIcon name="map-marker-check" size={19} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                                </View>
                                <View style={{flexDirection: 'column', paddingRight: 20,}}>
                                    <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Arrive Location &#47; Expected Arrival Date</Text>
                                    <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{this.state.orderSummary.arriveLocation} &#47; {this.state.orderSummary.expectedArrivalDate}</Text>
                                </View>
                            </View>
                            <View style={{flexDirection: 'row', paddingBottom: 10, paddingRight: 10,}}>
                                <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                                    <MaterialComIcon name="numeric" size={19} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                                </View>
                                <View style={{flexDirection: 'column', paddingRight: 20,}}>
                                    <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Lorry Plate Number</Text>
                                    <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{loginAsset[0].lorryPlateNumber}</Text>
                                </View>
                            </View>
                            <View style={{flexDirection: 'row', paddingBottom: 10, paddingRight: 10,}}>
                                <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                                    <MaterialComIcon name="keyboard-return" size={19} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                                </View>
                                <View style={{flexDirection: 'column', paddingRight: 20,}}>
                                    <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Lorry Return</Text>
                                    <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{this.state.orderSummary.isReturn}</Text>
                                </View>
                            </View>
                            <View style={{flexDirection: 'row', paddingBottom: 10, paddingRight: 10,}}>
                                <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                                    <OctiIcon name="note" size={19} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                                </View>
                                <View style={{flexDirection: 'column', paddingRight: 20,}}>
                                    <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Order Description</Text>
                                    <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{this.state.orderSummary.orderDescription}</Text>
                                </View>
                            </View>
                            <View style={{flexDirection: 'row', paddingBottom: 0, paddingRight: 10,}}>
                                <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                                    <FeatherIcon name="box" size={19} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                                </View>
                                <View style={{flexDirection: 'column', paddingRight: 20,}}>
                                    <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Vehicle Specification</Text>
                                    <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{this.state.orderSummary.vehicleSpecifications}</Text>
                                </View>
                            </View>

                            {/* <View style={{flexDirection: 'column',}}>
                                <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Order Number: </Text>
                                <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.orderSummary.orderNumber}</Text>
                            </View>
                            <View style={{flexDirection: 'column',}}>
                                <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Depart Location: </Text>
                                <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.orderSummary.departLocation}</Text>
                            </View>
                            <View style={{flexDirection: 'column',}}>
                                <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Arrive Location: </Text>
                                <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.orderSummary.arriveLocation}</Text>
                            </View>
                            <View style={{flexDirection: 'column',}}>
                                <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Lorry Plate Number:: </Text>
                                <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{loginAsset[0].lorryPlateNumber}</Text>
                            </View>
                            <View style={{flexDirection: 'column',}}>
                                <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Lorry Return: </Text>
                                <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.orderSummary.isReturn}</Text>
                            </View>
                            <View style={{flexDirection: 'column',}}>
                                <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Order Description: </Text>
                                <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.orderSummary.orderDescription}</Text>
                            </View>
                            <View style={{flexDirection: 'column',}}>
                                <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Expected Departure Date: </Text>
                                <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.orderSummary.expectedDepartureDate}</Text>
                            </View>
                            <View style={{flexDirection: 'column',}}>
                                <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Expected Arrival Date: </Text>
                                <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.orderSummary.expectedArrivalDate}</Text>
                            </View>
                            <View style={{flexDirection: 'column',}}>
                                <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Vehicle Specification: </Text>
                                <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.orderSummary.vehicleSpecifications}</Text>
                            </View> */}
                        </View>
                    </Card> 
                    <View style={this.state.isSubmit ? {backgroundColor: '#F4D549', borderRadius: 20, paddingLeft: 10, paddingRight: 10, marginLeft: 10, marginRight: 10, marginBottom: 20, marginTop: 20,} : {backgroundColor: '#2C2E6D', borderRadius: 20, paddingLeft: 10, paddingRight: 10, marginLeft: 10, marginRight: 10, marginBottom: 20, marginTop: 20,}}>
                        <TouchableOpacity
                            disabled={this.state.isSubmit}
                            style={this.state.isSubmit ? {backgroundColor: '#F4D549', borderRadius: 20, paddingVertical: 15,} : styles.buttonContainer}
                            onPress={() => this.deleteOrder()}>
                            <Text style={this.state.isSubmit ? {color: '#2C2E6D', textAlign: 'center', fontSize: 16, fontFamily: 'AvenirLTStd-Black',} : {color: '#fff', textAlign: 'center', fontSize: 16, fontFamily: 'AvenirLTStd-Black',}}>Delete Order</Text>
                        </TouchableOpacity>
                    </View>
                </View>: <View />}
                {(this.state.pendingShipperOrderList !== undefined && !this.state.spinnerVisible) ? <View>
                        <View style={{paddingTop: 10, paddingBottom: 10, paddingLeft: 10, paddingRight: 10, flexDirection: 'row', borderBottomColor:'#e0e0e0', borderBottomWidth: 1, backgroundColor: '#e0e0e0',}}>
                            <Text style={{fontSize: 18, paddingLeft: 10, fontFamily: 'AvenirLTStd-Roman',}}>Pending Shipper Orders</Text>
                        </View>
                        <View>
                            {pendingView}
                            {(this.state.isScrollSpinner) ? <View style={{marginBottom: 20, marginTop: 20, alignItems: 'center',}}>
                                <Spinner
                                    isVisible={this.state.isScrollSpinner}
                                    type={'ThreeBounce'}
                                    color='#F4D549'
                                    size={30}/>
                                    </View> : (this.state.noMoreData) ? <View style={styles.noListContainer}>
                                        <Text style={{color: '#9B9B9B', fontFamily: 'AvenirLTStd-Roman', fontSize: 14,}}>No More Shipper Order</Text> 
                                    </View>
                                : <View/>
                            }
                        </View>
                    </View> : <View/>
                }
            </ScrollView>
        )
    }
}