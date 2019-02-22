import React, { Component } from 'react';
import { View, Text, Alert, StatusBar, isAndroid, ScrollView, TouchableOpacity, Linking, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import NetworkConnection from '../utils/NetworkConnection';
import DeviceInfo from 'react-native-device-info';
import MyRealm from '../utils/Realm';
import { styles } from '../utils/Style';
import Spinner from 'react-native-spinkit';
import { ListItem, Card, } from 'react-native-elements';

let myApiUrl = 'http://courierlabapi.azurewebsites.net/api/v1/MobileApi';
let orderPendingPath = 'ViewPendingDriver';
let deleteOrderPath = 'DeleteShipperOrder';
let deviceId = DeviceInfo.getUniqueID();
let realm = new MyRealm();
let loginAsset = realm.objects('LoginAsset');
let count = 0;

export default class HistoryOrderDetails extends Component{
    static navigationOptions = {
        title: 'Order Details',
        headerRight: (
            <Icon onPress={() => _this.props.navigation.navigate('EditOrder', { shipperOrderId: _this.props.navigation.getParam('shipperOrderId'), rerenderFunction : () => _this.getOrderPendingList() })} name={'pencil'} size={25} color={'#fff'} style={{paddingRight: 20,}}/>
        ),
    };
    
    constructor(props){
        super(props);
        this.state = {
            spinnerVisible: false,
            orderSummary: [],
            pendingDriverOrderList: [],
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
        fetch(`${myApiUrl}/${orderPendingPath}?deviceId=` + deviceId + `&userId=` + loginAsset[0].userId + `&shipperOrderId=` + this.props.navigation.getParam('shipperOrderId'), {
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
            if(json.succeeded){
                this.setState({
                    orderSummary: json.results.shipperOrder,
                    pendingDriverOrderList: json.results.pendingDriver,
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
                fetch(`${myApiUrl}/${deleteOrderPath}?deviceId=` + deviceId + `&userId=` + loginAsset[0].userId + `&shipperOrderId=` + this.props.navigation.getParam('shipperOrderId'), {
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
        console.log(this.state.pagination);
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
                            pendingDriverOrderList: [...this.state.pendingDriverOrderList, ...json.results],
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
                            <Text style={styles.noListText}>No Pending Order</Text> 
                          </View>;
        if(this.state.pendingDriverOrderList !== [] && this.state.pendingDriverOrderList.length > 0){
            pendingView = this.state.pendingDriverOrderList.map((item, index) => (
                <ListItem 
                    key={index}
                    bottomDivider={true}
                    rightIcon={<Icon name='chevron-right' color='#3c4c96' style={{marginLeft: 3, marginRight: 20}}/>}
                    title={ <Text style={styles.listItemText}>{item.orderNumber}</Text> }
                    subtitle={
                        <View style={styles.listItemView}>
                            {(item.orderDescription !== "") ? <View style={styles.iconView}>
                                    <Icon name={'info'} size={15} color={'#3c4c96'} style={{marginLeft: 3, marginRight: 6}}/>
                                    <Text style={styles.listItemText}> {item.orderDescription}</Text>    
                                </View> : <View/>
                            }
                            <View style={{flexDirection: 'row',}}>
                                <Icon name={'map-pin'} size={15} color={'#3c4c96'} style={{marginLeft: 2}}/>
                                <Text style={styles.listItemText}>  {item.departLocation} </Text> 
                            </View>
                            <View style={{flexDirection: 'row', marginLeft: 20,}}>
                                <Icon name={'long-arrow-right'} size={13} color={'#3c4c96'} style={{marginLeft: 2}}/>
                                <Text style={styles.listItemText}>  {item.arriveLocation}</Text>    
                            </View>
                            <View style={styles.iconView}>
                                <Icon name={'calendar'} size={15} color={'#3c4c96'} style={{marginLeft: 0, marginRight: 3}}/>
                                <Text style={styles.listItemText}> {item.expectedDepartureDate}</Text>   
                            </View>
                            <View style={{flexDirection: 'row', marginLeft: 20,}}>
                                <Icon name={'long-arrow-right'} size={13} color={'#3c4c96'} style={{marginLeft: 2}}/>
                                <Text style={styles.listItemText}>  {item.expectedArrivalDate}</Text>    
                            </View>
                        </View>
                    }
                    onPress={() => this.props.navigation.navigate('SelectDriverOrder', {
                        shipperOrderId: this.props.navigation.getParam('shipperOrderId'),
                        driverOrderId: item.driverOrderId,
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
                                type={'9CubeGrid'}
                                color='#3c4c96'
                                paddingLeft={20}
                                size={50}/>
                        </View> : <View/>
                }
                {(this.state.orderSummary !== undefined && !this.state.spinnerVisible) ? <View> 
                    <Card title={'Shipper Status'} containerStyle={{margin: 20,}}>
                        <View style={{paddingTop: 10, paddingBottom: 10, paddingLeft: 0, paddingRight: 0, flexDirection: 'column', borderBottomColor:'#fff', borderBottomWidth: 1, backgroundColor: '#fff',}}>
                            <View style={{flexDirection: 'column',}}>
                                <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Order Number: </Text>
                                <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.orderSummary.orderNumber}</Text>
                            </View>
                            {/* <View style={{flexDirection: 'column',}}>
                                <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Lorry Type: </Text>
                                <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.orderSummary.lorryTypeName}</Text>
                            </View> */}
                            <View style={{flexDirection: 'column',}}>
                                <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Order Description: </Text>
                                <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.orderSummary.orderDescription}</Text>
                            </View>
                            <View style={{flexDirection: 'column',}}>
                                <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Order Weight (kg): </Text>
                                <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.orderSummary.orderWeight}</Text>
                            </View>
                            <View style={{flexDirection: 'column',}}>
                                <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Estimated Price (RM): </Text>
                                <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.orderSummary.price}</Text>
                            </View>
                            <View style={{flexDirection: 'column',}}>
                                <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Delivery Distance (km): </Text>
                                <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.orderSummary.shipperDeliveryDistance}</Text>
                            </View>
                            <View style={{flexDirection: 'column',}}>
                                <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Vehicle Specification: </Text>
                                <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.orderSummary.vehicleSpecifications}</Text>
                            </View>
                            <View style={{flexDirection: 'column',}}>
                                <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Pick Up Location: </Text>
                                <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.orderSummary.pickupLocation}</Text>
                            </View>
                            <View style={{flexDirection: 'column',}}>
                                <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Pick Up Date: </Text>
                                <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.orderSummary.pickUpDate}</Text>
                            </View>
                            <View style={{flexDirection: 'column',}}>
                                <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Expected Arrival Date: </Text>
                                <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.orderSummary.expectedArrivalDate}</Text>
                            </View>
                            <View style={{flexDirection: 'column',}}>
                                <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Recipient Name: </Text>
                                <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.orderSummary.recipientName}</Text>
                            </View>
                            <View style={{flexDirection: 'column',}}>
                                <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Recipient Contact Number: </Text>
                                <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.orderSummary.recipientPhoneNumber}</Text>
                            </View>
                            <View style={{flexDirection: 'column',}}>
                                <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Recipient Email: </Text>
                                <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.orderSummary.recipientEmailAddress}</Text>
                            </View>
                            <View style={{flexDirection: 'column',}}>
                                <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Recipient Address: </Text>
                                <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.orderSummary.recipientAddress}</Text>
                            </View>
                            {/* <View style={{flexDirection: 'column',}}>
                                <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Recipient State: </Text>
                                <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.orderSummary.recipientState}</Text>
                            </View>
                            <View style={{flexDirection: 'column',}}>
                                <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Recipient Postcode: </Text>
                                <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.orderSummary.recipientPostCode}</Text>
                            </View> */}
                        </View>
                    </Card> 
                    <View style={{backgroundColor: '#3c4c96', paddingLeft: 10, paddingRight: 10, marginLeft: 20, marginRight: 20, marginBottom: 20, marginTop: 20,}}>
                        <TouchableOpacity
                            style={styles.buttonContainer}
                            onPress={() => this.deleteOrder()}>
                            <Text style={styles.buttonText}>Delete Order</Text>
                        </TouchableOpacity>
                    </View>
                </View>: <View />}
                {(this.state.pendingDriverOrderList !== undefined && !this.state.spinnerVisible) ? <View>
                        <View style={{paddingTop: 10, paddingBottom: 10, paddingLeft: 10, paddingRight: 10, flexDirection: 'row', borderBottomColor:'#e0e0e0', borderBottomWidth: 1, backgroundColor: '#e0e0e0',}}>
                            <Text style={{fontSize: 18, paddingLeft: 10, fontFamily: 'Raleway-Regular',}}>Pending Driver Orders</Text>
                        </View>
                        <View>
                            {pendingView}
                            {(this.state.isScrollSpinner) ? <View style={{marginBottom: 20, marginTop: 20, alignItems: 'center',}}>
                                <Spinner
                                    isVisible={this.state.isScrollSpinner}
                                    type={'9CubeGrid'}
                                    color='#3c4c96'
                                    paddingLeft={20}
                                    size={50}/>
                                    </View> : (this.state.noMoreData) ? <View style={styles.noListContainer}>
                                        <Text style={styles.noListText}>No More Driver Order</Text> 
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