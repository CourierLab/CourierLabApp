import React, { Component } from 'react';
import { TabNavigator, StackNavigator, TabBarBottom } from 'react-navigation';
import Icon from 'react-native-vector-icons/FontAwesome';
import { connect } from 'react-redux';
import reducers from './Reducers';
import LoginContainer from '../tabs/LoginContainer';
import Container from '../tabs/Container';
import OneSignal from 'react-native-onesignal';

class App extends Component{
    componentWillMount(){
        OneSignal.init("8fcca8d9-ca8d-4bbf-907f-261a1a8324f5");
        OneSignal.addEventListener('received', this.onReceived);
        OneSignal.addEventListener('opened', this.onOpened);
        OneSignal.addEventListener('ids', this.onIds);
    }

    componentWillUnmount() {
        OneSignal.removeEventListener('received', this.onReceived);
        OneSignal.removeEventListener('opened', this.onOpened);
        OneSignal.removeEventListener('ids', this.onIds);
    }

    onReceived(notification) {
        console.log("Notification received: ", notification);
    }

    onOpened(openResult) {
      console.log('Message: ', openResult.notification.payload.body);
      console.log('Data: ', openResult.notification.payload.additionalData);
      console.log('isActive: ', openResult.notification.isAppInFocus);
      console.log('openResult: ', openResult);
    }

    onIds(device) {
		console.log('Device info: ', device);
    }

    render(){
        console.log(this.props.isLoggedIn);
        if(this.props.isLoggedIn){
            return <Container />;
        }else{
            return <LoginContainer />;
        }
    }
}

const mapStateToProps = ( state, ownProps) => {
    console.log("App.js isLoggedIn state: ", state.reducers.isLoggedIn);
    console.log("App.js email: ", state.reducers.email);
    return {
        isLoggedIn: state.reducers.isLoggedIn
    };
}

export default connect (mapStateToProps)(App);
