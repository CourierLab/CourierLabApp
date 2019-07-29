import React, { Component } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Dimensions, } from 'react-native';
import { styles } from '../utils/Style';
import NetworkConnection from '../utils/NetworkConnection';
import DeviceInfo from 'react-native-device-info';
import MyRealm from '../utils/Realm';
import { Avatar, Card, } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialComIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import OctiIcon from 'react-native-vector-icons/Octicons';
import Spinner from 'react-native-spinkit';

let realm = new MyRealm();
let loginAsset = realm.objects('LoginAsset');
let {height, width} = Dimensions.get('window');

export default class Lorry extends Component{
    static navigationOptions = {
        // title: 'My Lorry',
        headerTitle: <View style={{flexDirection: 'row',}}>
            <FeatherIcon name="truck" size={19} color="#fff" style={{paddingLeft: 10, paddingRight: 10,}}/>
            <Text style={{color: '#fff', fontWeight: 'bold', fontFamily: 'AvenirLTStd-Black', fontSize: 15, paddingTop: 3,}}>My Lorry</Text>
        </View>,
        headerRight: (
            <MaterialComIcon onPress={() => _this.props.navigation.navigate('UpdateLorry', { rerenderFunction : () => _this.getLorry() })} name={'pencil-outline'} size={25} color={'#fff'} style={{paddingRight: 20,}}/>
        ),
    };
    
    constructor(props){
        super(props);
        this.state = {
            spinnerVisible: false,
            isSubmit: false,
            lorryType: '',
            // lorryWeight: 0.0,
            // lorryLength: 0.0,
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
            // lorryWeight: loginAsset[0].lorryWeigthAmount,
            // lorryLength: loginAsset[0].lorryLengthAmount,
            lorryName: loginAsset[0].lorryName,
            lorryPlateNumber: loginAsset[0].lorryPlateNumber,
            lorryColor: loginAsset[0].lorryColor,
            lorryImage: loginAsset[0].lorryImage,
        })
    }

    render(){
        return(
            <ScrollView style={styles.container} ref={ref => this.scrollView = ref}
                onContentSizeChange={(contentWidth, contentHeight)=>{
                    if(this.state.isClicked){
                        this.scrollView.scrollToEnd({animated: true});
                    }
                }}>
                <Card containerStyle={{margin: 0, borderRadius: 20, shadowOpacity: 1, backgroundColor: '#EFEFEF', shadowColor: '#e0e0e0', shadowRadius: 3, shadowOffset: {width: 1, height: 1,},}}>
                    {
                        (this.state.lorryImage !== '') ? <View style={{flexDirection: 'row', paddingBottom: 10, paddingTop: 0, justifyContent: 'center', }}>
                            <Avatar
                                size={width-150}
                                source={{uri: this.state.lorryImage}}
                                avatarStyle={{borderRadius: 20,}}
                                overlayContainerStyle={{borderRadius: 20,}}
                                onPress={() => console.log("Works!")}
                                activeOpacity={0.7}
                            />
                        </View> : <View/>
                    }
                    <View style={{paddingTop: 10, paddingBottom: 10, paddingLeft: 0, paddingRight: 0, flexDirection: 'column', backgroundColor: '#EFEFEF',}}>
                        <View style={{flexDirection: 'row', paddingBottom: 10, paddingRight: 10,}}>
                            <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                                <FeatherIcon name="type" size={19} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                            </View>
                            <View style={{flexDirection: 'column', paddingRight: 20,}}>
                                <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Lorry Name</Text>
                                <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{this.state.lorryName}</Text>
                            </View>
                        </View>
                        <View style={{flexDirection: 'row', paddingBottom: 10, paddingRight: 10,}}>
                            <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                                <FeatherIcon name="truck" size={19} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                            </View>
                            <View style={{flexDirection: 'column', paddingRight: 20,}}>
                                <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Lorry Type</Text>
                                <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{this.state.lorryType}</Text>
                            </View>
                        </View>
                        <View style={{flexDirection: 'row', paddingBottom: 10, paddingRight: 10,}}>
                            <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                                <MaterialComIcon name="numeric" size={19} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                            </View>
                            <View style={{flexDirection: 'column', paddingRight: 20,}}>
                                <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Lorry Plate Number</Text>
                                <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{this.state.lorryPlateNumber}</Text>
                            </View>
                        </View>
                        <View style={{flexDirection: 'row', paddingBottom: 0, paddingRight: 10,}}>
                            <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                                <MaterialComIcon name="invert-colors" size={19} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                            </View>
                            <View style={{flexDirection: 'column', paddingRight: 20,}}>
                                <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Lorry Color</Text>
                                <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{this.state.lorryColor}</Text>
                            </View>
                        </View>
                    </View>
                </Card>

                {/* {
                    (this.state.lorryImage !== '') ? <View style={{flexDirection: 'row', paddingBottom: 10, paddingTop: 0, justifyContent: 'center', }}>
                        <Avatar
                            size={width-100}
                            source={{uri: this.state.lorryImage}}
                            onPress={() => console.log("Works!")}
                            activeOpacity={0.7}
                        />
                    </View> : <View />
                }
                <View>
                    <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Lorry Name: </Text>
                    <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 20, fontFamily: 'Raleway-Regular',}}>{this.state.lorryName}</Text>

                    <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Lorry Type: </Text>
                    <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 20, fontFamily: 'Raleway-Regular',}}>{this.state.lorryType}</Text>

                    <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Lorry Plate Number: </Text>
                    <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 20, fontFamily: 'Raleway-Regular',}}>{this.state.lorryPlateNumber}</Text>

                    <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Lorry Color: </Text>
                    <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 20, paddingRight: 5, color: '#3c4c96', fontSize: 20, fontFamily: 'Raleway-Regular',}}>{this.state.lorryColor}</Text>
                </View> */}
            </ScrollView>
        )
    }
}