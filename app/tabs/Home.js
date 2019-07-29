import React, { Component } from 'react';
import { View, Text, Alert, StatusBar, isAndroid, Platform, ScrollView, } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import FeatherIcon from 'react-native-vector-icons/Feather';
import AntIcon from 'react-native-vector-icons/AntDesign';
import NetworkConnection from '../utils/NetworkConnection';
import DeviceInfo from 'react-native-device-info';
import MyRealm from '../utils/Realm';
import { ListItem } from 'react-native-elements';
import { styles } from '../utils/Style';
import Spinner from 'react-native-spinkit';
import OneSignal from 'react-native-onesignal';

let myApiUrl = 'http://courierlabapi.azurewebsites.net/api/v1/MobileApi';
let pendingOrderPath = 'ViewPendingShipper';
let deviceId = DeviceInfo.getUniqueID();
let realm = new MyRealm();
let loginAsset = realm.objects('LoginAsset');
let isPending = '';
let orderId = '';
let count = 0;

export default class Home extends Component{
    static navigationOptions = {
        // title: 'Pending Shipper Order',
        headerTitle: <View style={{flexDirection: 'row',}}>
                <FeatherIcon name="shopping-cart" size={19} color="#fff" style={{paddingLeft: 10, paddingRight: 10,}}/>
                <Text style={{color: '#fff', fontWeight: 'bold', fontFamily: 'AvenirLTStd-Black', fontSize: 15, paddingTop: 3,}}>Pending Shipper Order</Text>
            </View>,
    };
    
    constructor(props){
        super(props);
        this.state = {
            pendingOrderData: [],
            spinnerVisible: false,
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
        console.log(deviceId);
        console.log(loginAsset[0]);
        this._navListener = this.props.navigation.addListener('willFocus', (playload) => {
            StatusBar.setBarStyle('light-content');
            isAndroid && StatusBar.setBackgroundColor('#3c4c96');
            this.getPendingOrder();
            console.log('payload: ', playload);
        });
        OneSignal.init("8fcca8d9-ca8d-4bbf-907f-261a1a8324f5");
        OneSignal.addEventListener('received', this.onReceived);
        OneSignal.addEventListener('opened', this.onOpened);
        OneSignal.addEventListener('ids', this.onIds);
    }

    componentWillUnmount() {
        this._navListener.remove();
        OneSignal.removeEventListener('received', this.onReceived);
        OneSignal.removeEventListener('opened', this.onOpened);
        OneSignal.removeEventListener('ids', this.onIds);
    }

    onReceived(notification) {
        console.log("Notification received: ", notification);
    }

    onOpened(openResult) {
        console.log('Message: ', openResult.notification.payload.body);
        console.log('Data: ', openResult.notification.payload.additionalData);
        console.log('isActive: ', openResult.notification.isAppInFocus);
        console.log('openResult: ', openResult);
        // console.log('url: ', openResult.notification.payload.launchURL);
        isPending = openResult.notification.payload.additionalData.IsPending;
        orderId = openResult.notification.payload.additionalData.OrderID;
        console.log('ispending: ', isPending);
        let now = new Date();
        if(loginAsset[0] !== undefined){
            if(new Date(loginAsset[0].accessTokenExpiredDate) < now){
                //refresh token
                console.log('expired token calling');
                fetch(`${myApiUrl}/${refreshTokenPath}?userId=` + loginAsset[0].userId + `&deviceId=` + deviceId, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': loginAsset[0].refreshToken,
                    },
                })
                .then((response) => response.json())
                .then((json) => {
                    console.log('getResult: ', json);
                    console.log('update token successfully');
                    if(json.succeeded){
                        realm.write(() => {
                            loginAsset[0].accessToken = json.results.newAccessToken;
                            loginAsset[0].accessTokenExpiredDate = json.results.accessTokenExpiredDate;
                            loginAsset[0].refreshToken = json.results.newRefreshToken;
                        })
                        _this.props.onLogin(loginAsset[0].email);
                    }else{
                        Alert.alert('Login Expired', 'Please try to login again', [{
                            text: 'OK',
                            onPress: () => {},
                            style: styles.alertText,
                        }], {cancelable: false});
                        _this.props.onLogout();
                    }
                }).catch(err => {
                    console.log(err);
                });
            }else{
                // console.log('not over, token: ', loginAsset[0].accessTokenExpiredDate, ' now: ', now);
                //go to main page
                console.log('not expired yet');
                if(isPending){
                    // if(Platform.OS === 'ios'){
                    _this.props.navigation.navigate('PendingConfirmationDetail', {
                        driverOrderId: orderId,
                        fromNotification: true,
                    })
                    // }else{
                    //     this.props.navigation.navigate('PendingConfirmationDetail', {
                    //         driverOrderId: orderId,
                    //     })
                    // }
                }else{
                    // if(Platform.OS === 'ios'){
                    _this.props.navigation.navigate('ConfirmedOrderDetail', {
                        driverOrderId: orderId,
                    })
                    // }else{
                    //     this.props.navigation.navigate('ConfirmedOrderDetail', {
                    //         driverOrderId: orderId,
                    //     })
                    // }
                }            
            }
        }
    }

    onIds(device) {
		console.log('Device info: ', device);
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

    getPendingOrder(){
        this.setState({
            spinnerVisible: true,
        })
        fetch(`${myApiUrl}/${pendingOrderPath}?deviceId=` + deviceId + `&userId=` + loginAsset[0].userId, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': loginAsset[0].accessToken,
            },
        })
        .then((response) => response.json())
        .then((json) => {
            console.log('access token', loginAsset[0].accessToken);
            console.log('getResult: ', json);
            if(json.succeeded){
                this.setState({
                    pendingOrderData: json.results,
                    pagination: json.paging,
                });
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
                            pendingOrderData: [...this.state.pendingOrderData, ...json.results],
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
                            <Text style={{color: '#9B9B9B', fontSize: 14, fontFamily: 'AvenirLTStd-Roman', paddingTop: 10,}}>No Pending Order</Text> 
                          </View>;
        console.log(this.state.pendingOrderData);
        if(this.state.pendingOrderData !== [] && this.state.pendingOrderData.length > 0){
            pendingView = this.state.pendingOrderData.map((item, index) => (
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
                    onPress={() => this.props.navigation.navigate('PendingOrderDetails', {
                        orderDetails: item,
                })}/>
                ));
        }
        return (
            <ScrollView style={styles.listViewContainer}
                onScroll={({nativeEvent}) => {
                    if (this.isCloseToBottom(nativeEvent)) {
                        this.callPagination();
                    }
                }}
                scrollEventThrottle={0}>
                <StatusBar
                barStyle="light-content"
                backgroundColor="#2C2E6D"/>
                {
                    (!this.state.spinnerVisible) ? <View style={styles.homeView}>
                        {pendingView}
                        {(this.state.isScrollSpinner) ? <View style={{marginBottom: 20, marginTop: 20, alignItems: 'center',}}>
                            <Spinner
                                isVisible={this.state.isScrollSpinner}
                                type={'ThreeBounce'}
                                color='#F4D549'
                                size={30}/>
                                </View> : (this.state.noMoreData) ? <View style={styles.noListContainer}>
                                    <Text style={{color: '#9B9B9B', fontSize: 14, fontFamily: 'AvenirLTStd-Roman', paddingTop: 10,}}>No More Pending Shipper Order</Text> 
                                </View>
                            : <View/>
                        }
                    </View> : <View style={{marginBottom: 20, alignItems: 'center', marginTop: 20,}}>
                        <Spinner
                            isVisible={this.state.spinnerVisible}
                            type={'ThreeBounce'}
                            color='#F4D549'
                            size={30}/>
                    </View>
                }
            </ScrollView>
        )
    }
}