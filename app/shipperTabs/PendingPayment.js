import React, { Component } from 'react';
import { View, Text, Alert, StatusBar, isAndroid, SafeAreaView, ScrollView, } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialComIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import AntIcon from 'react-native-vector-icons/AntDesign';
import NetworkConnection from '../utils/NetworkConnection';
import DeviceInfo from 'react-native-device-info';
import MyRealm from '../utils/Realm';
import { ListItem } from 'react-native-elements';
import { styles } from '../utils/Style';
import Spinner from 'react-native-spinkit';
import OneSignal from 'react-native-onesignal';

let myApiUrl = 'http://courierlabapi.azurewebsites.net/api/v1/MobileApi';
let pendingPaymentPath = 'PendingPayment';
let deviceId = DeviceInfo.getUniqueID();
let realm = new MyRealm();
let loginAsset = realm.objects('LoginAsset');
let isPending = '';
let orderId = '';
let count = 0;

export default class PendingPayment extends Component{
    static navigationOptions = {
        // title: 'Pending Payment',
        headerTitle: <View style={{flexDirection: 'row',}}>
                <FeatherIcon name="file-text" size={19} color="#fff" style={{paddingLeft: 10, paddingRight: 10,}}/>
                <Text style={{color: '#fff', fontWeight: 'bold', fontFamily: 'AvenirLTStd-Black', fontSize: 15, paddingTop: 3,}}>Pending Payment</Text>
            </View>,
    };
    
    constructor(props){
        super(props);
        this.state = {
            pendingPaymentData: [],
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
        this._navListener = this.props.navigation.addListener('willFocus', (playload) => {
            this.getPendingPayment();
        });
    }

    componentWillUnmount() {
        this._navListener.remove();
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

    getPendingPayment(){
        this.setState({
            spinnerVisible: true,
        })
        fetch(`${myApiUrl}/${pendingPaymentPath}?deviceId=` + deviceId + `&userId=` + loginAsset[0].userId + `&shipperId=` + loginAsset[0].loginUserId, {
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
                    pendingPaymentData: json.results,
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
                            pendingPaymentData: [...this.state.pendingPaymentData, ...json.results],
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
                            <Text style={{color: '#9B9B9B', fontSize: 14, fontFamily: 'AvenirLTStd-Roman', paddingTop: 10,}}>No Pending Payment</Text> 
                          </View>;
        console.log(this.state.pendingPaymentData);
        if(this.state.pendingPaymentData !== [] && this.state.pendingPaymentData.length > 0){
            pendingView = this.state.pendingPaymentData.map((item, index) => (
                <ListItem 
                    key={index}
                    // bottomDivider={true}
                    // rightIcon={<Icon name='chevron-right' color='#3c4c96' style={{marginLeft: 3, marginRight: 20}}/>}
                    // title={ <Text style={styles.listItemText}>{item.bookingNumber}</Text> }
                    subtitle={
                        // <View style={styles.listItemView}>
                        //     <View style={{flexDirection: 'row',}}>
                        //         <Icon name={'money'} size={15} color={'#3c4c96'} style={{marginLeft: 2}}/>
                        //         <Text style={styles.listItemText}>  RM {item.totalPrice} </Text> 
                        //     </View>
                        // </View>
                        <View style={{margin: 0, padding: 20, marginBottom: -15, backgroundColor: '#EFEFEF', borderRadius: 20,}}>
                            <View style={{flexDirection: 'row', justifyContent: 'space-between', }}>
                                <Text style={{fontSize: 14, fontFamily: 'AvenirLTStd-Black', color: '#2C2E6D',}}>{item.bookingNumber}</Text>
                                <Text style={{fontSize: 14, fontFamily: 'AvenirLTStd-Roman', color: '#2C2E6D',}}>more info</Text>
                            </View>
                            <View style={{flexDirection: 'row', paddingTop: 10,}}>
                                <Text style={{fontSize: 14, fontFamily: 'AvenirLTStd-Roman', color: '#2C2E6D',}}>RM {item.totalPrice}</Text>
                            </View>
                        </View>
                    }
                    onPress={() => this.props.navigation.navigate('PendingPaymentDetail', {
                        matchedOrderId: item.matchedOrderId,
                        rerenderFunction : () => this.getPendingPayment()
                    })}
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
                                    <Text style={{color: '#9B9B9B', fontSize: 14, fontFamily: 'AvenirLTStd-Roman', paddingTop: 10,}}>No More Pending Payment</Text> 
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