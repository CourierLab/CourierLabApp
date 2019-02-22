import React, { Component } from 'react';
import { View, Text, Alert, StatusBar, TouchableOpacity, ScrollView, } from 'react-native';
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

    render(){
        var upcomingView = <View style={styles.noListContainer}>
                            <Text style={styles.noListText}>No Upcoming Order</Text> 
                          </View>;
        if(this.state.upcomingOrderData !== [] && this.state.upcomingOrderData.length > 0){
            upcomingView = this.state.upcomingOrderData.map((item, index) => (
                <View style={styles.listItemView} key={index}>
                {
                    (item.upcomingOrder.map((i, k) => (
                        <TouchableOpacity key={k} onPress={() => {
                            this.props.navigation.navigate('ConfirmedOrderDetail', {
                                driverOrderId: i.driverOrderId,
                            })
                        }}>
                            <Card title={i.bookingNumber}>
                                <View style={{flexDirection: 'column',}}>
                                    <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Depart Location: </Text>
                                    <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{i.departLocation}</Text>
                                </View>
                                <View style={{flexDirection: 'column',}}>
                                    <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Arrive Location: </Text>
                                    <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{i.arriveLocation}</Text>
                                </View>
                                <View style={{flexDirection: 'column',}}>
                                    <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Pick Up Location: </Text>
                                    <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{i.pickUpLocation}</Text>
                                </View>
                                <View style={{flexDirection: 'column',}}>
                                    <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Recipient Address: </Text>
                                    <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{i.recipientAddress}</Text>
                                </View>
                                <View style={{flexDirection: 'column',}}>
                                    <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Pick Up Date: </Text>
                                    <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{i.pickUpDate}</Text>
                                </View>
                                <View style={{flexDirection: 'column',}}>
                                    <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 14,}}>Expected Arrival Date: </Text>
                                    <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 18,}}>{i.expectedArrivalDate}</Text>
                                </View>
                            </Card>
                        </TouchableOpacity>
                        ))
                    )
                    }
                </View>
                ));
        }
        return (
            <ScrollView style={styles.listViewContainer}>
                <StatusBar
                barStyle="light-content"
                backgroundColor="#3c4c96"/>
                {
                    (!this.state.spinnerVisible) ? <View style={styles.homeView}>
                        {upcomingView}
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