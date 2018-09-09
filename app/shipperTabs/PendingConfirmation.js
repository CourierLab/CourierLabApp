import React, { Component } from 'react';
import { View, Text, Alert, StatusBar, isAndroid, ScrollView, } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import NetworkConnection from '../utils/NetworkConnection';
import DeviceInfo from 'react-native-device-info';
import MyRealm from '../utils/Realm';
import { ListItem } from 'react-native-elements';
import { styles } from '../utils/Style';
import Spinner from 'react-native-spinkit';

let myApiUrl = 'http://courierlabapi.azurewebsites.net/api/v1/MobileApi';
let pendingConfirmationPath = 'PendingShipperMatchOrders';
let deviceId = DeviceInfo.getUniqueID();
let realm = new MyRealm();
let loginAsset = realm.objects('LoginAsset');

export default class PendingConfirmation extends Component{
    static navigationOptions = {
        title: 'Pending Confirmation',
    };
    
    constructor(props){
        super(props);
        this.state = {
            pendingConfirmaiton: [],
            spinnerVisible: false,
        };
    }

    componentDidMount() {
        setTimeout(() => {
            this.checkInternetConnection();
        }, 500);
        this.getPendingConfirmation();
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

    getPendingConfirmation(){
        this.setState({
            spinnerVisible: true,
        })
        fetch(`${myApiUrl}/${pendingConfirmationPath}?deviceId=` + deviceId + `&userId=` + loginAsset[0].userId, {
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
                    pendingConfirmaiton: json.results,
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
                            <Text style={styles.noListText}>No Pending Confirmation</Text> 
                          </View>;
        console.log(this.state.pendingConfirmaiton);
        if(this.state.pendingConfirmaiton !== [] && this.state.pendingConfirmaiton.length > 0){
            pendingView = this.state.pendingConfirmaiton.map((item, index) => (
                <ListItem 
                        key={index}
                        bottomDivider={true}
                        rightIcon={<Icon name='chevron-right' color='#3c4c96' style={{marginLeft: 3, marginRight: 20}}/>}
                        title={ <Text style={styles.listItemText}>{item.orderNumber}</Text> }
                        subtitle={
                            <View style={{paddingTop: 5, }}>
                                <View style={styles.iconView}>
                                    <Icon name={'user'} size={17} color={'#3c4c96'} />
                                    <Text style={styles.listItemText}>  {item.recipientName}</Text>
                                </View>
                                <View style={styles.iconView}>
                                {(item.orderDescription !== "") ? <View style={styles.iconView}>
                                    <Icon name={'info'} size={15} color={'#3c4c96'} style={{marginLeft: 3, marginRight: 6}}/>
                                    <Text style={styles.listItemText}> {item.orderDescription}</Text>    
                                    </View> : <View/>
                                }    
                                </View>
                                <View style={{flexDirection: 'row',}}>
                                    <Icon name={'map-pin'} size={15} color={'#3c4c96'} style={{marginLeft: 2}}/>
                                    <Text style={styles.listItemText}>  {item.pickUpLocation} </Text> 
                                </View>
                                <View style={{flexDirection: 'row', marginLeft: 20,}}>
                                    <Icon name={'long-arrow-right'} size={13} color={'#3c4c96'} style={{marginLeft: 2}}/>
                                    <Text style={styles.listItemText}>  {item.recipientAddress}</Text>    
                                </View>
                                <View style={styles.iconView}>
                                    <Icon name={'calendar'} size={15} color={'#3c4c96'} />
                                    <Text style={styles.listItemText}>  {item.expectedArrivalDate}</Text>
                                </View>
                            </View>
                        }
                        onPress={() => {this.props.navigation.navigate('PendingConfirmationDetail', {
                                shipperOrderId: item.shipperOrderId,
                                rerenderFunction : () => this.getPendingConfirmation()
                            })
                        }}
                    />
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