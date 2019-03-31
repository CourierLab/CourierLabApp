import React, { Component } from 'react';
import { createBottomTabNavigator, createStackNavigator } from 'react-navigation';
import Icon from 'react-native-vector-icons/FontAwesome';
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
import MapScreen from '../tabs/Map';

const tabOneStack = createStackNavigator({
    DriverOrder: { screen: DriverOrderScreen },
    DriverOrderDetails: { screen: DriverOrderDetailsScreen },
    AddOrder: { screen: AddOrderScreen },
    ConfirmShipperDriverOrder: { screen: ConfirmShipperDriverOrderScreen },
    Map: { screen: MapScreen },
},
{
    navigationOptions: {
        headerStyle: {
            backgroundColor: '#3c4c96',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
            fontWeight: 'bold',
            fontFamily: 'Raleway-Bold',
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
            backgroundColor: '#3c4c96',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
            fontWeight: 'bold',
            fontFamily: 'Raleway-Bold',
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
            backgroundColor: '#3c4c96',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
            fontWeight: 'bold',
            fontFamily: 'Raleway-Bold',
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
            backgroundColor: '#3c4c96',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
            fontWeight: 'bold',
            fontFamily: 'Raleway-Bold',
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
            backgroundColor: '#3c4c96',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
            fontWeight: 'bold',
            fontFamily: 'Raleway-Bold',
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
                iconName = 'tasks';
            }else if(routeName === 'Shipper Order'){
                iconName = 'shopping-cart';
            }else if(routeName === 'Profile'){
                iconName = 'user';
            }else if(routeName === 'Pending Payment'){
                iconName = 'dollar';
            }
            return <Icon name={iconName} size={25} color={tintColor} />;
        },
    }),
    tabBarOptions: {
        activeTintColor: '#ffbb16',
        inactiveTintColor: '#3c4c96',
    },
});


