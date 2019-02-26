import React, { Component } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { styles } from '../utils/Style';
import NetworkConnection from '../utils/NetworkConnection';
import DeviceInfo from 'react-native-device-info';
import MyRealm from '../utils/Realm';
import ImagePicker from 'react-native-image-picker';
import Spinner from 'react-native-spinkit';

let myApiUrl = 'http://courierlabapi.azurewebsites.net/api/v1/MobileApi';
let paymentDetailPath = 'PaymentInfo';
let submitPaymentPath = 'SubmitPayment';
let deviceId = DeviceInfo.getUniqueID();
let realm = new MyRealm();
let loginAsset = realm.objects('LoginAsset');
let deviceVersion = DeviceInfo.getVersion();

export default class PendingPaymentDetail extends Component{
    static navigationOptions = {
        title: 'Payment Information',
    };
    
    constructor(props){
        super(props);
        this.state = {
            spinnerVisible: false,
            isSubmit: false,
            bankName: '',
            holderName: '',
            bankAccountNumber: '',
            paymentInfo: [],
            receipt: '',
        };
        _this = this;
    }

    componentDidMount() {
        setTimeout(() => {
            this.checkInternetConnection();
        }, 500);
        this.getPaymentDetails();
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

    getPaymentDetails(){
        this.setState({
            spinnerVisible: true,
        })
        fetch(`${myApiUrl}/${paymentDetailPath}?deviceId=` + deviceId + `&userId=` + loginAsset[0].userId + `&matchedOrderId=` + this.props.navigation.getParam('matchedOrderId'), {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': loginAsset[0].accessToken,
            },
        })
        .then((response) => response.json())
        .then((json) => {
            console.log('getResult: ', json);
            if(json.succeeded){
                this.setState({
                    paymentInfo: json.results.paymentInfo,
                    bankName: json.results.bankName,
                    holderName: json.results.bankTo,
                    bankAccountNumber: json.results.bankAccountNumber,
                });
            }
            this.setState({
                spinnerVisible: false,
            }) 
        }).catch(err => {
            console.log(err);
            this.setState({
                spinnerVisible: false,
            })
        });
    }

    openImage(){
        const options = {
            title: 'Select Image',
            storageOptions: {
                skipBackup: true,
                path: 'images',
            },
        };

        ImagePicker.showImagePicker(options, (response) => {
            if (response.didCancel) {
                this.setState({
                    receipt: "",
                });
            }else if (response.error) {
                this.setState({
                    receipt: "",
                });
            }else {
                const source = response.uri;
                this.setState({
                    receipt: source,
                });
            }
        });
        console.log('image: ', this.state.receipt)
    }

    submitPayment(){
        this.setState({
            spinnerVisible: true,
            isClicked: true,
        })

        if(this.state.receipt === ""){
            Alert.alert('Cannot Submit', 'Please select image.', [{
                text: 'OK',
                onPress: () => {},
            }], {cancelable: false});
            this.setState({
                spinnerVisible: false,
                isClicked: false,
            })
        }else{
            var bodyData = new FormData();
            bodyData.append('matchedOrderId', this.state.paymentInfo.matchedOrderId);
            bodyData.append('deviceId', deviceId);
            bodyData.append('userId', loginAsset[0].userId);
            bodyData.append('paymentReceiptImage', { uri: this.state.receipt, name: 'paymentReceipt', type: 'image/jpeg' });
            console.log(bodyData);
            fetch(`${myApiUrl}/${submitPaymentPath}`, {
                method: 'POST',
                headers: {
                    // 'Accept': 'application/json',
                    'Content-Type': 'multipart/form-data',
                    'Authorization': loginAsset[0].accessToken,
                },
                body: bodyData,
            })
            .then((response) => response.json())
            .then((json) => {
                console.log(json);
                if(json.succeeded){
                    this.setState({
                        spinnerVisible: false,
                        isClicked: false,
                    })
                    Alert.alert('Successfully Submitted', json.message, [{
                        text: 'OK',
                        onPress: () => {
                            this.props.navigation.state.params.rerenderFunction();
                            this.props.navigation.goBack();
                        },
                    }], {cancelable: false});
                }else{
                    Alert.alert('Cannot Submit', json.message, [{
                        text: 'OK',
                        onPress: () => {},
                    }], {cancelable: false});
                    this.setState({
                        spinnerVisible: false,
                        isClicked: false,
                    })
                }
            }).catch(err => {
                console.log(err);
                this.setState({
                    spinnerVisible: false,
                    isClicked: false,
                })
            })
        }
    }

    render(){
        return(
            <ScrollView style={styles.container}>
                {
                    (this.state.spinnerVisible) ? <View style={{alignItems: 'center', paddingBottom: 10, marginTop: 20,}}> 
                        <Spinner
                            isVisible={this.state.spinnerVisible}
                            type={'9CubeGrid'}
                            color='#3c4c96'
                            paddingLeft={20}
                            size={50}/>
                    </View> : <View>
                        <View>
                            <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Order Number: </Text>
                            <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 20, fontFamily: 'Raleway-Regular',}}>{this.state.paymentInfo.shipperOrderNumber}</Text>

                            <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Booking Number: </Text>
                            <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 20, fontFamily: 'Raleway-Regular',}}>{this.state.paymentInfo.bookingNumber}</Text>

                            <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Total Amount(RM): </Text>
                            <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 20, fontFamily: 'Raleway-Regular',}}>{this.state.paymentInfo.totalPrice}</Text>

                            <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Bank Name: </Text>
                            <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 20, fontFamily: 'Raleway-Regular',}}>{this.state.bankName}</Text>

                            <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Bank Holder Name: </Text>
                            <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 20, fontFamily: 'Raleway-Regular',}}>{this.state.holderName}</Text>

                            <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Bank Account Number: </Text>
                            <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 20, fontFamily: 'Raleway-Regular',}}>{this.state.bankAccountNumber}</Text>

                            <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Reference Code: </Text>
                            <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 20, fontFamily: 'Raleway-Regular',}}>{this.state.paymentInfo.referenceCode}</Text>

                            <View style={{paddingLeft: 5, paddingRight: 5,}}>
                                <Text style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 5, paddingRight: 0, color: '#3c4c96', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Payment Receipt: </Text>
                                <View style={{flexDirection: 'row',}}>
                                    {
                                        (this.state.receipt !== "") ? <View style={{flexDirection: 'row',}}>
                                            <Image resizeMode="cover" source={{ uri: this.state.receipt }} style={{width: 50, height: 40, marginLeft: 5, marginRight: 0,}} /> 
                                            <TouchableOpacity
                                                style={{backgroundColor: '#3c4c96', marginLeft: 20, marginRight: 20, marginBottom: 5, marginTop: 0, paddingVertical: 10, width: 150, }}
                                                onPress={(e) => this.openImage()}>
                                                <Text style={{color: '#fff', textAlign: 'center', fontWeight: '700', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Choose Image</Text>
                                            </TouchableOpacity>
                                        </View>
                                        : <TouchableOpacity
                                            style={{backgroundColor: '#3c4c96', marginLeft: 0, marginRight: 0, marginBottom: 5, marginTop: 0, paddingVertical: 10, width: 150,}}
                                            onPress={(e) => this.openImage()}>
                                            <Text style={{color: '#fff', textAlign: 'center', fontWeight: '700', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Choose Image</Text>
                                        </TouchableOpacity>
                                    }
                                </View>
                            </View>
                        </View>
                        {
                            (this.state.isClicked) ? <View style={{alignItems: 'center', paddingBottom: 10, marginTop: 20,}}> 
                                <Spinner
                                    isVisible={this.state.spinnerVisible}
                                    type={'9CubeGrid'}
                                    color='#3c4c96'
                                    paddingLeft={20}
                                    size={50}/>
                            </View> : <View/>
                        }
                        <View style={this.state.isSubmit ? {backgroundColor: '#7D839C', paddingLeft: 10, paddingRight: 10, marginTop: 20, marginLeft: 0, marginRight: 0, marginBottom: 10,} : {backgroundColor: '#3c4c96', paddingLeft: 10, paddingRight: 10, marginTop: 20, marginLeft: 0, marginRight: 0, marginBottom: 10,}}>
                            <TouchableOpacity
                                disabled={this.state.isSubmit}
                                style={this.state.isSubmit ? {backgroundColor: '#7D839C', paddingVertical: 15,} : styles.buttonContainer}
                                onPress={(e) => this.submitPayment()}>
                                <Text style={styles.buttonText}>Submit Payment</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                }
            </ScrollView>
        )
    }
}