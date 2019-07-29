import React, { Component } from 'react';
import { View, Text, Alert, StatusBar, isAndroid, Platform, ScrollView, } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialComIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import AntIcon from 'react-native-vector-icons/AntDesign';
import EntypoIcon from 'react-native-vector-icons/Entypo';
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
        // title: 'Driver Pending Order',
        headerTitle: <View style={{flexDirection: 'row',}}>
                <FeatherIcon name="truck" size={19} color="#fff" style={{paddingLeft: 10, paddingRight: 10,}}/>
                <Text style={{color: '#fff', fontWeight: 'bold', fontFamily: 'AvenirLTStd-Black', fontSize: 15, paddingTop: 3,}}>Driver Pending Order</Text>
            </View>,
        headerRight: (
            <EntypoIcon onPress={() => _this.props.navigation.navigate('AddOrder', { shipperOrderId: _this.props.navigation.getParam('shipperOrderId') })} name={'plus'} size={25} color={'#fff'} style={{paddingRight: 20,}}/>
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
                            <Text style={{color: '#9B9B9B', fontSize: 14, fontFamily: 'AvenirLTStd-Roman', paddingTop: 10,}}>No Driver Pending Order</Text> 
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
                //                 <Text style={{fontSize: 15, fontFamily: 'AvenirLTStd-Roman',}}> {item.pickupLocation}</Text>    
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
                        // bottomDivider={true}
                        // rightIcon={<Icon name='chevron-right' color='#3c4c96' style={{marginLeft: 3, marginRight: 20}}/>}
                        // title={ <Text style={styles.listItemText}>{item.orderNumber}</Text> }
                        subtitle={
                            // <View style={{paddingTop: 5, }}>
                            //     <View style={styles.iconView}>
                            //     {(item.orderDescription !== "") ? <View style={styles.iconView}>
                            //         <Icon name={'info'} size={15} color={'#3c4c96'} style={{marginLeft: 3, marginRight: 6}}/>
                            //         <Text style={styles.listItemText}> {item.orderDescription}</Text>    
                            //         </View> : <View/>
                            //     }    
                            //     </View>
                            //     <View style={{flexDirection: 'row',}}>
                            //         <Icon name={'map-pin'} size={15} color={'#3c4c96'} style={{marginLeft: 2}}/>
                            //         <Text style={styles.listItemText}>  {item.departLocation} </Text> 
                            //     </View>
                            //     <View style={{flexDirection: 'row', marginLeft: 20,}}>
                            //         <Icon name={'long-arrow-right'} size={13} color={'#3c4c96'} style={{marginLeft: 2}}/>
                            //         <Text style={styles.listItemText}>  {item.arriveLocation}</Text>    
                            //     </View>
                            //     <View style={styles.iconView}>
                            //         <Icon name={'calendar'} size={15} color={'#3c4c96'} />
                            //         <Text style={styles.listItemText}> {item.expectedDepartureDate} </Text>
                            //     </View>
                            //     <View style={{flexDirection: 'row', marginLeft: 20,}}>
                            //         <Icon name={'long-arrow-right'} size={13} color={'#3c4c96'} style={{marginLeft: 2}}/>
                            //         <Text style={styles.listItemText}>  {item.expectedArrivalDate}</Text>   
                            //     </View>
                            //     <View style={styles.iconView}>
                            //         <Icon name={'bookmark'} size={15} color={'#3c4c96'} />
                            //         <Text style={styles.listItemText}>  {item.orderStatus}</Text>
                            //     </View>
                            // </View>
                            <View style={{margin: 0, padding: 20, backgroundColor: '#EFEFEF', borderRadius: 20,}}>
                                <View style={{flexDirection: 'row', justifyContent: 'space-between', }}>
                                    <Text style={{fontSize: 14, fontFamily: 'AvenirLTStd-Black', color: '#2C2E6D',}}>{item.orderNumber}</Text>
                                    <Text style={{fontSize: 14, fontFamily: 'AvenirLTStd-Roman', color: '#2C2E6D',}}>more info</Text>
                                </View>
                                <View style={{flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10, }}>
                                    <View style={{flexDirection: 'column', width: '40%',}}>
                                        <Text style={{fontSize: 14, fontFamily: 'AvenirLTStd-Black', color: '#2C2E6D',}}>{item.departLocation}</Text>
                                        <Text style={{fontSize: 14, fontFamily: 'AvenirLTStd-Roman', color: '#2C2E6D',}}>{item.expectedDepartureDate}</Text>
                                    </View>
                                    <View style={{flexDirection: 'column', width: '20%', justifyContent: 'center',}}>
                                        <AntIcon name="swapright" size={40} color="#2C2E6D" style={{paddingLeft: 5, paddingRight: 5,}}/>
                                    </View>
                                    <View style={{flexDirection: 'column', width: '40%',}}>
                                        <Text style={{fontSize: 14, fontFamily: 'AvenirLTStd-Black', color: '#2C2E6D',}}>{item.arriveLocation}</Text>
                                        <Text style={{fontSize: 14, fontFamily: 'AvenirLTStd-Roman', color: '#2C2E6D',}}>{item.expectedArrivalDate}</Text>
                                    </View>
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
                                type={'ThreeBounce'}
                                color='#F4D549'
                                size={30}/>
                                </View> : (this.state.noMoreData) ? <View style={styles.noListContainer}>
                                    <Text style={{color: '#9B9B9B', fontSize: 14, fontFamily: 'AvenirLTStd-Roman', paddingTop: 10,}}>No More Driver Pending Order</Text> 
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