import React, { Component } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Dimensions, } from 'react-native';
import { styles } from '../utils/Style';
import NetworkConnection from '../utils/NetworkConnection';
import DeviceInfo from 'react-native-device-info';
import MyRealm from '../utils/Realm';
import { Avatar } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import Spinner from 'react-native-spinkit';

let realm = new MyRealm();
let loginAsset = realm.objects('LoginAsset');
let {height, width} = Dimensions.get('window');

export default class Lorry extends Component{
    static navigationOptions = {
        title: 'My Lorry',
        headerRight: (
            <Icon onPress={() => _this.props.navigation.navigate('UpdateLorry', { rerenderFunction : () => _this.getLorry() })} name={'pencil'} size={25} color={'#fff'} style={{paddingRight: 20,}}/>
        ),
    };
    
    constructor(props){
        super(props);
        this.state = {
            spinnerVisible: false,
            isSubmit: false,
            lorryType: '',
            lorryWeight: 0.0,
            lorryLength: 0.0,
            lorryName: '',
            lorryPlateNumber: '',
            lorryColor: '',
            lorryImage: '',
        };
        _this = this;
    }

    componentDidMount() {
        setTimeout(() => {
            this.checkInternetConnection();
        }, 500);
        this.getLorry();
    }

    async checkInternetConnection() {
        if (this.state.isAlertShown) {
            return;
        }

        let result = await NetworkConnection.check();

        if (!result) {
            this.alertInternet();
        }
    }

    disableAlertAndCheckInternetConnection() {
        this.setState({isAlertShown: false});
        this.checkInternetConnection();
    }

    alertInternet() {
        this.setState({isAlertShown: true});
        Alert.alert('Unable to access internet', 'Please check your internet connectivity and try again', [
        {
            text: 'OK',
            onPress: () => this.disableAlertAndCheckInternetConnection()
        }], {cancelable: false})
    }

    getLorry(){
        this.setState({
            lorryType: loginAsset[0].lorryTypeName,
            lorryWeight: loginAsset[0].lorryWeigthAmount,
            lorryLength: loginAsset[0].lorryLengthAmount,
            lorryName: loginAsset[0].lorryName,
            lorryPlateNumber: loginAsset[0].lorryPlateNumber,
            lorryColor: loginAsset[0].lorryColor,
            lorryImage: loginAsset[0].lorryImage,
        })
    }

    render(){
        return(
            <ScrollView style={styles.container}>
                <View style={{flexDirection: 'row', paddingBottom: 10, paddingTop: 0, justifyContent: 'center', }}>
                    <Avatar
                        size={width-60}
                        source={{uri: this.state.lorryImage}}
                        onPress={() => console.log("Works!")}
                        activeOpacity={0.7}
                    />
                </View>
                <View>
                    <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Lorry Name: </Text>
                    <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 20, fontFamily: 'Raleway-Regular',}}>{this.state.lorryName}</Text>

                    <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Lorry Type: </Text>
                    <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 20, fontFamily: 'Raleway-Regular',}}>{this.state.lorryType}</Text>

                    <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Lorry Weight(kg): </Text>
                    <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 20, fontFamily: 'Raleway-Regular',}}>{this.state.lorryWeight}</Text>

                    <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Lorry Length(m): </Text>
                    <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 20, fontFamily: 'Raleway-Regular',}}>{this.state.lorryLength}</Text>

                    <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Lorry Plate Number: </Text>
                    <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 20, fontFamily: 'Raleway-Regular',}}>{this.state.lorryPlateNumber}</Text>

                    <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Lorry Color: </Text>
                    <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 20, fontFamily: 'Raleway-Regular',}}>{this.state.lorryColor}</Text>
                </View>
            </ScrollView>
        )
    }
}