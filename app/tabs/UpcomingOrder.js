import React, { Component } from 'react';
import { View, Text, Alert, StatusBar, isAndroid, SafeAreaView, ScrollView, } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import NetworkConnection from '../utils/NetworkConnection';
import DeviceInfo from 'react-native-device-info';
import MyRealm from '../utils/Realm';
import { ListItem, Card, } from 'react-native-elements';
import { styles } from '../utils/Style';
import Spinner from 'react-native-spinkit';

let myApiUrl = 'http://courierlabapi.azurewebsites.net/api/v1/MobileApi';
let upcomingOrderPath = 'ViewUpcomingOrder';
let deviceId = DeviceInfo.getUniqueID();
let realm = new MyRealm();
let loginAsset = realm.objects('LoginAsset');
let count = 0;

export default class UpcomingOrder extends Component{
    static navigationOptions = {
        title: 'Upcoming Order',
    };
    
    constructor(props){
        super(props);
        this.state = {
            upcomingOrderData: [],
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
        this.getUpcomingOrder()
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

    getUpcomingOrder(){
        this.setState({
            spinnerVisible: true,
        })
        fetch(`${myApiUrl}/${upcomingOrderPath}?deviceId=` + deviceId + `&userId=` + loginAsset[0].userId + `&driverId=` + loginAsset[0].loginUserId, {
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
                    upcomingOrderData: json.results,
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
                            upcomingOrderData: [...this.state.upcomingOrderData, ...json.results],
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
        var upcomingView = <View style={styles.noListContainer}>
                            <Text style={styles.noListText}>No Upcoming Order</Text> 
                          </View>;
        if(this.state.upcomingOrderData !== [] && this.state.upcomingOrderData.length > 0){
            upcomingView = this.state.upcomingOrderData.map((item, index) => (
                <ListItem 
                    key={index}
                    rightIcon={<Icon name='chevron-right' color='#3c4c96' style={{marginLeft: 3, marginRight: 20}}/>}
                    title={ <Text style={styles.listItemText}>{item.shipperName}</Text> }
                    subtitle={
                        <View style={styles.listItemView}>
                            {(item.orderDescription !== "") ? <View style={styles.iconView}>
                                    <Icon name={'info'} size={15} color={'#3c4c96'} style={{marginLeft: 3, marginRight: 6}}/>
                                    <Text style={styles.listItemText}> {item.orderDescription}</Text>    
                                </View> : <View/>
                            }
                            <View style={styles.iconView}>
                                <Icon name={'map-pin'} size={14} color={'#3c4c96'} style={{marginLeft: 2, marginRight: 6}}/>
                                <Text style={{fontSize: 15, fontFamily: 'Raleway-Regular',}}> {item.pickupLocation}</Text>    
                            </View>
                            <View style={styles.iconView}>
                                <Icon name={'calendar'} size={15} color={'#3c4c96'} style={{marginLeft: 0, marginRight: 3}}/>
                                <Text style={styles.listItemText}> {item.pickUpDate}</Text>   
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
                backgroundColor="#3c4c96"/>
                {
                    (!this.state.spinnerVisible) ? <View style={styles.homeView}>
                        {upcomingView}
                        {(this.state.isScrollSpinner) ? <View style={{marginBottom: 20, marginTop: 20, alignItems: 'center',}}>
                            <Spinner
                                isVisible={this.state.isScrollSpinner}
                                type={'9CubeGrid'}
                                color='#3c4c96'
                                paddingLeft={20}
                                size={50}/>
                                </View> : (this.state.noMoreData) ? <View style={styles.noListContainer}>
                                    <Text style={styles.noListText}>No More Upcoming Order</Text> 
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