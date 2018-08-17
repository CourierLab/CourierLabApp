import React, { Component } from 'react';
import { TabNavigator, StackNavigator, TabBarBottom } from 'react-navigation';
import Icon from 'react-native-vector-icons/FontAwesome';
import { connect } from 'react-redux';
import reducers from './Reducers';
import LoginContainer from '../tabs/LoginContainer';
import Container from '../tabs/Container';

class App extends Component{
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
