import React, { Component } from 'react';
import { Text, View, } from 'react-native';
import { createBottomTabNavigator, createStackNavigator } from 'react-navigation';
import FeatherIcon from 'react-native-vector-icons/Feather';
import DriverOrderScreen from './DriverOrder';
import PendingConfirmationScreen from './PendingConfirmation';
import ShipperHistoryScreen from './ShipperHistory';
import ProfileScreen from './Profile';
import UpdateProfileScreen from './UpdateProfile';
import ConfirmedOrderDetailScreen from './ConfirmedOrderDetail';
import GenerateQRCodeScreen from './GenerateQRCode';
import HistoryOrderDetailsScreen from './HistoryOrderDetails';
import SelectDriverOrderScreen from './SelectDriverOrder';
import AddShipperOrderScreen from './AddShipperOrder';
import EditOrderScreen from './EditOrder';
import DriverOrderDetailsScreen from './DriverOrderDetails';
import AddOrderScreen from './AddOrder';
import ConfirmShipperDriverOrderScreen from './ConfirmShipperDriverOrder';
import PendingConfirmationDetailScreen from './PendingConfirmationDetail';
import PendingPaymentScreen from './PendingPayment';
import PendingPaymentDetailScreen from './PendingPaymentDetail';
import ShipperPendingOrderScreen from './ShipperPendingOrder';
import MapScreen from '../tabs/Map';

const tabOneStack = createStackNavigator({
    DriverOrder: { screen: DriverOrderScreen },
    DriverOrderDetails: { screen: DriverOrderDetailsScreen },
    AddOrder: { screen: AddOrderScreen },
    ConfirmShipperDriverOrder: { screen: ConfirmShipperDriverOrderScreen },
    ShipperPendingOrder: { screen: ShipperPendingOrderScreen },
    SelectDriverOrder : { screen: SelectDriverOrderScreen },
    Map: { screen: MapScreen },
},
{
    navigationOptions: {
        headerStyle: {
            backgroundColor: '#2C2E6D',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
            fontWeight: 'bold',
            fontFamily: 'AvenirLTStd-Black',
            fontSize: 16,
        },
    }
});

const tabTwoStack = createStackNavigator({
    PendingConfirmation : { screen: PendingConfirmationScreen },
    PendingConfirmationDetail : { screen: PendingConfirmationDetailScreen },
},
{
    navigationOptions: {
        headerStyle: {
            backgroundColor: '#2C2E6D',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
            fontWeight: 'bold',
            fontFamily: 'AvenirLTStd-Black',
            fontSize: 16,
        },
    }
});

const tabThreeStack = createStackNavigator({
    ShipperHistory : { screen: ShipperHistoryScreen },
    ConfirmedOrderDetail : { screen: ConfirmedOrderDetailScreen },
    GenerateQRCode : { screen: GenerateQRCodeScreen },
    HistoryOrderDetails : { screen: HistoryOrderDetailsScreen },
    SelectDriverOrder : { screen: SelectDriverOrderScreen },
    AddShipperOrder : { screen: AddShipperOrderScreen },
    EditOrder : { screen: EditOrderScreen },
    PendingPaymentDetail : { screen: PendingPaymentDetailScreen },
    Map: { screen: MapScreen },
},
{
    navigationOptions: {
        headerStyle: {
            backgroundColor: '#2C2E6D',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
            fontWeight: 'bold',
            fontFamily: 'AvenirLTStd-Black',
            fontSize: 16,
        },
    }
});

const tabFourStack = createStackNavigator({
    Profile : { screen: ProfileScreen },
    UpdateProfile : { screen: UpdateProfileScreen },
},
{
    navigationOptions: {
        headerStyle: {
            backgroundColor: '#2C2E6D',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
            fontWeight: 'bold',
            fontFamily: 'AvenirLTStd-Black',
            fontSize: 16,
        },
    }
});

const tabFiveStack = createStackNavigator({
    PendingPayment : { screen: PendingPaymentScreen },
    PendingPaymentDetail : { screen: PendingPaymentDetailScreen },
},
{
    navigationOptions: {
        headerStyle: {
            backgroundColor: '#2C2E6D',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
            fontWeight: 'bold',
            fontFamily: 'AvenirLTStd-Black',
            fontSize: 16,
        },
    }
});

export default createBottomTabNavigator({
    "Driver Order" : { screen: tabOneStack },
    "Pending Confirmation" : { screen: tabTwoStack },
    "Shipper Order" : { screen: tabThreeStack },
    "Pending Payment" : { screen: tabFiveStack },
    "Profile" : { screen: tabFourStack },
},
{
    navigationOptions: ({ navigation }) => ({
        tabBarIcon: ({ focused, tintColor }) => {
            const { routeName } = navigation.state;
            let iconName;
            if(routeName === 'Driver Order'){
                iconName = 'truck';
            }else if(routeName === 'Pending Confirmation'){
                iconName = 'server';
            }else if(routeName === 'Shipper Order'){
                iconName = 'shopping-cart';
            }else if(routeName === 'Profile'){
                iconName = 'user';
            }else if(routeName === 'Pending Payment'){
                iconName = 'file-text';
            }
            return <FeatherIcon name={iconName} size={20} color={tintColor} />;
        },
        tabBarLabel: ({ focused, tintColor }) => {
            const { routeName } = navigation.state;
            let labelName;
            if(routeName === 'Driver Order'){
                labelName = routeName;
            }else if(routeName === 'Pending Confirmation'){
                labelName = routeName;
            }else if(routeName === 'Shipper Order'){
                labelName = routeName;
            }else if(routeName === 'Profile'){
                labelName = routeName;
            }else if(routeName === 'Pending Payment'){
                labelName = routeName;
            }
            return (<View style={{flexDirection: 'row', flex: 1, justifyContent: 'center', alignItems: 'center',}}>
                <Text numberOfLines={2} style={{textAlign: 'center', fontSize: 10, fontFamily: 'AvenirLTStd-Roman', color: tintColor,}}>{labelName}</Text>
            </View>);
        },
    }),
    tabBarOptions: {
        activeTintColor: '#ffbb16',
        inactiveTintColor: '#2C2E6D',
        style: {
            backgroundColor: '#EFEFEF',
            justifyContent: 'center',
            alignContent: 'center',
        },
        labelStyle: {
            fontSize: 10,
            fontFamily: 'AvenirLTStd-Roman',
        },
    },
});


