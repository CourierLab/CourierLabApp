import React, { Component } from 'react';
import { View, Text, } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import MaterialComIcon from 'react-native-vector-icons/MaterialCommunityIcons';

export default class GenerateQRCode extends Component{
    static navigationOptions = {
        // title: 'QR Code',
        headerTitle: <View style={{flexDirection: 'row',}}>
                <MaterialComIcon name="qrcode" size={19} color="#fff" style={{paddingLeft: 10, paddingRight: 10,}}/>
                <Text style={{color: '#fff', fontWeight: 'bold', fontFamily: 'AvenirLTStd-Black', fontSize: 15, paddingTop: 3,}}>QR Code</Text>
            </View>,
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