import React, { Component } from 'react';
import { View, Text, Alert, StatusBar, isAndroid, ScrollView, TouchableOpacity, Linking, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import NetworkConnection from '../utils/NetworkConnection';
import DeviceInfo from 'react-native-device-info';
import MyRealm from '../utils/Realm';
import { styles } from '../utils/Style';
import { Card } from 'react-native-elements';
import Spinner from 'react-native-spinkit';

let myApiUrl = 'http://courierlabapi.azurewebsites.net/api/v1/MobileApi';
let acceptOrderPath = 'AcceptOrder';
let deviceId = DeviceInfo.getUniqueID();
let realm = new MyRealm();
let loginAsset = realm.objects('LoginAsset');

export default class PendingOrderDetails extends Component{
    static navigationOptions = {
        title: 'Pending Order Details',
    };
    
    constructor(props){
        super(props);
        this.state = {
            spinnerVisible: false,
        };
    }

    componentDidMount() {
        setTimeout(() => {
            this.checkInternetConnection();
        }, 500);
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

    render(){
        const { navigation } = this.props;
        const orderDetails = navigation.getParam('orderDetails');
        console.log(orderDetails);
        var recipientAddress = orderDetails.recipientAddress + ' ' + orderDetails.recipientPostCode + ' ' + orderDetails.recipientState;
        return (
            <ScrollView style={styles.scrollViewContainer}>
                <View style={styles.columnViewContainer}>
                    <View style={styles.firstColumnViewContainer}>
                        <Text style={styles.columnTitleText}>Shipper Name</Text>
                        <Text style={styles.columnDescriptionText}>{orderDetails.shipperName}</Text>
                    </View>
                    <View style={styles.columnGap}>
                    </View>
                    <View style={styles.columnNormal}>
                        <Text style={styles.columnTitleText}>Shipper Contact Number</Text>
                        <Text style={styles.columnDescriptionText}>{orderDetails.shipperPhoneNumber}</Text>
                    </View>
                    <View style={styles.columnGap}>
                    </View>
                    <View style={styles.columnRowContainer}>
                        <View style={styles.columnRowContent}>
                            <Text style={styles.columnTitleText}>Order Number</Text>
                            <Text style={styles.columnDescriptionText}>{orderDetails.orderNumber}</Text>
                        </View>
                        <View style={styles.columnRowGap}>
                        </View>
                        <View style={styles.columnRowContent}>
                            <Text style={styles.columnTitleText}>Description</Text>
                            <Text style={styles.columnDescriptionText}>{orderDetails.orderDescription}</Text>
                        </View>
                    </View>
                    <View style={styles.columnGap}>
                    </View>
                    <View style={styles.columnRowContainer}>
                        <View style={styles.columnRowContent}>
                            <Text style={styles.columnTitleText}>Order Weight</Text>
                            <Text style={styles.columnDescriptionText}>{orderDetails.orderWeight}</Text>
                        </View>
                        <View style={styles.columnRowGap}>
                        </View>
                        <View style={styles.columnRowContent}>
                            <Text style={styles.columnTitleText}>Vehicle Spec.</Text>
                            <Text style={styles.columnDescriptionText}>{orderDetails.vehicleSpecifications}</Text>
                        </View>
                    </View>
                    <View style={styles.columnGap}>
                    </View>
                    <View style={styles.columnRowContainer}>
                        <View style={styles.columnAddressText}>
                            <Text style={styles.columnTitleText}>Pick Up Location</Text>
                            <Text style={styles.columnDescriptionText}>{orderDetails.pickupLocation}</Text>
                        </View>
                        <View style={styles.columnAddressIcon}>
                            <Icon name={'location-arrow'} size={25} color={'#3c4c96'} style={styles.mapIcon} onPress={() => this.openGps(orderDetails.pickupLocation)}/>
                        </View>
                    </View>
                    <View style={styles.columnGap}>
                    </View>
                    <View style={styles.columnNormal}>
                        <Text style={styles.columnTitleText}>Pick Up Date</Text>
                        <Text style={styles.columnDescriptionText}>{orderDetails.pickUpDate}</Text>
                    </View>
                    <View style={styles.columnGap}>
                    </View>
                    <View style={styles.columnNormal}>
                        <Text style={styles.columnTitleText}>Expected Arrival Date</Text>
                        <Text style={styles.columnDescriptionText}>{orderDetails.expectedArrivalDate}</Text>
                    </View>
                    <View style={styles.columnGap}>
                    </View>
                    <View style={styles.columnNormal}>
                        <Text style={styles.columnTitleText}>Recipient Name</Text>
                        <Text style={styles.columnDescriptionText}>{orderDetails.recipientName}</Text>
                    </View>
                    <View style={styles.columnGap}>
                    </View>
                    <View style={styles.columnNormal}>
                        <Text style={styles.columnTitleText}>Recipient Contact Number</Text>
                        <Text style={styles.columnDescriptionText}>{orderDetails.recipientPhoneNumber}</Text>
                    </View>
                    <View style={styles.columnGap}>
                    </View>
                    <View style={styles.columnNormal}>
                        <Text style={styles.columnTitleText}>Recipient Email</Text>
                        <Text style={styles.columnDescriptionText}>{orderDetails.recipientEmailAddress}</Text>
                    </View>
                    <View style={styles.columnGap}>
                    </View>
                    <View style={styles.columnRowContainer}>
                        <View style={styles.columnAddressText}>
                            <Text style={styles.columnTitleText}>Recipient Address</Text>
                            <Text style={styles.columnDescriptionText}>{orderDetails.recipientAddress}</Text>   
                        </View>
                        <View style={styles.columnAddressIcon}>
                            <Icon name={'location-arrow'} size={25} color={'#3c4c96'} style={styles.mapIcon} onPress={() => this.openGps(orderDetails.recipientAddress)}/>
                        </View>
                    </View>
                    <View style={styles.columnGap}>
                    </View>
                    <View style={styles.columnRowContainer}>
                        <View style={styles.columnRowContent}>
                            <Text style={styles.columnTitleText}>State</Text>
                            <Text style={styles.columnDescriptionText}>{orderDetails.recipientState}</Text>
                        </View>
                        <View style={styles.columnRowGap}>
                        </View>
                        <View style={styles.columnRowContent}>
                            <Text style={styles.columnTitleText}>Postcode</Text>
                            <Text style={styles.columnDescriptionText}>{orderDetails.recipientPostCode}</Text>
                        </View>
                    </View>
                </View>
                <View style={styles.spinnerView}>
                    <Spinner
                        isVisible={this.state.spinnerVisible}
                        type={'9CubeGrid'}
                        color='#3c4c96'
                        paddingLeft={20}
                        size={50}/>
                </View>
                <View style={styles.pendingAcceptButton}>
                    <TouchableOpacity
                        style={styles.buttonContainer}
                        onPress={() => this.props.navigation.navigate('AddOrder', {
                            shipperOrderId: orderDetails.shipperOrderId
                        })}>
                        <Text style={styles.buttonText}>Select Order</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        )
    }
}