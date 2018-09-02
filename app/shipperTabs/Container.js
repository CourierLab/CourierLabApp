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

const tabOneStack = createStackNavigator({
    DriverOrder: { screen: DriverOrderScreen },
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

export default createBottomTabNavigator({
    "Driver Order" : { screen: tabOneStack },
    "Pending Confirmation" : { screen: tabTwoStack },
    "Shipper Order" : { screen: tabThreeStack },
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
            }
            return <Icon name={iconName} size={25} color={tintColor} />;
        },
    }),
    tabBarOptions: {
        activeTintColor: '#ffbb16',
        inactiveTintColor: '#3c4c96',
    },
});

