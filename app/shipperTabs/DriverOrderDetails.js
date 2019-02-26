import React, { Component } from 'react';
import { View, Text, Alert, ScrollView, TouchableOpacity, Linking, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import NetworkConnection from '../utils/NetworkConnection';
import DeviceInfo from 'react-native-device-info';
import MyRealm from '../utils/Realm';
import { styles } from '../utils/Style';
import Spinner from 'react-native-spinkit';

let realm = new MyRealm();

export default class DriverOrderDetails extends Component{
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
        return (
            <ScrollView style={styles.scrollViewContainer}>
                <View style={styles.columnViewContainer}>
                    <View style={styles.firstColumnViewContainer}>
                        <Text style={styles.columnTitleText}>Driver Name</Text>
                        <Text style={styles.columnDescriptionText}>{orderDetails.driverName}</Text>
                    </View>
                    <View style={styles.columnGap}>
                    </View>
                    <View style={styles.columnNormal}>
                        <Text style={styles.columnTitleText}>Driver Contact Number</Text>
                        <Text style={styles.columnDescriptionText}>{orderDetails.driverPhoneNumber}</Text>
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
                    <View style={styles.columnNormal}>
                        <Text style={styles.columnTitleText}>Lorry Type</Text>
                        <Text style={styles.columnDescriptionText}>{orderDetails.lorryTypeName}</Text>
                    </View>
                    <View style={styles.columnGap}>
                    </View>
                    <View style={styles.columnRowContainer}>
                        <View style={styles.columnRowContent}>
                            <Text style={styles.columnTitleText}>Lorry Length (m)</Text>
                            <Text style={styles.columnDescriptionText}>{orderDetails.lorryLength}</Text>
                        </View>
                        <View style={styles.columnRowGap}>
                        </View>
                        <View style={styles.columnRowContent}>
                            <Text style={styles.columnTitleText}>Lorry Weight (kg)</Text>
                            <Text style={styles.columnDescriptionText}>{orderDetails.lorryWeight}</Text>
                        </View>
                    </View>
                    <View style={styles.columnGap}>
                    </View>
                    <View style={styles.columnNormal}>
                        <Text style={styles.columnTitleText}>Lorry Plate Number</Text>
                        <Text style={styles.columnDescriptionText}>{orderDetails.lorryPlateNumber}</Text>
                    </View>
                    <View style={styles.columnGap}>
                    </View>
                    <View style={styles.columnNormal}>
                        <Text style={styles.columnTitleText}>Vehicle Spec.</Text>
                        <Text style={styles.columnDescriptionText}>{orderDetails.vehicleSpecifications}</Text>
                    </View>
                    <View style={styles.columnGap}>
                    </View>
                    <View style={styles.columnRowContainer}>
                        <View style={styles.columnAddressText}>
                            <Text style={styles.columnTitleText}>Departure Location &amp; Expected Date</Text>
                            <Text style={styles.columnDescriptionText}>{orderDetails.departLocation}</Text>
                            <Text style={styles.columnDescriptionText}>{orderDetails.expectedDepartureDate}</Text>
                        </View>
                        <View style={styles.columnAddressIcon}>
                            <Icon name={'location-arrow'} size={25} color={'#3c4c96'} style={styles.mapIcon} onPress={() => this.openGps(orderDetails.departLocation)}/>
                        </View>
                    </View>
                    <View style={styles.columnGap}>
                    </View>
                    <View style={styles.columnRowContainer}>
                        <View style={styles.columnAddressText}>
                            <Text style={styles.columnTitleText}>Arrival Location &amp; Expected Date</Text>
                            <Text style={styles.columnDescriptionText}>{orderDetails.arriveLocation}</Text>
                            <Text style={styles.columnDescriptionText}>{orderDetails.expectedArrivalDate}</Text>
                        </View>
                        <View style={styles.columnAddressIcon}>
                            <Icon name={'location-arrow'} size={25} color={'#3c4c96'} style={styles.mapIcon} onPress={() => this.openGps(orderDetails.arriveLocation)}/>
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
                            driverOrderId: orderDetails.driverOrderId
                        })}>
                        <Text style={styles.buttonText}>Select Order</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        )
    }
}