import React from 'react';
import { View, TouchableOpacity, Dimensions, Text, } from 'react-native';
import { createStackNavigator } from 'react-navigation';
import Icon from 'react-native-vector-icons/FontAwesome';
import LoginScreen from './Login';
import ForgotPasswordScreen from './ForgotPassword';
import RegisterScreen from './Register';
import UpdateProfileFirstScreen from '../shipperTabs/UpdateProfileFirst';
import UpdateLorryFirstScreen from '../tabs/UpdateLorryFirst';
// import SplashScreen from './SplashScreen';

let {height, width} = Dimensions.get('window');

export default createStackNavigator({
    Login: { screen: LoginScreen },
    Register: { screen: RegisterScreen },
    ForgotPassword: { screen: ForgotPasswordScreen },
    UpdateProfileFirst: { screen: UpdateProfileFirstScreen },
    UpdateLorryFirst: { screen: UpdateLorryFirstScreen },
    // Splash: { screen: SplashScreen },
},
{
    // initialRouteName: "Splash",
    navigationOptions: {
        headerStyle: {
            backgroundColor: '#3c4c96',
            height: height * 0.25,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
            fontFamily: 'AvenirLTStd-Roman',
        },
    }
});

