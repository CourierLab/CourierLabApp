import React, { Component } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Image, Modal, } from 'react-native';
import { styles } from '../utils/Style';
import Icon from 'react-native-vector-icons/FontAwesome';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import MaterialComIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import AntIcon from 'react-native-vector-icons/AntDesign';
import NetworkConnection from '../utils/NetworkConnection';
import DeviceInfo from 'react-native-device-info';
import MyRealm from '../utils/Realm';
import ImagePicker from 'react-native-image-picker';
import Spinner from 'react-native-spinkit';
import { Card, Avatar, } from 'react-native-elements';

let myApiUrl = 'http://courierlabapi.azurewebsites.net/api/v1/MobileApi';
let paymentDetailPath = 'PaymentInfo';
let submitPaymentPath = 'SubmitPayment';
let deviceId = DeviceInfo.getUniqueID();
let realm = new MyRealm();
let loginAsset = realm.objects('LoginAsset');
let deviceVersion = DeviceInfo.getVersion();

export default class PendingPaymentDetail extends Component{
    static navigationOptions = {
        // title: 'Payment Information',
        headerTitle: <View style={{flexDirection: 'row',}}>
                <FeatherIcon name="file-text" size={19} color="#fff" style={{paddingLeft: 10, paddingRight: 10,}}/>
                <Text style={{color: '#fff', fontWeight: 'bold', fontFamily: 'AvenirLTStd-Black', fontSize: 15, paddingTop: 3,}}>Payment Information</Text>
            </View>,
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
            modalVisible: false,
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
            modalVisible: true,
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
                modalVisible: false,
            }) 
        }).catch(err => {
            console.log(err);
            this.setState({
                spinnerVisible: false,
                modalVisible: false,
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
                onPress: () => {
                    this.setState({
                        spinnerVisible: false,
                        isClicked: false,
                    })
                },
            }], {cancelable: false});
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
                        onPress: () => {
                            this.setState({
                                spinnerVisible: false,
                                isClicked: false,
                            })
                        },
                    }], {cancelable: false});
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
            <ScrollView style={styles.container} ref={ref => this.scrollView = ref}
                onContentSizeChange={(contentWidth, contentHeight)=>{
                    if(this.state.isClicked){
                        this.scrollView.scrollToEnd({animated: true});
                    }
                }}>
                {
                    (this.state.modalVisible) ? <Modal
                        animationType="slide"
                        transparent={true}
                        visible={this.state.modalVisible}>
                        <View style={{flex: 1, backgroundColor: 'rgba(0,0,0,.4)', position: 'absolute', top: 0, right: 0, bottom: 0, left: 0}}>
                            <View style={{flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center',}}> 
                                <Spinner
                                    isVisible={this.state.modalVisible}
                                    type={'ThreeBounce'}
                                    color='#F4D549'
                                    size={30}/>
                            </View>
                        </View>
                    </Modal> : <View/>
                }
                {
                    // (this.state.spinnerVisible) ? <View style={{alignItems: 'center', paddingBottom: 10, marginTop: 20,}}> 
                    //     <Spinner
                    //         isVisible={this.state.spinnerVisible}
                    //         type={'ThreeBounce'}
                    //         color='#F4D549'
                    //         size={30}/>
                    // </View> : 
                    <View>
                        <Card containerStyle={{margin: 0, borderRadius: 20, shadowOpacity: 1, backgroundColor: '#EFEFEF', shadowColor: '#e0e0e0', shadowRadius: 3, shadowOffset: {width: 1, height: 1,},}}>
                            <View style={{paddingTop: 10, paddingBottom: 10, paddingLeft: 0, paddingRight: 0, flexDirection: 'column', backgroundColor: '#EFEFEF',}}>
                                <View style={{flexDirection: 'row', paddingBottom: 10, paddingRight: 10,}}>
                                    <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                                        <MaterialComIcon name="script-text-outline" size={19} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                                    </View>
                                    <View style={{flexDirection: 'column', paddingRight: 20,}}>
                                        <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Order Number</Text>
                                        <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{this.state.paymentInfo.shipperOrderNumber}</Text>
                                    </View>
                                </View>
                                <View style={{flexDirection: 'row', paddingBottom: 10, paddingRight: 10,}}>
                                    <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                                        <MaterialComIcon name="barcode" size={19} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                                    </View>
                                    <View style={{flexDirection: 'column', paddingRight: 20,}}>
                                        <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Booking Number</Text>
                                        <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{this.state.paymentInfo.bookingNumber}</Text>
                                    </View>
                                </View>
                                <View style={{flexDirection: 'row', paddingBottom: 10, paddingRight: 10,}}>
                                    <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                                        <FeatherIcon name="tag" size={19} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                                    </View>
                                    <View style={{flexDirection: 'column', paddingRight: 20,}}>
                                        <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Total Amount(RM)</Text>
                                        <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{this.state.paymentInfo.totalPrice}</Text>
                                    </View>
                                </View>
                                <View style={{flexDirection: 'row', paddingBottom: 10, paddingRight: 10,}}>
                                    <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                                        <MaterialComIcon name="bank" size={19} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                                    </View>
                                    <View style={{flexDirection: 'column', paddingRight: 20,}}>
                                        <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Bank Name</Text>
                                        <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{this.state.bankName}</Text>
                                    </View>
                                </View>
                                <View style={{flexDirection: 'row', paddingBottom: 10, paddingRight: 10,}}>
                                    <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                                        <MaterialIcon name="person-outline" size={19} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                                    </View>
                                    <View style={{flexDirection: 'column', paddingRight: 20,}}>
                                        <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Bank Holder Name</Text>
                                        <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{this.state.holderName}</Text>
                                    </View>
                                </View>
                                <View style={{flexDirection: 'row', paddingBottom: 10, paddingRight: 10,}}>
                                    <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                                        <MaterialComIcon name="credit-card" size={19} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                                    </View>
                                    <View style={{flexDirection: 'column', paddingRight: 20,}}>
                                        <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Bank Account Number</Text>
                                        <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{this.state.bankAccountNumber}</Text>
                                    </View>
                                </View>
                                <View style={{flexDirection: 'row', paddingBottom: 10, paddingRight: 10,}}>
                                    <View style={{flexDirection: 'column', justifyContent: 'center',}}>
                                        <MaterialComIcon name="tooltip-text-outline" size={19} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                                    </View>
                                    <View style={{flexDirection: 'column', paddingRight: 20,}}>
                                        <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium', }}>Reference Code</Text>
                                        <Text style={{fontSize: 16, color: '#2C2E6D', fontFamily: 'AvenirLTStd-Heavy', }}>{this.state.paymentInfo.referenceCode}</Text>
                                    </View>
                                </View>
                                <View style={{flexDirection: 'row', paddingBottom: 0, paddingRight: 10,}}>
                                    <View style={{flexDirection: 'column',}}>
                                        <Icon name="image" size={17} color="#9B9B9B" style={{paddingLeft: 0, paddingRight: 10,}}/>
                                    </View>
                                    <View style={{flexDirection: 'column', paddingRight: 20,}}>
                                        <Text style={{fontSize: 14, color: '#9B9B9B', fontFamily: 'AvenirLTStd-Medium',}}>Payment Receipt </Text>
                                        <View style={{flexDirection: 'row',}}>
                                            {
                                                (this.state.receipt !== "") ? <View style={{flexDirection: 'row',}}>
                                                    <Image resizeMode="cover" source={{ uri: this.state.receipt }} style={{width: 40, height: 30, marginLeft: 0, marginRight: 0,}} /> 
                                                    <TouchableOpacity
                                                        style={{backgroundColor: '#F2BB45', marginLeft: 10, marginRight: 10, marginBottom: 0, marginTop: 0, paddingVertical: 10, width: 150, }}
                                                        onPress={(e) => this.openImage()}>
                                                        <Text style={{color: '#fff', textAlign: 'center', fontSize: 15, fontFamily: 'AvenirLTStd-Medium',}}>Choose Image</Text>
                                                    </TouchableOpacity>
                                                </View> 
                                                : <TouchableOpacity
                                                    style={{backgroundColor: '#F2BB45', marginLeft: 0, marginRight: 0, marginBottom: 0, marginTop: 0, paddingVertical: 10, width: 150,}}
                                                    onPress={(e) => this.openImage()}>
                                                    <Text style={{color: '#fff', textAlign: 'center', fontSize: 15, fontFamily: 'AvenirLTStd-Medium',}}>Choose Image</Text>
                                                </TouchableOpacity>
                                            }
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </Card>

                        {/* <View>
                            <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Order Number: </Text>
                            <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 20, fontFamily: 'AvenirLTStd-Roman',}}>{this.state.paymentInfo.shipperOrderNumber}</Text>

                            <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Booking Number: </Text>
                            <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 20, fontFamily: 'AvenirLTStd-Roman',}}>{this.state.paymentInfo.bookingNumber}</Text>

                            <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Total Amount(RM): </Text>
                            <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 20, fontFamily: 'AvenirLTStd-Roman',}}>{this.state.paymentInfo.totalPrice}</Text>

                            <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Bank Name: </Text>
                            <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 20, fontFamily: 'AvenirLTStd-Roman',}}>{this.state.bankName}</Text>

                            <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Bank Holder Name: </Text>
                            <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 20, fontFamily: 'AvenirLTStd-Roman',}}>{this.state.holderName}</Text>

                            <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Bank Account Number: </Text>
                            <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 20, fontFamily: 'AvenirLTStd-Roman',}}>{this.state.bankAccountNumber}</Text>

                            <Text style={{paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 15, fontFamily: 'Raleway-Bold',}}>Reference Code: </Text>
                            <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 10, paddingRight: 5, color: '#3c4c96', fontSize: 20, fontFamily: 'AvenirLTStd-Roman',}}>{this.state.paymentInfo.referenceCode}</Text>

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
                        </View> */}
                        {
                            (this.state.isClicked) ? <View style={{alignItems: 'center', paddingBottom: 0, marginTop: 10,}}> 
                                <Spinner
                                    isVisible={this.state.spinnerVisible}
                                    type={'ThreeBounce'}
                                    color='#F4D549'
                                    size={30}/>
                            </View> : <View/>
                        }
                        <View style={this.state.isClicked ? {backgroundColor: '#F4D549', borderRadius: 20, paddingLeft: 10, paddingRight: 10, marginLeft: 0, marginRight: 0, marginBottom: 10, marginTop: 20,} : {backgroundColor: '#2C2E6D', borderRadius: 20, paddingLeft: 10, paddingRight: 10, marginLeft: 0, marginRight: 0, marginBottom: 10, marginTop: 20,}}>
                            <TouchableOpacity
                                disabled={this.state.isClicked}
                                style={this.state.isClicked ? {backgroundColor: '#F4D549', borderRadius: 20, paddingVertical: 15,} : styles.buttonContainer}
                                onPress={(e) => this.submitPayment()}>
                                <Text style={this.state.isClicked ? {color: '#2C2E6D', textAlign: 'center', fontSize: 16, fontFamily: 'AvenirLTStd-Black',} : {color: '#fff', textAlign: 'center', fontSize: 16, fontFamily: 'AvenirLTStd-Black',}}>Submit Payment</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                }
            </ScrollView>
        )
    }
}