import React, { Component } from 'react';
import { View, Text, Alert, StatusBar, isAndroid, ScrollView, } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialComIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import AntIcon from 'react-native-vector-icons/AntDesign';
import NetworkConnection from '../utils/NetworkConnection';
import DeviceInfo from 'react-native-device-info';
import MyRealm from '../utils/Realm';
import { ListItem } from 'react-native-elements';
import { styles } from '../utils/Style';
import Spinner from 'react-native-spinkit';

let myApiUrl = 'http://courierlabapi.azurewebsites.net/api/v1/MobileApi';
let pendingConfirmationPath = 'PendingShipperMatchOrders';
let deviceId = DeviceInfo.getUniqueID();
let realm = new MyRealm();
let loginAsset = realm.objects('LoginAsset');
let count = 0;

export default class PendingConfirmation extends Component{
    static navigationOptions = {
        // title: 'Pending Confirmation',
        headerTitle: <View style={{flexDirection: 'row',}}>
                <FeatherIcon name="server" size={19} color="#fff" style={{paddingLeft: 10, paddingRight: 10,}}/>
                <Text style={{color: '#fff', fontWeight: 'bold', fontFamily: 'AvenirLTStd-Black', fontSize: 15, paddingTop: 3,}}>Pending Confirmation</Text>
            </View>,
    };
    
    constructor(props){
        super(props);
        this.state = {
            pendingConfirmaiton: [],
            spinnerVisible: false,
            pagination: {},
            isScrollSpinner: false,
            noMoreData: false,
        };
    }

    componentDidMount() {
        setTimeout(() => {
            this.checkInternetConnection();
        }, 500);
        this.getPendingConfirmation();
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

    getPendingConfirmation(){
        this.setState({
            spinnerVisible: true,
        })
        fetch(`${myApiUrl}/${pendingConfirmationPath}?deviceId=` + deviceId + `&userId=` + loginAsset[0].userId, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': loginAsset[0].accessToken,
            },
        })
        .then((response) => response.json())
        .then((json) => {
            if(json.succeeded){
                this.setState({
                    pendingConfirmaiton: json.results,
                    pagination: json.paging,
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

    isCloseToBottom({layoutMeasurement, contentOffset, contentSize}){
        const paddingToBottom = 20;
        return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
    }

    callPagination(){
        this.setState({
            isScrollSpinner: true,
        })
        console.log(this.state.pagination);
        count++;
        if(this.state.pagination !== {}){
            if(this.state.pagination.next !== null && count == 1){
                console.log(this.state.pagination.next);
                fetch(this.state.pagination.next, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': loginAsset[0].accessToken,
                    },
                })
                .then((response) => response.json())
                .then((json) => {
                    if(json.succeeded){
                        this.setState({
                            pendingConfirmaiton: [...this.state.pendingConfirmaiton, ...json.results],
                            pagination: json.paging,
                            isScrollSpinner: false,
                        });
                        count = 0;
                    }
                    console.log('latest paging: ', json.paging);
                }).catch(err => {
                    console.log(err);
                    this.setState({
                        isScrollSpinner: false,
                    })
                    count = 0;
                });
            }

            if(this.state.pagination.next === null){
                this.setState({
                    noMoreData: true,
                    isScrollSpinner: false,
                })
            }
        }
    }

    render(){
        var pendingView = <View style={styles.noListContainer}>
                            <Text style={{color: '#9B9B9B', fontSize: 14, fontFamily: 'AvenirLTStd-Roman', paddingTop: 10,}}>No Pending Confirmation</Text> 
                          </View>;
        console.log(this.state.pendingConfirmaiton);
        if(this.state.pendingConfirmaiton !== [] && this.state.pendingConfirmaiton.length > 0){
            pendingView = this.state.pendingConfirmaiton.map((item, index) => (
                <ListItem 
                        key={index}
                        // bottomDivider={true}
                        // rightIcon={<Icon name='chevron-right' color='#3c4c96' style={{marginLeft: 3, marginRight: 20}}/>}
                        // title={ <Text style={styles.listItemText}>{item.orderNumber}</Text> }
                        subtitle={
                            // <View style={{paddingTop: 5, }}>
                            //     <View style={styles.iconView}>
                            //         <Icon name={'user'} size={17} color={'#3c4c96'} />
                            //         <Text style={styles.listItemText}>  {item.recipientName}</Text>
                            //     </View>
                            //     <View style={styles.iconView}>
                            //     {(item.orderDescription !== "") ? <View style={styles.iconView}>
                            //         <Icon name={'info'} size={15} color={'#3c4c96'} style={{marginLeft: 3, marginRight: 6}}/>
                            //         <Text style={styles.listItemText}> {item.orderDescription}</Text>    
                            //         </View> : <View/>
                            //     }    
                            //     </View>
                            //     <View style={{flexDirection: 'row',}}>
                            //         <Icon name={'map-pin'} size={15} color={'#3c4c96'} style={{marginLeft: 2}}/>
                            //         <Text style={styles.listItemText}>  {item.pickUpLocation} </Text> 
                            //     </View>
                            //     <View style={{flexDirection: 'row', marginLeft: 20,}}>
                            //         <Icon name={'long-arrow-right'} size={13} color={'#3c4c96'} style={{marginLeft: 2}}/>
                            //         <Text style={styles.listItemText}>  {item.recipientAddress}</Text>    
                            //     </View>
                            //     <View style={styles.iconView}>
                            //         <Icon name={'calendar'} size={15} color={'#3c4c96'} />
                            //         <Text style={styles.listItemText}>  {item.expectedArrivalDate}</Text>
                            //     </View>
                            // </View>
                            <View style={{margin: 0, padding: 20, marginBottom: -10, backgroundColor: '#EFEFEF', borderRadius: 20,}}>
                                <View style={{flexDirection: 'row', justifyContent: 'space-between', }}>
                                    <Text style={{fontSize: 14, fontFamily: 'AvenirLTStd-Black', color: '#2C2E6D',}}>{item.orderNumber}</Text>
                                    <Text style={{fontSize: 14, fontFamily: 'AvenirLTStd-Roman', color: '#2C2E6D',}}>more info</Text>
                                </View>
                                <View style={{flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10, }}>
                                    <View style={{flexDirection: 'column', width: '40%',}}>
                                        <Text style={{fontSize: 14, fontFamily: 'AvenirLTStd-Black', color: '#2C2E6D',}}>{item.pickUpLocation}</Text>
                                        <Text style={{fontSize: 14, fontFamily: 'AvenirLTStd-Roman', color: '#2C2E6D',}}>{item.pickUpDate}</Text>
                                    </View>
                                    <View style={{flexDirection: 'column', width: '20%', justifyContent: 'center',}}>
                                        <AntIcon name="swapright" size={40} color="#2C2E6D" style={{paddingLeft: 5, paddingRight: 5,}}/>
                                    </View>
                                    <View style={{flexDirection: 'column', width: '40%',}}>
                                        <Text style={{fontSize: 14, fontFamily: 'AvenirLTStd-Black', color: '#2C2E6D',}}>{item.recipientAddress}</Text>
                                        <Text style={{fontSize: 14, fontFamily: 'AvenirLTStd-Roman', color: '#2C2E6D',}}>{item.expectedArrivalDate}</Text>
                                    </View>
                                </View>
                            </View>
                        }
                        onPress={() => {this.props.navigation.navigate('PendingConfirmationDetail', {
                                shipperOrderId: item.shipperOrderId,
                                rerenderFunction : () => this.getPendingConfirmation()
                            })
                        }}
                    />
                ));
        }
        return (
            <ScrollView style={styles.listViewContainer}
                onScroll={({nativeEvent}) => {
                    if (this.isCloseToBottom(nativeEvent)) {
                        this.callPagination();
                    }
                }}
                scrollEventThrottle={0}>
                <StatusBar
                barStyle="light-content"
                backgroundColor="#3c4c96"/>
                {
                    (!this.state.spinnerVisible) ? <View style={styles.homeView}>
                        {pendingView}
                        {(this.state.isScrollSpinner) ? <View style={{marginBottom: 20, marginTop: 20, alignItems: 'center',}}>
                            <Spinner
                                isVisible={this.state.isScrollSpinner}
                                type={'ThreeBounce'}
                                color='#F4D549'
                                size={30}/>
                                </View> : (this.state.noMoreData) ? <View style={styles.noListContainer}>
                                    <Text style={{color: '#9B9B9B', fontSize: 14, fontFamily: 'AvenirLTStd-Roman', paddingTop: 10,}}>No More Pending Confirmation Order</Text> 
                                </View>
                            : <View/>
                        }
                    </View> : <View style={{marginBottom: 20, alignItems: 'center', marginTop: 20,}}>
                        <Spinner
                            isVisible={this.state.spinnerVisible}
                            type={'ThreeBounce'}
                            color='#F4D549'
                            size={30}/>
                    </View>
                }
            </ScrollView>
        )
    }
}