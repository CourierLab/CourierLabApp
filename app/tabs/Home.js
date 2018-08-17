import React, { Component } from 'react';
import { View, Text, Alert, StatusBar, isAndroid, SafeAreaView, ScrollView, } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import NetworkConnection from '../utils/NetworkConnection';
import DeviceInfo from 'react-native-device-info';
import MyRealm from '../utils/Realm';
import { ListItem } from 'react-native-elements';
import { styles } from '../utils/Style';
import PendingOrderDetails from './PendingOrderDetails';
import Spinner from 'react-native-spinkit';

let myApiUrl = 'http://courierlabapi.azurewebsites.net/api/v1/MobileApi';
let pendingOrderPath = 'ViewPendingShipper';
let deviceId = DeviceInfo.getUniqueID();
let realm = new MyRealm();
let loginAsset = realm.objects('LoginAsset');

export default class Home extends Component{
    static navigationOptions = {
        title: 'Pending Shipper Order',
    };
    
    constructor(props){
        super(props);
        this.state = {
            pendingOrderData: [],
            spinnerVisible: false,
        };
    }

    componentDidMount() {
        setTimeout(() => {
            this.checkInternetConnection();
        }, 500);
        console.log(deviceId);
        console.log(loginAsset[0]);
        this._navListener = this.props.navigation.addListener('didFocus', (playload) => {
            StatusBar.setBarStyle('light-content');
            isAndroid && StatusBar.setBackgroundColor('#3c4c96');
            this.getPendingOrder();
            console.log('payload: ', playload);
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
        var pendingView = <View style={styles.noListContainer}>
                            <Text style={styles.noListText}>No Pending Order</Text> 
                          </View>;
        console.log(this.state.pendingOrderData);
        if(this.state.pendingOrderData !== [] && this.state.pendingOrderData.length > 0){
            pendingView = this.state.pendingOrderData.map((item, index) => (
                <ListItem 
                    key={index}
                    bottomDivider={true}
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
            <ScrollView style={styles.listViewContainer}>
                <StatusBar
                barStyle="light-content"
                backgroundColor="#3c4c96"/>
                {
                    (!this.state.spinnerVisible) ? <View style={styles.homeView}>
                        {pendingView}
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