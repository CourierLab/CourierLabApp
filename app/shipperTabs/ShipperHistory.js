import React, { Component } from 'react';
import { View, Text, Platform, ScrollView, Alert, } from 'react-native';
import { styles } from '../utils/Style';
import NetworkConnection from '../utils/NetworkConnection';
import DeviceInfo from 'react-native-device-info';
import MyRealm from '../utils/Realm';
import Spinner from 'react-native-spinkit';
import { SearchBar, ListItem, Badge, } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';

let myApiUrl = 'http://courierlabapi.azurewebsites.net/api/v1/MobileApi';
let shipperOrderPath = 'ViewShipperOrder';
let deviceId = DeviceInfo.getUniqueID();
let realm = new MyRealm();
let loginAsset = realm.objects('LoginAsset');
let count = 0;

export default class History extends Component{
    static navigationOptions = {
        title: 'Shipper History',
        headerRight: (
            <Icon onPress={() => _this.props.navigation.navigate('AddShipperOrder')} name={'plus'} size={25} color={'#fff'} style={{paddingRight: 20,}}/>
        ),
    };
    
    constructor(props){
        super(props);
        this.state = {
            shipperOrderData: [],
            spinnerVisible: false,
            searchItem: '',
            filterData: [],
            pagination: {},
            isScrollSpinner: false,
            noMoreData: false,
        };
        _this = this;
    }

    componentDidMount() {
        setTimeout(() => {
            this.checkInternetConnection();
        }, 500);
        this._navListener = this.props.navigation.addListener('didFocus', (playload) => {
            this.getShipperOrder();
            console.log('payload page 2: ', playload);
        });
    }

    componentWillUnmount() {
        this._navListener.remove();
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

    getShipperOrder(){
        this.setState({
            spinnerVisible: true,
        })
        fetch(`${myApiUrl}/${shipperOrderPath}?deviceId=` + deviceId + `&userId=` + loginAsset[0].userId + `&shipperId=` + loginAsset[0].loginUserId, {
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
                    shipperOrderData: json.results,
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

    searchFilterFunction(text){
        const newData = this.state.shipperOrderData.filter(function(item){
            const orderDescription = (item.orderDescription !== null) ? item.orderDescription.toUpperCase() : '';
            const pickUpLocation = item.pickUpLocation.toUpperCase();
            const recipientName = item.recipientName.toUpperCase();
            const recipientAddress = item.recipientAddress.toUpperCase();
            const expectedArrivalDate = item.expectedArrivalDate.toUpperCase();
            const isMatchDescription = item.isMatchDescription.toUpperCase();
            const orderNumber = item.orderNumber.toUpperCase();
            const orderStatus = item.orderStatus.toUpperCase();
            const textData = text.toUpperCase();
            return orderDescription.indexOf(textData) > -1 || 
                pickUpLocation.indexOf(textData) > -1 || 
                recipientName.indexOf(textData) > -1 || 
                recipientAddress.indexOf(textData) > -1 || 
                expectedArrivalDate.indexOf(textData) > -1 || 
                isMatchDescription.indexOf(textData) > -1 || 
                orderNumber.indexOf(textData) > -1 ||
                orderStatus.indexOf(textData) > -1;
        })
        this.setState({
            filterData: newData,
            searchItem: text,
            noMoreData: false,
        })
    }

    isCloseToBottom({layoutMeasurement, contentOffset, contentSize}){
        const paddingToBottom = 20;
        return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
    }

    callPagination(){
        this.setState({
            isScrollSpinner: true,
        })

        count++;
        if(this.state.pagination !== {}){
            if(this.state.pagination.next !== null && count == 1){
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
                            shipperOrderData: [...this.state.shipperOrderData, ...json.results],
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
        var acceptedView = <View style={styles.noListContainer}>
                            <Text style={styles.noListText}>No Shipper Order</Text> 
                          </View>;
        if(this.state.searchItem !== ''){
            if(this.state.filterData.length != 0){
                acceptedView = this.state.filterData.map((item, index) => (
                    <ListItem 
                        key={index}
                        bottomDivider={true}
                        rightIcon={<Icon name='chevron-right' color='#3c4c96' style={{marginLeft: 3, marginRight: 20}}/>}
                        title={ <Text style={styles.listItemText}>{item.orderNumber}</Text> }
                        subtitle={
                            <View style={{paddingTop: 5,}}>
                                <View style={styles.iconView}>
                                    <Icon name={'user'} size={17} color={'#3c4c96'} />
                                    <Text style={styles.listItemText}>  {item.recipientName}</Text>
                                </View>
                                <View style={styles.iconView}>
                                {(item.orderDescription !== "") ? <View style={styles.iconView}>
                                    <Icon name={'info'} size={15} color={'#3c4c96'} style={{marginLeft: 3, marginRight: 6}}/>
                                    <Text style={styles.listItemText}> {item.orderDescription}</Text>    
                                    </View> : <View/>
                                }    
                                </View>
                                <View style={{flexDirection: 'row',}}>
                                    <Icon name={'map-pin'} size={15} color={'#3c4c96'} style={{marginLeft: 2}}/>
                                    <Text style={styles.listItemText}>  {item.pickUpLocation} </Text> 
                                </View>
                                <View style={{flexDirection: 'row', marginLeft: 20,}}>
                                    <Icon name={'long-arrow-right'} size={13} color={'#3c4c96'} style={{marginLeft: 2}}/>
                                    <Text style={styles.listItemText}>  {item.recipientAddress}</Text>    
                                </View>
                                <View style={styles.iconView}>
                                    <Icon name={'calendar'} size={15} color={'#3c4c96'} />
                                    <Text style={styles.listItemText}>  {item.expectedArrivalDate}</Text>
                                </View>
                                <View style={styles.iconView}>
                                    <Icon name={'bookmark'} size={15} color={'#3c4c96'} />
                                    <Text style={styles.listItemText}>  {item.orderStatus}</Text>
                                </View>
                                <View style={styles.listItemView}>
                                    {(item.isMatch) ? <Badge
                                            value={item.isMatchDescription}
                                            textStyle={{ color: '#fff', fontWeight: 'bold', fontSize: 12, }}
                                            containerStyle={{backgroundColor: 'green', width: 90, marginTop: 10, marginLeft: 5,}}
                                        />  : <Badge
                                            value={item.isMatchDescription}
                                            textStyle={{ color: '#3c4c96', fontWeight: 'bold', fontSize: 12, }}
                                            containerStyle={{backgroundColor: '#e0e0e0', width: 90, marginTop: 10, marginLeft: 5,}}
                                        /> 
                                    }
                                </View>
                            </View>
                        }
                        onPress={() => { (item.isMatch) ? this.props.navigation.navigate('ConfirmedOrderDetail', {
                                shipperOrderId: item.shipperOrderId,
                            }) : this.props.navigation.navigate('HistoryOrderDetails', {
                                shipperOrderId: item.shipperOrderId,
                            })
                        }}
                    />
                ))
            }else{
                acceptedView = <View style={styles.noListContainer}>
                                <Text style={styles.noListText}>No Result</Text> 
                              </View>;
            }
        }else{
            if(this.state.shipperOrderData !== [] && this.state.shipperOrderData.length > 0){
                acceptedView = this.state.shipperOrderData.map((item, index) => (
                    <ListItem 
                        key={index}
                        bottomDivider={true}
                        rightIcon={<Icon name='chevron-right' color='#3c4c96' style={{marginLeft: 3, marginRight: 20}}/>}
                        title={ <Text style={styles.listItemText}>{item.orderNumber}</Text> }
                        subtitle={
                            <View style={{paddingTop: 5, }}>
                                <View style={styles.iconView}>
                                    <Icon name={'user'} size={17} color={'#3c4c96'} />
                                    <Text style={styles.listItemText}>  {item.recipientName}</Text>
                                </View>
                                <View style={styles.iconView}>
                                {(item.orderDescription !== "") ? <View style={styles.iconView}>
                                    <Icon name={'info'} size={15} color={'#3c4c96'} style={{marginLeft: 3, marginRight: 6}}/>
                                    <Text style={styles.listItemText}> {item.orderDescription}</Text>    
                                    </View> : <View/>
                                }    
                                </View>
                                <View style={{flexDirection: 'row',}}>
                                    <Icon name={'map-pin'} size={15} color={'#3c4c96'} style={{marginLeft: 2}}/>
                                    <Text style={styles.listItemText}>  {item.pickUpLocation} </Text> 
                                </View>
                                <View style={{flexDirection: 'row', marginLeft: 20,}}>
                                    <Icon name={'long-arrow-right'} size={13} color={'#3c4c96'} style={{marginLeft: 2}}/>
                                    <Text style={styles.listItemText}>  {item.recipientAddress}</Text>    
                                </View>
                                <View style={styles.iconView}>
                                    <Icon name={'calendar'} size={15} color={'#3c4c96'} />
                                    <Text style={styles.listItemText}>  {item.expectedArrivalDate}</Text>
                                </View>
                                <View style={styles.iconView}>
                                    <Icon name={'bookmark'} size={15} color={'#3c4c96'} />
                                    <Text style={styles.listItemText}>  {item.orderStatus}</Text>
                                </View>
                                <View>
                                    {(item.isMatch) ? <Badge
                                            value={item.isMatchDescription}
                                            textStyle={{ color: '#fff', fontWeight: 'bold', fontSize: 12, }}
                                            containerStyle={{backgroundColor: 'green', width: 90, marginTop: 10, marginLeft: 5,}}
                                        />  : <Badge
                                            value={item.isMatchDescription}
                                            textStyle={{ color: '#3c4c96', fontWeight: 'bold', fontSize: 12, }}
                                            containerStyle={{backgroundColor: '#e0e0e0', width: 90, marginTop: 10, marginLeft: 5,}}
                                        /> 
                                    }
                                </View>
                            </View>
                        }
                        onPress={() => { (item.isMatch) ? this.props.navigation.navigate('ConfirmedOrderDetail', {
                                shipperOrderId: item.shipperOrderId,
                            }) : this.props.navigation.navigate('HistoryOrderDetails', {
                                shipperOrderId: item.shipperOrderId,
                            })
                        }}
                    />
                ))
            }
        }
        console.log('search: ', this.state.searchItem);
        if(this.state.searchItem !== ''){

        }
        return(
            <View style={{flex: 1, backgroundColor: '#fff',}}>
                <SearchBar
                    platform={Platform.OS}
                    lightTheme
                    containerStyle={{backgroundColor:'#fff'}}
                    value={this.state.searchItem}
                    onChangeText={(text) => {
                        this.searchFilterFunction(text);
                    }}
                    onClear={(text) => {
                        this.setState({
                            searchItem: '',
                        })
                    }}
                    placeholder='Search' /> 
                <ScrollView style={styles.historyView}
                    onScroll={({nativeEvent}) => {
                        // console.log('scrolling ', nativeEvent);
                        if (this.isCloseToBottom(nativeEvent)) {
                            this.callPagination();
                            // console.log('end');
                        }
                    }}
                    scrollEventThrottle={0}>
                    {
                        (this.state.spinnerVisible) ? <View style={{marginBottom: 20, marginTop: 20, alignItems: 'center',}}>
                                <Spinner
                                    isVisible={this.state.spinnerVisible}
                                    type={'9CubeGrid'}
                                    color='#3c4c96'
                                    paddingLeft={20}
                                    size={50}/>
                            </View> : <View>
                                {acceptedView}
                                {(this.state.isScrollSpinner) ? <View style={{marginBottom: 20, marginTop: 20, alignItems: 'center',}}>
                                        <Spinner
                                            isVisible={this.state.isScrollSpinner}
                                            type={'9CubeGrid'}
                                            color='#3c4c96'
                                            paddingLeft={20}
                                            size={50}/>
                                    </View> : (this.state.noMoreData) ? <View style={styles.noListContainer}>
                                        <Text style={styles.noListText}>No More Shipper Order</Text> 
                                    </View>
                                    : <View/>
                                }
                            </View>
                    }
                </ScrollView>
            </View>
        )
    }
}