import React, { Component } from 'react';
import { Alert } from 'react-native';
import { connect } from 'react-redux';
import LoginContainer from '../tabs/LoginContainer';
import Container from '../tabs/Container';
import ShipperContainer from '../shipperTabs/Container';
import MyRealm from './Realm';

let realm = new MyRealm();
let loginAsset = realm.objects('LoginAsset');

class App extends Component{
    render(){
        console.log(this.props.isLoggedIn);
        if(this.props.isLoggedIn){
            
            if(loginAsset[0].roleName === "Driver"){
                return <Container />;
            }else{
                return <ShipperContainer />;
            }
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
