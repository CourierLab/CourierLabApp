import React, { Component } from 'react';
import { createBottomTabNavigator, createStackNavigator } from 'react-navigation';
import Icon from 'react-native-vector-icons/FontAwesome';
import { connect } from 'react-redux';
import reducers from '../utils/Reducers';
import LoginScreen from './Login';
import HomeScreen from './Home';
import PendingOrderDetailsScreen from './PendingOrderDetails';
import HistoryScreen from './History';
import ProfileScreen from './Profile';
import HistoryOrderDetailsScreen from './HistoryOrderDetails';
import ScannerScreen from './Scanner';
import AddOrderScreen from './AddOrder';
import MapScreen from './Map';
import ConfirmedOrderDetailScreen from './ConfirmedOrderDetail';
import VerificationScreen from './Verification';
import ConfirmDriverShipperOrderScreen from './ConfirmDriverShipperOrder';
import SelectShipperOrderScreen from './SelectShipperOrder';
import EditOrderScreen from './EditOrder';
import AddDriverOrderScreen from './AddDriverOrder';

const tabOneStack = createStackNavigator({
    Home: { screen: HomeScreen },
    PendingOrderDetails: { screen: PendingOrderDetailsScreen },
    AddOrder: { screen: AddOrderScreen },
    ConfirmDriverShipperOrder: { screen: ConfirmDriverShipperOrderScreen },
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
    History : { screen: HistoryScreen },
    AddDriverOrder: { screen: AddDriverOrderScreen },
    HistoryOrderDetails: { screen: HistoryOrderDetailsScreen },
    SelectShipperOrder: { screen: SelectShipperOrderScreen },
    EditOrder: { screen: EditOrderScreen },
    ConfirmedOrderDetail: { screen: ConfirmedOrderDetailScreen },
    Scanner: { screen: ScannerScreen },
    Verification: { screen: VerificationScreen },
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
    Profile : { screen: ProfileScreen },
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
    "Shipper Order" : { screen: tabOneStack },
    "Driver Order" : { screen: tabTwoStack },
    "Profile" : { screen: tabThreeStack },
},
{
    navigationOptions: ({ navigation }) => ({
        tabBarIcon: ({ focused, tintColor }) => {
            const { routeName } = navigation.state;
            let iconName;
            if(routeName === 'Shipper Order'){
                iconName = 'tasks';
            }else if(routeName === 'Driver Order'){
                iconName = 'list-alt';
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


