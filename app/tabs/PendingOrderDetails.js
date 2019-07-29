import React, { Component } from 'react';
import { View, Text, Alert, StatusBar, Dimensions, ScrollView, TouchableOpacity, Linking, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialComIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import OctiIcon from 'react-native-vector-icons/Octicons';
import SimIcon from 'react-native-vector-icons/SimpleLineIcons';
import NetworkConnection from '../utils/NetworkConnection';
import DeviceInfo from 'react-native-device-info';
import MyRealm from '../utils/Realm';
import { styles } from '../utils/Style';
import { Avatar } from 'react-native-elements';
import Spinner from 'react-native-spinkit';

let myApiUrl = 'http://courierlabapi.azurewebsites.net/api/v1/MobileApi';
let acceptOrderPath = 'AcceptOrder';
let deviceId = DeviceInfo.getUniqueID();
let realm = new MyRealm();
let loginAsset = realm.objects('LoginAsset');
let {height, width} = Dimensions.get('window');

export default class PendingOrderDetails extends Component{
    static navigationOptions = {
        // title: 'Pending Order Details',
        headerTitle: <View style={{flexDirection: 'row',}}>
                <FeatherIcon name="shopping-cart" size={19} color="#fff" style={{paddingLeft: 10, paddingRight: 10,}}/>
                <Text style={{color: '#fff', fontWeight: 'bold', fontFamily: 'AvenirLTStd-Black', fontSize: 15, paddingTop: 3,}}>Pending Order Details</Text>
            </View>,
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
                    <View style={{borderBottomColor: '#9B9B9B', borderBottomWidth: 1, flexDirection: 'row', padding: 15,}}>
                        <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                            <MaterialIcon name="person-outline" size={19} color="#9B9B9B" style={{paddingLeft: 10, paddingRight: 10,}}/>
                        </View>
                        <View style={{flexDirection: 'column', paddingRight: 20,}}>
                            <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Shipper Name</Text>
                            <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{orderDetails.shipperName}</Text>
                        </View>
                    </View>
                    <View style={{borderBottomColor: '#9B9B9B', borderBottomWidth: 1, flexDirection: 'row', padding: 15,}}>
                        <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                            <MaterialComIcon name="cellphone" size={19} color="#9B9B9B" style={{paddingLeft: 10, paddingRight: 10,}}/>
                        </View>
                        <View style={{flexDirection: 'column', paddingRight: 20,}}>
                            <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Shipper Contact Number</Text>
                            <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{orderDetails.shipperPhoneNumber}</Text>
                        </View>
                    </View>
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
                    <View style={{borderBottomColor: '#9B9B9B', borderBottomWidth: 1, flexDirection: 'row', flexWrap: 'wrap', padding: 15,}}>
                        <View style={{width: '50%', padding: 0, flexDirection: 'row', borderRightWidth: 1, borderColor: '#DBDBDB',}}>
                            <View style={{justifyContent: 'center',}}>
                                <MaterialComIcon name="weight-kilogram" size={19} color="#9B9B9B" style={{paddingLeft: 10, paddingRight: 10,}}/>
                            </View>
                            <View style={{justifyContent: 'center',}}>
                                <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Order Weight</Text>
                                <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{orderDetails.orderWeight}</Text>
                            </View>
                        </View>
                        <View style={{width: '50%', padding: 0, flexDirection: 'row',}}>
                            <View style={{justifyContent: 'center',}}>
                                <FeatherIcon name="box" size={19} color="#9B9B9B" style={{paddingLeft: 10, paddingRight: 10,}}/>
                            </View>
                            <View style={{paddingRight: 20, justifyContent: 'center',}}>
                                <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Vehicle Spec</Text>
                                <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{orderDetails.vehicleSpecifications}</Text>
                            </View>
                        </View>
                    </View>
                    <View style={{borderBottomColor: '#9B9B9B', borderBottomWidth: 1, flexDirection: 'row', padding: 15,}}>
                        <View style={{flexDirection: 'column', justifyContent: 'center', }}>
                            <MaterialComIcon name="map-marker-radius" size={19} color="#9B9B9B" style={{paddingLeft: 10, paddingRight: 10,}}/>
                        </View>
                        <View style={{flexDirection: 'column', width: '80%',}}>
                            <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Pick Up Location &#47; Pick Up Date</Text>
                            <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{orderDetails.pickupLocation} &#47; {orderDetails.pickUpDate}</Text>
                        </View>
                        <View style={{flexDirection: 'column', paddingRight: 20, justifyContent: 'center', }}>
                            <Icon name={'location-arrow'} size={25} color={'#3c4c96'} style={styles.mapIcon} onPress={() => this.openGps(orderDetails.pickupLocation)}/>
                        </View>
                    </View>
                    <View style={{borderBottomColor: '#9B9B9B', borderBottomWidth: 1, flexDirection: 'row', padding: 15,}}>
                        <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                            <MaterialIcon name="person-outline" size={19} color="#9B9B9B" style={{paddingLeft: 10, paddingRight: 10,}}/>
                        </View>
                        <View style={{flexDirection: 'column', paddingRight: 20,}}>
                            <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Recipient Name</Text>
                            <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{orderDetails.recipientName}</Text>
                        </View>
                    </View>
                    <View style={{borderBottomColor: '#9B9B9B', borderBottomWidth: 1, flexDirection: 'row', padding: 15,}}>
                        <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                            <MaterialComIcon name="cellphone" size={19} color="#9B9B9B" style={{paddingLeft: 10, paddingRight: 10,}}/>
                        </View>
                        <View style={{flexDirection: 'column', paddingRight: 20,}}>
                            <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Recipient Contact Number</Text>
                            <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{orderDetails.recipientPhoneNumber}</Text>
                        </View>
                    </View>
                    <View style={{borderBottomColor: '#9B9B9B', borderBottomWidth: 1, flexDirection: 'row', padding: 15,}}>
                        <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                            <SimIcon name="envelope" size={19} color="#9B9B9B" style={{paddingLeft: 10, paddingRight: 10,}}/>
                        </View>
                        <View style={{flexDirection: 'column', paddingRight: 20,}}>
                            <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Recipient Email</Text>
                            <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{orderDetails.recipientEmailAddress}</Text>
                        </View>
                    </View>
                    <View style={{borderBottomColor: '#9B9B9B', borderBottomWidth: 1, flexDirection: 'row', padding: 15,}}>
                        <View style={{flexDirection: 'column', justifyContent: 'center', }}>
                            <Icon name="address-card-o" size={17} color="#9B9B9B" style={{paddingLeft: 10, paddingRight: 10,}}/>
                        </View>
                        <View style={{flexDirection: 'column', width: '80%',}}>
                            <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Recipient Address &#47; Expected Arrival Date</Text>
                            <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{orderDetails.recipientAddress} &#47; {orderDetails.expectedArrivalDate}</Text>
                        </View>
                        <View style={{flexDirection: 'column', paddingRight: 20, justifyContent: 'center', }}>
                            <Icon name={'location-arrow'} size={25} color={'#3c4c96'} style={styles.mapIcon} onPress={() => this.openGps(orderDetails.recipientAddress)}/>
                        </View>
                    </View>
                    <View style={{flexDirection: 'row', paddingTop: 15, paddingBottom: 0, paddingLeft: 15, paddingRight: 15,}}>
                        <Icon name="image" size={17} color="#9B9B9B" style={{paddingLeft: 10, paddingRight: 10,}}/>
                        <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Order Image</Text>
                    </View>
                    <View style={{borderBottomColor: '#9B9B9B', borderBottomWidth: 1, flexDirection: 'row', paddingTop: 0, paddingBottom: 0, paddingLeft: 15, paddingRight: 15,}}>
                        <View style={{paddingRight: 20,}}>
                            {
                                (orderDetails.shipperOrderImage !== '' && orderDetails.shipperOrderImage !== null) ? <View style={{flexDirection: 'row', paddingBottom: 10, paddingTop: 0, paddingLeft: 30, paddingRight: 0, justifyContent: 'flex-start', }}>
                                    <Avatar
                                        size={width-180}
                                        source={{uri: orderDetails.shipperOrderImage}}
                                        activeOpacity={0.7}
                                        avatarStyle={{borderRadius: 20,}}
                                        overlayContainerStyle={{borderRadius: 20,}}
                                    />
                                </View> : <View />
                            }
                            {
                                (orderDetails.shipperOrderImage2 !== '' && orderDetails.shipperOrderImage2 !== null) ? <View style={{flexDirection: 'row', paddingBottom: 10, paddingTop: 0, paddingLeft: 30, paddingRight: 0, justifyContent: 'flex-start', }}>
                                    <Avatar
                                        size={width-180}
                                        source={{uri: orderDetails.shipperOrderImage2}}
                                        activeOpacity={0.7}
                                        avatarStyle={{borderRadius: 20,}}
                                        overlayContainerStyle={{borderRadius: 20,}}
                                    />
                                </View> : <View />
                            }
                            {
                                (orderDetails.shipperOrderImage3 !== '' && orderDetails.shipperOrderImage3 !== null) ? <View style={{flexDirection: 'row', paddingBottom: 10, paddingTop: 0, paddingLeft: 30, paddingRight: 0, justifyContent: 'flex-start', }}>
                                    <Avatar
                                        size={width-180}
                                        source={{uri: orderDetails.shipperOrderImage3}}
                                        activeOpacity={0.7}
                                        avatarStyle={{borderRadius: 20,}}
                                        overlayContainerStyle={{borderRadius: 20,}}
                                    />
                                </View> : <View />
                            }
                        </View>
                    </View>

                    {/* <View style={styles.firstColumnViewContainer}>
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
                    <View style={styles.columnNormal}>
                        <Text style={styles.columnTitleText}>Order Image</Text>
                        {
                            (orderDetails.shipperOrderImage !== '') ? <View style={{flexDirection: 'row', paddingBottom: 10, paddingTop: 10, paddingLeft: 0, paddingRight: 0, justifyContent: 'flex-start', }}>
                                <Avatar
                                    size={width-100}
                                    source={{uri: orderDetails.shipperOrderImage}}
                                    activeOpacity={0.7}
                                />
                            </View> : <View />
                        }
                    </View> */}
                    {/* <View style={styles.columnRowContainer}>
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
                    </View> */}
                </View>
                {/* <View style={styles.spinnerView}>
                    <Spinner
                        isVisible={this.state.spinnerVisible}
                        type={'ThreeBounce'}
                        color='#F4D549'
                        size={30}/>
                </View> */}
                <View style={styles.pendingAcceptButton}>
                    <TouchableOpacity
                        style={styles.buttonContainer}
                        onPress={() => this.props.navigation.navigate('DriverPendingOrder', {
                            shipperOrderId: orderDetails.shipperOrderId
                        })}>
                        <Text style={{color: '#fff', textAlign: 'center', fontSize: 16, fontFamily: 'AvenirLTStd-Black',}}>Select Order</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        )
    }
}