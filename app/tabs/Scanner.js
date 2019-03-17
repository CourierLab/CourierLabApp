import React, { Component } from 'react';
import { Text, View, Alert, Vibration, Animated, StyleSheet, Dimensions, } from 'react-native';
import Camera from 'react-native-camera';
import NetworkConnection from '../utils/NetworkConnection';
import DeviceInfo from 'react-native-device-info';
import MyRealm from '../utils/Realm';
import Spinner from 'react-native-spinkit';

let myApiUrl = 'http://courierlabapi.azurewebsites.net/api/v1/MobileApi';
let orderScanningPath = 'ScanQrCode';
let deviceId = DeviceInfo.getUniqueID();
let realm = new MyRealm();
let loginAsset = realm.objects('LoginAsset');

export default class Scanner extends Component {
    static navigationOptions = {
        title: 'Scanner',
    };

    constructor(props) {
        super(props);
        this.state = {
            isScanned: false,
        };
    }

    // componentDidMount() {
    //     setTimeout(() => {
    //         this.checkInternetConnection();
    //     }, 500);
    // }

    // async checkInternetConnection() {
    //     if (this.state.isAlertShown) {
    //         return;
    //     }

    //     let result = await NetworkConnection.check();

    //     if (!result) {
    //         this.alertInternet();
    //     }
    // }

    // disableAlertAndCheckInternetConnection() {
    //     this.setState({isAlertShown: false});
    //     this.checkInternetConnection();
    // }

    // alertInternet() {
    //     this.setState({isAlertShown: true});
    //     Alert.alert('Unable to access internet', 'Please check your internet connectivity and try again', [
    //     {
    //         text: 'OK',
    //         onPress: () => this.disableAlertAndCheckInternetConnection()
    //     }], {cancelable: false})
    // }

    scanQR(orderNumber){
        this.setState({ 
            isScanned: true,
        })
        console.log('orderNumber ', orderNumber)
        fetch(`${myApiUrl}/${orderScanningPath}?deviceId=` + deviceId + `&userId=` + loginAsset[0].userId + `&orderNumber=` + orderNumber, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': loginAsset[0].accessToken,
            },
        })
        .then((response) => response.json())
        .then((json) => {
            console.log(json);
            if(json.succeeded){
                Alert.alert('Successfully Scanned', json.message, [
                {
                    text: 'OK',
                    onPress: () => {}
                }], {cancelable: false})
                this.props.navigation.state.params.rerenderFunction();
                this.props.navigation.goBack();
            }else{
                Alert.alert('Cannot Scan', json.message, [
                {
                    text: 'OK',
                    onPress: () => {
                        this.setState({ 
                            isScanned: false,
                        })
                    }
                }], {cancelable: false})
            }
        }).catch(err => {
            console.log(err);
        });
    }
    
    render () {
        return (
            <View style={{flex: 1, flexDirection: 'row',}}>
                <Camera
                    style={{flex: 1, justifyContent: 'flex-end', alignItems: 'center'}}
                    aspect={Camera.constants.Aspect.fill}
                    onBarCodeRead={(e) => {
                        console.log(e);
                        if(!this.state.isScanned){
                            this.scanQR(e.data);
                        }
                    }}            
                >
                    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent', marginBottom: 100}}>
                        <View style={{height: 250, width: 250, borderWidth: 2, borderColor: '#ffbb16', backgroundColor: 'transparent'}}/>
                    </View>
                </Camera>
            </View>
        )
    }
}