import React from 'react';
import { createStackNavigator } from 'react-navigation';
import Icon from 'react-native-vector-icons/FontAwesome';
import LoginScreen from './Login';
import ForgotPasswordScreen from './ForgotPassword';
import RegisterScreen from './Register';
import UpdateProfileFirstScreen from './UpdateProfileFirst';

export default createStackNavigator({
    Login: { screen: LoginScreen },
    Register: { screen: RegisterScreen },
    ForgotPassword: { screen: ForgotPasswordScreen },
    UpdateProfileFirst: { screen: UpdateProfileFirstScreen },
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

