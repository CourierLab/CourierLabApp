import React, { Component } from 'react';
import { View, Text, Alert, StatusBar, isAndroid, Platform, ScrollView, } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import NetworkConnection from '../utils/NetworkConnection';
import DeviceInfo from 'react-native-device-info';
import MyRealm from '../utils/Realm';
import { ListItem } from 'react-native-elements';
import { styles } from '../utils/Style';
import Spinner from 'react-native-spinkit';

let myApiUrl = 'http://courierlabapi.azurewebsites.net/api/v1/MobileApi';
let pendingDriverOwnOrderPath = 'DriverOwnPendingOrder';
let deviceId = DeviceInfo.getUniqueID();
let realm = new MyRealm();
let loginAsset = realm.objects('LoginAsset');
let isPending = '';
let orderId = '';
let count = 0;
_this = this;

export default class DriverPendingOrder extends Component{
    static navigationOptions = {
        title: 'Driver Pending Order',
        headerRight: (
            <Icon onPress={() => _this.props.navigation.navigate('AddOrder', { shipperOrderId: _this.props.navigation.getParam('shipperOrderId') })} name={'plus'} size={25} color={'#fff'} style={{paddingRight: 20,}}/>
        ),
    };
    
    constructor(props){
        super(props);
        this.state = {
            pendingOwnOrderData: [],
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
        this.getPendingDriverOwnOrder();
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

    getPendingDriverOwnOrder(){
        this.setState({
            spinnerVisible: true,
        })
        fetch(`${myApiUrl}/${pendingDriverOwnOrderPath}?deviceId=` + deviceId + `&userId=` + loginAsset[0].userId + `&driverId=` + loginAsset[0].loginUserId, {
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
                    pendingOwnOrderData: json.results,
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
                            pendingOwnOrderData: [...this.state.pendingOwnOrderData, ...json.results],
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
                            <Text style={styles.noListText}>No Driver Pending Order</Text> 
                          </View>;
        console.log(this.state.pendingOwnOrderData);
        if(this.state.pendingOwnOrderData !== [] && this.state.pendingOwnOrderData.length > 0){
            pendingView = this.state.pendingOwnOrderData.map((item, index) => (
                // <ListItem 
                //     key={index}
                //     bottomDivider={true}
                //     rightIcon={<Icon name='chevron-right' color='#3c4c96' style={{marginLeft: 3, marginRight: 20}}/>}
                //     title={ <Text style={styles.listItemText}>{item.shipperName}</Text> }
                //     subtitle={
                //         <View style={styles.listItemView}>
                //             {(item.orderDescription !== "") ? <View style={styles.iconView}>
                //                     <Icon name={'info'} size={15} color={'#3c4c96'} style={{marginLeft: 3, marginRight: 6}}/>
                //                     <Text style={styles.listItemText}> {item.orderDescription}</Text>    
                //                 </View> : <View/>
                //             }
                //             <View style={styles.iconView}>
                //                 <Icon name={'map-pin'} size={14} color={'#3c4c96'} style={{marginLeft: 2, marginRight: 6}}/>
                //                 <Text style={{fontSize: 15, fontFamily: 'Raleway-Regular',}}> {item.pickupLocation}</Text>    
                //             </View>
                //             <View style={styles.iconView}>
                //                 <Icon name={'calendar'} size={15} color={'#3c4c96'} style={{marginLeft: 0, marginRight: 3}}/>
                //                 <Text style={styles.listItemText}> {item.pickUpDate}</Text>   
                //             </View>
                //         </View>
                //     }
                //     onPress={() => this.props.navigation.navigate('ConfirmDriverShipperOrder', {
                //         orderDetails : json.results,
                //     })
                //     }/>
                    <ListItem 
                        key={index}
                        bottomDivider={true}
                        rightIcon={<Icon name='chevron-right' color='#3c4c96' style={{marginLeft: 3, marginRight: 20}}/>}
                        title={ <Text style={styles.listItemText}>{item.orderNumber}</Text> }
                        subtitle={
                            <View style={{paddingTop: 5, }}>
                                <View style={styles.iconView}>
                                {(item.orderDescription !== "") ? <View style={styles.iconView}>
                                    <Icon name={'info'} size={15} color={'#3c4c96'} style={{marginLeft: 3, marginRight: 6}}/>
                                    <Text style={styles.listItemText}> {item.orderDescription}</Text>    
                                    </View> : <View/>
                                }    
                                </View>
                                <View style={{flexDirection: 'row',}}>
                                    <Icon name={'map-pin'} size={15} color={'#3c4c96'} style={{marginLeft: 2}}/>
                                    <Text style={styles.listItemText}>  {item.departLocation} </Text> 
                                </View>
                                <View style={{flexDirection: 'row', marginLeft: 20,}}>
                                    <Icon name={'long-arrow-right'} size={13} color={'#3c4c96'} style={{marginLeft: 2}}/>
                                    <Text style={styles.listItemText}>  {item.arriveLocation}</Text>    
                                </View>
                                <View style={styles.iconView}>
                                    <Icon name={'calendar'} size={15} color={'#3c4c96'} />
                                    <Text style={styles.listItemText}> {item.expectedDepartureDate} </Text>
                                </View>
                                <View style={{flexDirection: 'row', marginLeft: 20,}}>
                                    <Icon name={'long-arrow-right'} size={13} color={'#3c4c96'} style={{marginLeft: 2}}/>
                                    <Text style={styles.listItemText}>  {item.expectedArrivalDate}</Text>   
                                </View>
                                <View style={styles.iconView}>
                                    <Icon name={'bookmark'} size={15} color={'#3c4c96'} />
                                    <Text style={styles.listItemText}>  {item.orderStatus}</Text>
                                </View>
                            </View>
                        }
                        onPress={() => { 
                            // this.props.navigation.navigate('ConfirmDriverShipperOrder', {
                            //     orderDetails : json.results,
                            // })
                            this.props.navigation.navigate('SelectShipperOrder', {
                                driverOrderId: item.driverOrderId,
                                shipperOrderId: this.props.navigation.getParam('shipperOrderId'),
                            })
                        }}
                    />
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
                backgroundColor="#3c4c96"/>
                {
                    (!this.state.spinnerVisible) ? <View style={styles.homeView}>
                        {pendingView}
                        {(this.state.isScrollSpinner) ? <View style={{marginBottom: 20, marginTop: 20, alignItems: 'center',}}>
                            <Spinner
                                isVisible={this.state.isScrollSpinner}
                                type={'9CubeGrid'}
                                color='#3c4c96'
                                paddingLeft={20}
                                size={50}/>
                                </View> : (this.state.noMoreData) ? <View style={styles.noListContainer}>
                                    <Text style={styles.noListText}>No More Driver Pending Order</Text> 
                                </View>
                            : <View/>
                        }
                    </View> : <View style={{marginBottom: 20, alignItems: 'center', marginTop: 20,}}>
                        <Spinner
                            isVisible={this.state.spinnerVisible}
                            type={'9CubeGrid'}
                            color='#3c4c96'
                            paddingLeft={20}
                            size={50}/>
                    </View>
                }
            </ScrollView>
        )
    }
}