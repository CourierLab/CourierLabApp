import React, { Component } from 'react';
import { View, Text, Alert, ScrollView, TouchableOpacity, Linking, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialComIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import OctiIcon from 'react-native-vector-icons/Octicons';
import NetworkConnection from '../utils/NetworkConnection';
import DeviceInfo from 'react-native-device-info';
import MyRealm from '../utils/Realm';
import { styles } from '../utils/Style';
import Spinner from 'react-native-spinkit';

let realm = new MyRealm();

export default class DriverOrderDetails extends Component{
    static navigationOptions = {
        headerTitle: <View style={{flexDirection: 'row',}}>
                <FeatherIcon name="truck" size={19} color="#fff" style={{paddingLeft: 10, paddingRight: 10,}}/>
                <Text style={{color: '#fff', fontWeight: 'bold', fontFamily: 'AvenirLTStd-Black', fontSize: 15, paddingTop: 3,}}>Pending Driver Details</Text>
            </View>,
    };
    
    constructor(props){
        super(props);
        this.state = {
            spinnerVisible: false,
            isRegister: false,
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
                    <View style={{borderBottomColor: '#9B9B9B', borderBottomWidth: 1, flexDirection: 'row', padding: 15,}}>
                        {/* <Text style={styles.columnTitleText}>Driver Name</Text>
                        <Text style={styles.columnDescriptionText}>{orderDetails.driverName}</Text> */}
                        <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                            <MaterialIcon name="person-outline" size={19} color="#9B9B9B" style={{paddingLeft: 10, paddingRight: 10,}}/>
                        </View>
                        <View style={{flexDirection: 'column', paddingRight: 20,}}>
                            <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Driver Name</Text>
                            <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{orderDetails.driverName}</Text>
                        </View>
                    </View>
                    {/* <View style={styles.columnGap}>
                    </View> */}
                    {/* <View style={styles.columnNormal}>
                        <Text style={styles.columnTitleText}>Driver Contact Number</Text>
                        <Text style={styles.columnDescriptionText}>{orderDetails.driverPhoneNumber}</Text>
                    </View> */}
                    <View style={{borderBottomColor: '#9B9B9B', borderBottomWidth: 1, flexDirection: 'row', padding: 15,}}>
                        <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                            <MaterialComIcon name="cellphone" size={19} color="#9B9B9B" style={{paddingLeft: 10, paddingRight: 10,}}/>
                        </View>
                        <View style={{flexDirection: 'column', paddingRight: 20,}}>
                            <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Driver Contact Number</Text>
                            <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{orderDetails.driverPhoneNumber}</Text>
                        </View>
                    </View>
                    {/* <View style={styles.columnGap}>
                    </View> */}
                    {/* <View style={styles.columnRowContainer}>
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
                    </View> */}
                    <View style={{borderBottomColor: '#9B9B9B', borderBottomWidth: 1, flexDirection: 'row', flexWrap: 'wrap', padding: 15,}}>
                        <View style={{width: '60%', padding: 0, flexDirection: 'row', borderRightWidth: 1, borderColor: '#DBDBDB',}}>
                            <View style={{justifyContent: 'center',}}>
                                <MaterialComIcon name="script-text-outline" size={19} color="#9B9B9B" style={{paddingLeft: 10, paddingRight: 10,}}/>
                            </View>
                            <View style={{justifyContent: 'center',}}>
                                <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Order Number</Text>
                                <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{orderDetails.orderNumber}</Text>
                            </View>
                        </View>
                        <View style={{width: '40%', padding: 0, flexDirection: 'row',}}>
                            <View style={{justifyContent: 'center',}}>
                                <OctiIcon name="note" size={19} color="#9B9B9B" style={{paddingLeft: 10, paddingRight: 10,}}/>
                            </View>
                            <View style={{paddingRight: 20, justifyContent: 'center',}}>
                                <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Description</Text>
                                <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{orderDetails.orderDescription}</Text>
                            </View>
                        </View>
                    </View>
                    {/* <View style={styles.columnGap}>
                    </View> */}
                    {/* <View style={styles.columnNormal}>
                        <Text style={styles.columnTitleText}>Lorry Type</Text>
                        <Text style={styles.columnDescriptionText}>{orderDetails.lorryTypeName}</Text>
                    </View> */}
                    <View style={{borderBottomColor: '#9B9B9B', borderBottomWidth: 1, flexDirection: 'row', padding: 15,}}>
                        <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                            <FeatherIcon name="truck" size={19} color="#9B9B9B" style={{paddingLeft: 10, paddingRight: 10,}}/>
                        </View>
                        <View style={{flexDirection: 'column', paddingRight: 20,}}>
                            <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Lorry Type</Text>
                            <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{orderDetails.lorryTypeName}</Text>
                        </View>
                    </View>
                    {/* <View style={styles.columnGap}>
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
                    </View> */}
                    {/* <View style={styles.columnGap}>
                    </View> */}
                    {/* <View style={styles.columnNormal}>
                        <Text style={styles.columnTitleText}>Lorry Plate Number</Text>
                        <Text style={styles.columnDescriptionText}>{orderDetails.lorryPlateNumber}</Text>
                    </View> */}
                    <View style={{borderBottomColor: '#9B9B9B', borderBottomWidth: 1, flexDirection: 'row', padding: 15,}}>
                        <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                            <MaterialComIcon name="numeric" size={19} color="#9B9B9B" style={{paddingLeft: 10, paddingRight: 10,}}/>
                        </View>
                        <View style={{flexDirection: 'column', paddingRight: 20,}}>
                            <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Lorry Plate Number</Text>
                            <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{orderDetails.lorryPlateNumber}</Text>
                        </View>
                    </View>
                    {/* <View style={styles.columnGap}>
                    </View> */}
                    {/* <View style={styles.columnNormal}>
                        <Text style={styles.columnTitleText}>Vehicle Spec.</Text>
                        <Text style={styles.columnDescriptionText}>{orderDetails.vehicleSpecifications}</Text>
                    </View> */}
                    <View style={{borderBottomColor: '#9B9B9B', borderBottomWidth: 1, flexDirection: 'row', padding: 15,}}>
                        <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                            <FeatherIcon name="box" size={19} color="#9B9B9B" style={{paddingLeft: 10, paddingRight: 10,}}/>
                        </View>
                        <View style={{flexDirection: 'column', paddingRight: 20,}}>
                            <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Vehicle Spec</Text>
                            <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{orderDetails.vehicleSpecifications}</Text>
                        </View>
                    </View>
                    {/* <View style={styles.columnGap}>
                    </View> */}
                    {/* <View style={styles.columnRowContainer}>
                        <View style={styles.columnAddressText}>
                            <Text style={styles.columnTitleText}>Departure Location &amp; Expected Date</Text>
                            <Text style={styles.columnDescriptionText}>{orderDetails.departLocation}</Text>
                            <Text style={styles.columnDescriptionText}>{orderDetails.expectedDepartureDate}</Text>
                        </View>
                        <View style={styles.columnAddressIcon}>
                            <Icon name={'location-arrow'} size={25} color={'#3c4c96'} style={styles.mapIcon} onPress={() => this.openGps(orderDetails.departLocation)}/>
                        </View>
                    </View> */}
                    <View style={{borderBottomColor: '#9B9B9B', borderBottomWidth: 1, flexDirection: 'row', padding: 15,}}>
                        <View style={{flexDirection: 'column', justifyContent: 'center', }}>
                            <MaterialComIcon name="map-marker-radius" size={19} color="#9B9B9B" style={{paddingLeft: 10, paddingRight: 10,}}/>
                        </View>
                        <View style={{flexDirection: 'column', width: '80%',}}>
                            <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Departure Location &#47; Expected Date</Text>
                            <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{orderDetails.departLocation} &#47; {orderDetails.expectedDepartureDate}</Text>
                        </View>
                        <View style={{flexDirection: 'column', paddingRight: 20, justifyContent: 'center', }}>
                            <Icon name={'location-arrow'} size={25} color={'#3c4c96'} style={styles.mapIcon} onPress={() => this.openGps(orderDetails.departLocation)}/>
                        </View>
                    </View>
                    {/* <View style={styles.columnGap}>
                    </View> */}
                    {/* <View style={styles.columnRowContainer}>
                        <View style={styles.columnAddressText}>
                            <Text style={styles.columnTitleText}>Arrival Location &amp; Expected Date</Text>
                            <Text style={styles.columnDescriptionText}>{orderDetails.arriveLocation}</Text>
                            <Text style={styles.columnDescriptionText}>{orderDetails.expectedArrivalDate}</Text>
                        </View>
                        <View style={styles.columnAddressIcon}>
                            <Icon name={'location-arrow'} size={25} color={'#3c4c96'} style={styles.mapIcon} onPress={() => this.openGps(orderDetails.arriveLocation)}/>
                        </View>
                    </View> */}
                    <View style={{borderBottomColor: '#9B9B9B', borderBottomWidth: 1, flexDirection: 'row', padding: 15,}}>
                        <View style={{flexDirection: 'column', justifyContent: 'center', }}>
                            <MaterialComIcon name="map-marker-check" size={19} color="#9B9B9B" style={{paddingLeft: 10, paddingRight: 10,}}/>
                        </View>
                        <View style={{flexDirection: 'column', width: '80%',}}>
                            <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Arrival Location &#47; Expected Date</Text>
                            <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{orderDetails.arriveLocation} &#47; {orderDetails.expectedArrivalDate}</Text>
                        </View>
                        <View style={{flexDirection: 'column', paddingRight: 20, justifyContent: 'center', }}>
                            <Icon name={'location-arrow'} size={25} color={'#3c4c96'} style={styles.mapIcon} onPress={() => this.openGps(orderDetails.arriveLocation)}/>
                        </View>
                    </View>
                </View>
                {/* <View style={styles.spinnerView}>
                    <Spinner
                        isVisible={this.state.spinnerVisible}
                        type={'ThreeBounce'}
                        color='#F4D549'
                        size={30}/>
                </View> */}
                <View style={this.state.isRegister ? {backgroundColor: '#F4D549', borderRadius: 20, paddingLeft: 10, paddingRight: 10, marginLeft: 10, marginRight: 10, marginBottom: 20, marginTop: 20,} : styles.pendingAcceptButton}>
                    <TouchableOpacity
                        style={this.state.isRegister ? {backgroundColor: '#F4D549', borderRadius: 20, paddingVertical: 15,} :styles.buttonContainer}
                        onPress={() => {
                            this.setState({
                                isRegister: true,
                            })
                            this.props.navigation.navigate('ShipperPendingOrder', {
                                driverOrderId: orderDetails.driverOrderId,
                                renderFunction: setTimeout(() => {
                                    this.setState({
                                        isRegister: false,
                                    })
                                }, 500)
                            })
                        }}>
                        <Text style={{color: '#fff', textAlign: 'center', fontSize: 16, fontFamily: 'AvenirLTStd-Black',}}>Select Order</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        )
    }
}