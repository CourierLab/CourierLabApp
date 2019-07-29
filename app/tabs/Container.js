import React, { Component } from 'react';
import { Text, View, } from 'react-native';
import { createBottomTabNavigator, createStackNavigator } from 'react-navigation';
import FeatherIcon from 'react-native-vector-icons/Feather';
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
import PendingConfirmationScreen from './PendingConfirmation';
import PendingConfirmationDetailScreen from './PendingConfirmationDetail';
import UpdateProfileScreen from './UpdateProfile';
import UpcomingOrderScreen from './UpcomingOrder';
import UpdateLorryScreen from './UpdateLorry';
import LorryScreen from './Lorry';
import DriverPendingOrderScreen from './DriverPendingOrder';

const tabOneStack = createStackNavigator({
    Home: { screen: HomeScreen },
    PendingOrderDetails: { screen: PendingOrderDetailsScreen },
    DriverPendingOrder: { screen: DriverPendingOrderScreen },
    AddOrder: { screen: AddOrderScreen },
    SelectShipperOrder: { screen: SelectShipperOrderScreen },
    ConfirmDriverShipperOrder: { screen: ConfirmDriverShipperOrderScreen },
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
    History : { screen: HistoryScreen },
    AddDriverOrder: { screen: AddDriverOrderScreen },
    HistoryOrderDetails: { screen: HistoryOrderDetailsScreen },
    SelectShipperOrder: { screen: SelectShipperOrderScreen },
    EditOrder: { screen: EditOrderScreen },
    ConfirmedOrderDetail: { screen: ConfirmedOrderDetailScreen },
    Scanner: { screen: ScannerScreen },
    Verification: { screen: VerificationScreen },
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
    Lorry : { screen: LorryScreen },
    UpdateLorry : { screen: UpdateLorryScreen },
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
    UpcomingOrder : { screen: UpcomingOrderScreen },
    ConfirmedOrderDetail: { screen: ConfirmedOrderDetailScreen },
    Scanner: { screen: ScannerScreen },
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
    "Shipper Order" : { screen: tabOneStack },
    "Pending Confirmation" : { screen: tabTwoStack },
    "Upcoming Order" : { screen: tabFiveStack },
    "Driver Order" : { screen: tabThreeStack },
    "Profile" : { screen: tabFourStack },
},
{
    navigationOptions: ({ navigation }) => ({
        tabBarIcon: ({ focused, tintColor }) => {
            const { routeName } = navigation.state;
            let iconName;
            if(routeName === 'Shipper Order'){
                iconName = 'shopping-cart';
            }else if(routeName === 'Pending Confirmation'){
                iconName = 'server';
            }else if(routeName === 'Upcoming Order'){
                iconName = 'chevrons-up';
            }else if(routeName === 'Driver Order'){
                iconName = 'truck';
            }else if(routeName === 'Profile'){
                iconName = 'user';
            }
            return <FeatherIcon name={iconName} size={25} color={tintColor} />;
        },
        tabBarLabel: ({ focused, tintColor }) => {
            const { routeName } = navigation.state;
            let labelName;
            if(routeName === 'Shipper Order'){
                labelName = routeName;
            }else if(routeName === 'Pending Confirmation'){
                labelName = routeName;
            }else if(routeName === 'Upcoming Order'){
                labelName = routeName;
            }else if(routeName === 'Driver Order'){
                labelName = routeName;
            }else if(routeName === 'Profile'){
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
        // labelStyle: {
        //     fontSize: 12,
        // },
    },
});


