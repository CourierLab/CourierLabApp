import React, { Component } from 'react';
import { View, Text, Alert, StatusBar, isAndroid, ScrollView, TouchableOpacity, Linking, Platform, Dimensions, } from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialComIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import AntIcon from 'react-native-vector-icons/AntDesign';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import SimIcon from 'react-native-vector-icons/SimpleLineIcons';
import Icon from 'react-native-vector-icons/FontAwesome';
import OctiIcon from 'react-native-vector-icons/Octicons';
import NetworkConnection from '../utils/NetworkConnection';
import DeviceInfo from 'react-native-device-info';
import MyRealm from '../utils/Realm';
import { styles } from '../utils/Style';
import Spinner from 'react-native-spinkit';
import { ListItem, Card, Avatar, } from 'react-native-elements';

let myApiUrl = 'http://courierlabapi.azurewebsites.net/api/v1/MobileApi';
let orderPendingPath = 'ViewPendingDriver';
let deleteOrderPath = 'DeleteShipperOrder';
let deviceId = DeviceInfo.getUniqueID();
let realm = new MyRealm();
let loginAsset = realm.objects('LoginAsset');
let count = 0;
let {height, width} = Dimensions.get('window');
let _this = this;

export default class HistoryOrderDetails extends Component{
    static navigationOptions = {
        // title: 'Order Details',
        headerTitle: <View style={{flexDirection: 'row',}}>
                <FeatherIcon name="shopping-cart" size={19} color="#fff" style={{paddingLeft: 10, paddingRight: 10,}}/>
                <Text style={{color: '#fff', fontWeight: 'bold', fontFamily: 'AvenirLTStd-Black', fontSize: 15, paddingTop: 3,}}>Order Details</Text>
            </View>,
        headerRight: (
            <MaterialComIcon onPress={() => _this.props.navigation.navigate('EditOrder', { shipperOrderId: _this.props.navigation.getParam('shipperOrderId'), rerenderFunction : () => _this.getOrderPendingList() })} name={'pencil-outline'} size={25} color={'#fff'} style={{paddingRight: 20,}}/>
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
            isSubmit: false,
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
        this.setState({
            isSubmit: true,
        })
        Alert.alert(
            'Delete Driver Order',
            'Are you sure you want to delete this driver order?',
            [
              {text: 'Cancel', onPress: () => {
                this.setState({
                    isSubmit: false,
                })
              }},
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
                            onPress: () => {
                                this.setState({
                                    spinnerVisible: false,
                                    isSubmit: false,
                                }) 
                            }
                        }], {cancelable: false})
                    }
                }).catch(err => {
                    console.log(err);
                    this.setState({
                        spinnerVisible: false,
                        isSubmit: false,
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
                            <Text style={{color: '#9B9B9B', fontFamily: 'AvenirLTStd-Roman', fontSize: 14,}}>No Pending Order</Text> 
                          </View>;
        if(this.state.pendingDriverOrderList !== [] && this.state.pendingDriverOrderList.length > 0){
            pendingView = this.state.pendingDriverOrderList.map((item, index) => (
                <ListItem 
                    key={index}
                    // bottomDivider={true}
                    // rightIcon={<Icon name='chevron-right' color='#3c4c96' style={{marginLeft: 3, marginRight: 20}}/>}
                    // title={ <Text style={styles.listItemText}>{item.orderNumber}</Text> }
                    subtitle={
                        // <View style={styles.listItemView}>
                        //     {(item.orderDescription !== "") ? <View style={styles.iconView}>
                        //             <Icon name={'info'} size={15} color={'#3c4c96'} style={{marginLeft: 3, marginRight: 6}}/>
                        //             <Text style={styles.listItemText}> {item.orderDescription}</Text>    
                        //         </View> : <View/>
                        //     }
                        //     <View style={{flexDirection: 'row',}}>
                        //         <Icon name={'map-pin'} size={15} color={'#3c4c96'} style={{marginLeft: 2}}/>
                        //         <Text style={styles.listItemText}>  {item.departLocation} </Text> 
                        //     </View>
                        //     <View style={{flexDirection: 'row', marginLeft: 20,}}>
                        //         <Icon name={'long-arrow-right'} size={13} color={'#3c4c96'} style={{marginLeft: 2}}/>
                        //         <Text style={styles.listItemText}>  {item.arriveLocation}</Text>    
                        //     </View>
                        //     <View style={styles.iconView}>
                        //         <Icon name={'calendar'} size={15} color={'#3c4c96'} style={{marginLeft: 0, marginRight: 3}}/>
                        //         <Text style={styles.listItemText}> {item.expectedDepartureDate}</Text>   
                        //     </View>
                        //     <View style={{flexDirection: 'row', marginLeft: 20,}}>
                        //         <Icon name={'long-arrow-right'} size={13} color={'#3c4c96'} style={{marginLeft: 2}}/>
                        //         <Text style={styles.listItemText}>  {item.expectedArrivalDate}</Text>    
                        //     </View>
                        // </View>
                        <View style={{margin: 0, padding: 20, marginBottom: -10, backgroundColor: '#EFEFEF', borderRadius: 20,}}>
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
                                type={'ThreeBounce'}
                                color='#F4D549'
                                size={30}/>
                        </View> : <View/>
                }
                {(this.state.orderSummary !== undefined && !this.state.spinnerVisible) ? <View> 
                    <Card title={'Shipper Status'} titleStyle={{fontFamily: 'AvenirLTStd-Black', fontSize: 16, color: '#2C2E6D',}} containerStyle={{margin: 15, borderRadius: 20, shadowOpacity: 1, backgroundColor: '#EFEFEF', shadowColor: '#e0e0e0', shadowRadius: 3, shadowOffset: {width: 1, height: 1,},}}>
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
                                <OctiIcon name="note" size={19} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                            </View>
                            <View style={{flexDirection: 'column', paddingRight: 20,}}>
                                <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Order Description</Text>
                                <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{this.state.orderSummary.orderDescription}</Text>
                            </View>
                        </View>
                        <View style={{flexDirection: 'row', paddingBottom: 10, paddingRight: 10,}}>
                            <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                                <MaterialComIcon name="weight-kilogram" size={19} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                            </View>
                            <View style={{flexDirection: 'column', paddingRight: 20,}}>
                                <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Order Weight (kg)</Text>
                                <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{this.state.orderSummary.orderWeight}</Text>
                            </View>
                        </View>
                        <View style={{flexDirection: 'row', paddingBottom: 10, paddingRight: 10,}}>
                            <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                                <FeatherIcon name="tag" size={19} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                            </View>
                            <View style={{flexDirection: 'column', paddingRight: 20,}}>
                                <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Estimated Price (RM)</Text>
                                <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{this.state.orderSummary.price}</Text>
                            </View>
                        </View>
                        <View style={{flexDirection: 'row', paddingBottom: 10, paddingRight: 10,}}>
                            <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                                <MaterialComIcon name="map-marker-distance" size={19} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                            </View>
                            <View style={{flexDirection: 'column', paddingRight: 20,}}>
                                <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Delivery Distance (km)</Text>
                                <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{this.state.orderSummary.shipperDeliveryDistance}</Text>
                            </View>
                        </View>
                        <View style={{flexDirection: 'row', paddingBottom: 10, paddingRight: 10,}}>
                            <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                                <FeatherIcon name="box" size={19} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                            </View>
                            <View style={{flexDirection: 'column', paddingRight: 20,}}>
                                <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Vehicle Specification</Text>
                                <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{this.state.orderSummary.vehicleSpecifications}</Text>
                            </View>
                        </View>
                        <View style={{flexDirection: 'row', paddingBottom: 10, paddingRight: 10,}}>
                            <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                                <MaterialComIcon name="map-marker-radius" size={19} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                            </View>
                            <View style={{flexDirection: 'column', paddingRight: 20,}}>
                                <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Pick Up Location &#47; Pick Up Date</Text>
                                <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{this.state.orderSummary.pickupLocation} &#47; {this.state.orderSummary.pickUpDate}</Text>
                            </View>
                        </View>
                        <View style={{flexDirection: 'row', paddingBottom: 10, paddingRight: 10,}}>
                            <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                                <MaterialComIcon name="map-marker-check" size={19} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                            </View>
                            <View style={{flexDirection: 'column', paddingRight: 20,}}>
                                <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Expected Arrival Date</Text>
                                <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{this.state.orderSummary.expectedArrivalDate}</Text>
                            </View>
                        </View>
                        <View style={{flexDirection: 'row', paddingBottom: 10, paddingRight: 10,}}>
                            <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                                <MaterialIcon name="person-outline" size={19} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                            </View>
                            <View style={{flexDirection: 'column', paddingRight: 20,}}>
                                <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Recipient Name</Text>
                                <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{this.state.orderSummary.recipientName}</Text>
                            </View>
                        </View>
                        <View style={{flexDirection: 'row', paddingBottom: 10, paddingRight: 10,}}>
                            <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                                <MaterialComIcon name="cellphone" size={19} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                            </View>
                            <View style={{flexDirection: 'column', paddingRight: 20,}}>
                                <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Recipient Contact Number</Text>
                                <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{this.state.orderSummary.recipientPhoneNumber}</Text>
                            </View>
                        </View>
                        <View style={{flexDirection: 'row', paddingBottom: 10, paddingRight: 10,}}>
                            <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                                <SimIcon name="envelope" size={19} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                            </View>
                            <View style={{flexDirection: 'column', paddingRight: 20,}}>
                                <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Recipient Email</Text>
                                <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{this.state.orderSummary.recipientEmailAddress}</Text>
                            </View>
                        </View>
                        <View style={{flexDirection: 'row', paddingBottom: 10, paddingRight: 10,}}>
                            <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                                <Icon name="address-card-o" size={17} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                            </View>
                            <View style={{flexDirection: 'column', paddingRight: 20,}}>
                                <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Recipient Address</Text>
                                <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{this.state.orderSummary.recipientAddress}</Text>
                            </View>
                        </View>
                        <View style={{flexDirection: 'row',}}>
                            <Icon name="image" size={17} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                            <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Order Images</Text>
                        </View>
                        <View style={{flexDirection: 'row', paddingLeft: 20, paddingRight: 10,}}>
                            {
                                (this.state.orderSummary.shipperOrderImage !== '' && this.state.orderSummary.shipperOrderImage !== null) ? <View style={{flexDirection: 'row', paddingBottom: 10, paddingTop: 0, paddingLeft: 0, paddingRight: 0, justifyContent: 'flex-start', }}>
                                    <Avatar
                                        size={width-180}
                                        source={{uri: this.state.orderSummary.shipperOrderImage}}
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
                                (this.state.orderSummary.shipperOrderImage2 !== '' && this.state.orderSummary.shipperOrderImage2 !== null) ? <View style={{flexDirection: 'row', paddingBottom: 10, paddingTop: 0, paddingLeft: 0, paddingRight: 0, justifyContent: 'flex-start', }}>
                                    <Avatar
                                        size={width-180}
                                        source={{uri: this.state.orderSummary.shipperOrderImage2}}
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
                                (this.state.orderSummary.shipperOrderImage3 !== '' && this.state.orderSummary.shipperOrderImage3 !== null) ? <View style={{flexDirection: 'row', paddingBottom: 10, paddingTop: 0, paddingLeft: 0, paddingRight: 0, justifyContent: 'flex-start', }}>
                                    <Avatar
                                        size={width-180}
                                        source={{uri: this.state.orderSummary.shipperOrderImage3}}
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
                                    (this.state.orderSummary.shipperOrderImage !== '') ? <View style={{flexDirection: 'row', paddingBottom: 0, paddingTop: 0, paddingLeft: 0, paddingRight: 0, justifyContent: 'flex-start', }}>
                                        <Avatar
                                            size={width-100}
                                            source={{uri: this.state.orderSummary.shipperOrderImage}}
                                            onPress={() => console.log("Works!")}
                                            activeOpacity={0.7}
                                            avatarStyle={{borderRadius: 20,}}
                                            overlayContainerStyle={{borderRadius: 20,}}
                                        />
                                    </View> : <View />
                                }
                            </View>
                        </View> */}
                        {/* <View style={{paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0, flexDirection: 'column', borderBottomColor:'#fff', borderBottomWidth: 1, backgroundColor: '#EFEFEF',}}>
                            <View style={{flexDirection: 'column',}}>
                                <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Order Number: </Text>
                                <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{this.state.orderSummary.orderNumber}</Text>
                            </View>
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
                            <View style={{flexDirection: 'column',}}>
                                <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Order Image: </Text>
                                {
                                    (this.state.orderSummary.shipperOrderImage !== '') ? <View style={{flexDirection: 'row', paddingBottom: 10, paddingTop: 0, paddingLeft: 5, paddingRight: 5, justifyContent: 'flex-start', }}>
                                        <Avatar
                                            size={width-100}
                                            source={{uri: this.state.orderSummary.shipperOrderImage}}
                                            onPress={() => console.log("Works!")}
                                            activeOpacity={0.7}
                                        />
                                    </View> : <View />
                                }
                            </View>
                        </View> */}
                    </Card> 
                    {/* <View style={{backgroundColor: '#3c4c96', paddingLeft: 10, paddingRight: 10, marginLeft: 20, marginRight: 20, marginBottom: 20, marginTop: 20,}}>
                        <TouchableOpacity
                            style={styles.buttonContainer}
                            onPress={() => this.deleteOrder()}>
                            <Text style={styles.buttonText}>Delete Order</Text>
                        </TouchableOpacity>
                    </View> */}
                    {
                        this.state.isSubmit ? <View style={{alignItems: 'center', paddingBottom: 0, marginTop: 10,}}> 
                            <Spinner
                                isVisible={this.state.isSubmit}
                                type={'ThreeBounce'}
                                color='#F4D549'
                                size={30}/>
                        </View> : <View/>
                    }
                    <View style={this.state.isSubmit ? {backgroundColor: '#F4D549', borderRadius: 20, paddingLeft: 10, paddingRight: 10, marginLeft: 10, marginRight: 10, marginBottom: 20, marginTop: 20,} : {backgroundColor: '#2C2E6D', borderRadius: 20, paddingLeft: 10, paddingRight: 10, marginLeft: 10, marginRight: 10, marginBottom: 20, marginTop: 20,}}>
                        <TouchableOpacity
                            disabled={this.state.isSubmit}
                            style={this.state.isSubmit ? {backgroundColor: '#F4D549', borderRadius: 20, paddingVertical: 15,} : styles.buttonContainer}
                            onPress={(e) => this.deleteOrder()}>
                            <Text style={this.state.isSubmit ? {color: '#2C2E6D', textAlign: 'center', fontSize: 16, fontFamily: 'AvenirLTStd-Black',} : {color: '#fff', textAlign: 'center', fontSize: 16, fontFamily: 'AvenirLTStd-Black',}}>Delete Order</Text>
                        </TouchableOpacity>
                    </View>
                </View>: <View />}
                {(this.state.pendingDriverOrderList !== undefined && !this.state.spinnerVisible) ? <View>
                        <View style={{paddingTop: 10, paddingBottom: 10, paddingLeft: 10, paddingRight: 10, flexDirection: 'row', borderBottomColor:'#e0e0e0', borderBottomWidth: 1, backgroundColor: '#e0e0e0',}}>
                            <Text style={{fontSize: 15, paddingLeft: 10, fontFamily: 'AvenirLTStd-Roman', color: '#2C2E6D',}}>Pending Driver Orders</Text>
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
                                        <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Roman',}}>No More Driver Order</Text> 
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