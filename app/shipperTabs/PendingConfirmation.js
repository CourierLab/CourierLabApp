import React, { Component } from 'react';
import { Text, View, } from 'react-native';
import { styles } from '../utils/Style';
  
export default class PendingConfirmation extends Component{
    static navigationOptions = {
        title: 'Pending Confirmation',
    }
    
    render(){
        return(
            <View style={{backgroundColor: '#fff', flex: 1,}}>
                <Text style={styles.title}>This is Pending Confirmation page</Text>
            </View>
        )
    }
}