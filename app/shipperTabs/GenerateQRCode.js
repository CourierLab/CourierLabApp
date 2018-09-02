import React, { Component } from 'react';
import { View, Text, } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

export default class GenerateQRCode extends Component{
    static navigationOptions = {
        title: 'QR Code',
    };
    
    constructor(props){
        super(props);
        this.state = {
            spinnerVisible: false,
        };
    }

    render(){
        return (
            <View style={{flex: 1, backgroundColor: '#fff', padding: 20, justifyContent: 'center', alignItems: 'center',}}>
                <QRCode
                    value={this.props.navigation.getParam('orderNumber')}
                    color="black"
                    size={200}
                    logoBackgroundColor='transparent'
                    backgroundColor="white"
                />
            </View>
        )
    }
}