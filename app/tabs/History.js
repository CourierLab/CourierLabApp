import React, { Component } from 'react';
import { View, Text, Platform, ScrollView, Alert, RefreshControl, } from 'react-native';
import { styles } from '../utils/Style';
import NetworkConnection from '../utils/NetworkConnection';
import DeviceInfo from 'react-native-device-info';
import MyRealm from '../utils/Realm';
import Spinner from 'react-native-spinkit';
import { SearchBar, ListItem, Badge, } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import FeatherIcon from 'react-native-vector-icons/Feather';
import EntypoIcon from 'react-native-vector-icons/Entypo';
import AntIcon from 'react-native-vector-icons/AntDesign';

let myApiUrl = 'http://courierlabapi.azurewebsites.net/api/v1/MobileApi';
let driverOrderPath = 'ViewDriverOrder';
let deviceId = DeviceInfo.getUniqueID();
let realm = new MyRealm();
let loginAsset = realm.objects('LoginAsset');
let count = 0;

export default class History extends Component{
    static navigationOptions = {
        // title: 'Order History',
        headerTitle: <View style={{flexDirection: 'row',}}>
                <FeatherIcon name="truck" size={19} color="#fff" style={{paddingLeft: 10, paddingRight: 10,}}/>
                <Text style={{color: '#fff', fontWeight: 'bold', fontFamily: 'AvenirLTStd-Black', fontSize: 15, paddingTop: 3,}}>Order History</Text>
            </View>,
        headerRight: (
            <EntypoIcon onPress={() => _this.props.navigation.navigate('AddDriverOrder')} name={'plus'} size={25} color={'#fff'} style={{paddingRight: 20,}}/>
        ),
    };
    
    constructor(props){
        super(props);
        this.state = {
            driverOrderData: [],
            allDriverOrderData: [],
            spinnerVisible: false,
            searchItem: '',
            filterData: [],
            pagination: {},
            allPagination: {},
            isScrollSpinner: false,
            noMoreData: false,
        };
        _this = this;
    }

    componentDidMount() {
        setTimeout(() => {
            this.checkInternetConnection();
        }, 500);
        // this.getDriverOrder();

        this._navListener = this.props.navigation.addListener('willFocus', (playload) => {
            this.getDriverOrder();
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

    _onRefresh = () => {
        // this.setState({refreshing: true})
        this.getDriverOrder()
        // this.setState({refreshing: false})
    }

    refreshOrder(){

    }

    async getDriverOrder(){
        var number = 0
        this.setState({
            spinnerVisible: true,
        })
        await fetch(`${myApiUrl}/${driverOrderPath}?deviceId=` + deviceId + `&userId=` + loginAsset[0].userId + `&driverId=` + loginAsset[0].loginUserId, {
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
                var last = json.paging.last
                var page = last.split('&')
                var pageNumber = page[3].lastIndexOf('=')
                number = page[3].substring(pageNumber + 1)
                this.setState({
                    driverOrderData: json.results,
                    allDriverOrderData: json.results,
                    pagination: json.paging,
                    allPagination: json.paging,
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

        for(var i=1; i<number; i++){
            await fetch(this.state.allPagination.next, {
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
                        allDriverOrderData: [...this.state.allDriverOrderData, ...json.results],
                        allPagination: json.paging,
                    });
                }
                console.log('latest paging: ', json.paging);
            }).catch(err => {
                console.log(err);
            });
        }
    }

    searchFilterFunction(text){
        const newData = this.state.allDriverOrderData.filter(function(item){
            const orderDescription = (item.orderDescription !== null) ? item.orderDescription.toUpperCase() : '';
            const departLocation = item.departLocation.toUpperCase();
            const arriveLocation = item.arriveLocation.toUpperCase();
            const expectedDepartureDate = item.expectedDepartureDate.toUpperCase();
            const expectedArrivalDate = item.expectedArrivalDate.toUpperCase();
            const isMatchDescription = item.isMatchDescription.toUpperCase();
            const orderNumber = item.orderNumber.toUpperCase();
            const orderStatus = item.orderStatus.toUpperCase();
            const textData = text.toUpperCase();
            return orderDescription.indexOf(textData) > -1 || 
                departLocation.indexOf(textData) > -1 || 
                arriveLocation.indexOf(textData) > -1 || 
                expectedDepartureDate.indexOf(textData) > -1 || 
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
                            driverOrderData: [...this.state.driverOrderData, ...json.results],
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
                            <Text style={{color: '#9B9B9B', fontSize: 14, fontFamily: 'AvenirLTStd-Roman', paddingTop: 10,}}>No Driver Order</Text> 
                          </View>;
        if(this.state.searchItem !== ''){
            if(this.state.filterData.length != 0){
                acceptedView = this.state.filterData.map((item, index) => (
                    <ListItem 
                        key={index}
                        // bottomDivider={true}
                        // rightIcon={<Icon name='chevron-right' color='#3c4c96' style={{marginLeft: 3, marginRight: 20}}/>}
                        // title={ <Text style={styles.listItemText}>{item.orderNumber}</Text> }
                        subtitle={
                            // <View style={{paddingTop: 5,}}>
                            //     <View style={styles.iconView}>
                            //     {(item.orderDescription !== "") ? <View style={styles.iconView}>
                            //         <Icon name={'info'} size={15} color={'#3c4c96'} style={{marginLeft: 3, marginRight: 6}}/>
                            //         <Text style={styles.listItemText}> {item.orderDescription}</Text>    
                            //         </View> : <View/>
                            //     }    
                            //     </View>
                            //     <View style={{flexDirection: 'row',}}>
                            //         <Icon name={'map-pin'} size={15} color={'#3c4c96'} style={{marginLeft: 2}}/>
                            //         <Text style={styles.listItemText}>  {item.departLocation} </Text> 
                            //     </View>
                            //     <View style={{flexDirection: 'row', marginLeft: 20,}}>
                            //         <Icon name={'long-arrow-right'} size={13} color={'#3c4c96'} style={{marginLeft: 2}}/>
                            //         <Text style={styles.listItemText}>  {item.arriveLocation}</Text>    
                            //     </View>
                            //     <View style={styles.iconView}>
                            //         <Icon name={'calendar'} size={15} color={'#3c4c96'} />
                            //         <Text style={styles.listItemText}> {item.expectedDepartureDate} </Text>
                            //     </View>
                            //     <View style={{flexDirection: 'row', marginLeft: 20,}}>
                            //         <Icon name={'long-arrow-right'} size={13} color={'#3c4c96'} style={{marginLeft: 2}}/>
                            //         <Text style={styles.listItemText}>  {item.expectedArrivalDate}</Text>   
                            //     </View>
                            //     <View style={styles.iconView}>
                            //         <Icon name={'bookmark'} size={15} color={'#3c4c96'} />
                            //         <Text style={styles.listItemText}>  {item.orderStatus}</Text>
                            //     </View>
                            //     <View style={styles.listItemView}>
                            //         {(item.isMatch) ? <Badge
                            //                 value={item.isMatchDescription}
                            //                 textStyle={{ color: '#fff', fontWeight: 'bold', fontSize: 12, }}
                            //                 containerStyle={{backgroundColor: 'green', width: 90, marginTop: 10, marginLeft: 5,}}
                            //             />  : <Badge
                            //                 value={item.isMatchDescription}
                            //                 textStyle={{ color: '#3c4c96', fontWeight: 'bold', fontSize: 12, }}
                            //                 containerStyle={{backgroundColor: '#e0e0e0', width: 90, marginTop: 10, marginLeft: 5,}}
                            //             /> 
                            //         }
                            //     </View>
                            // </View>

                            <View style={{margin: 0, padding: 20, marginBottom: -10, backgroundColor: '#EFEFEF', borderRadius: 20,}}>
                                <View style={{flexDirection: 'row', justifyContent: 'space-between', }}>
                                    <Text style={{fontSize: 14, fontFamily: 'AvenirLTStd-Black', color: '#2C2E6D',}}>{item.orderNumber}</Text>
                                    <Text style={{fontSize: 14, fontFamily: 'AvenirLTStd-Roman', color: '#2C2E6D',}}>more info</Text>
                                </View>
                                <View style={{flexDirection: 'row', paddingTop: 10,}}>
                                    <Text style={{fontSize: 14, fontFamily: 'AvenirLTStd-Roman', color: '#2C2E6D',}}>{item.isMatchDescription}</Text>
                                </View>
                                <View style={{flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10, }}>
                                    <View style={{flexDirection: 'column', width: '40%',}}>
                                        <Text style={{fontSize: 14, fontFamily: 'AvenirLTStd-Black', color: '#2C2E6D',}}>{item.departLocation}</Text>
                                        <Text style={{fontSize: 14, fontFamily: 'AvenirLTStd-Roman', color: '#2C2E6D',}}>{item.expectedDepartureDate}</Text>
                                    </View>
                                    <View style={{flexDirection: 'column', width: '20%', justifyContent: 'center',}}>
                                        <AntIcon name="swapright" size={40} color="#2C2E6D" style={{paddingLeft: 5, paddingRight: 5,}}/>
                                    </View>
                                    <View style={{flexDirection: 'column', width: '40%',}}>
                                        <Text style={{fontSize: 14, fontFamily: 'AvenirLTStd-Black', color: '#2C2E6D',}}>{item.arriveLocation}</Text>
                                        <Text style={{fontSize: 14, fontFamily: 'AvenirLTStd-Roman', color: '#2C2E6D',}}>{item.expectedArrivalDate}</Text>
                                    </View>
                                </View>
                            </View>
                        }
                        onPress={() => { (item.isMatch) ? this.props.navigation.navigate('ConfirmedOrderDetail', {
                                driverOrderId: item.driverOrderId,
                            }) : this.props.navigation.navigate('HistoryOrderDetails', {
                                driverOrderId: item.driverOrderId,
                            })
                        }}
                    />
                ))
            }else{
                acceptedView = <View style={styles.noListContainer}>
                                <Text style={{color: '#9B9B9B', fontSize: 14, fontFamily: 'AvenirLTStd-Roman', paddingTop: 10,}}>No Result</Text> 
                              </View>;
            }
        }else{
            if(this.state.driverOrderData !== [] && this.state.driverOrderData.length > 0){
                acceptedView = this.state.driverOrderData.map((item, index) => (
                    <ListItem 
                        key={index}
                        // bottomDivider={true}
                        // rightIcon={<Icon name='chevron-right' color='#3c4c96' style={{marginLeft: 3, marginRight: 20}}/>}
                        // title={ <Text style={styles.listItemText}>{item.orderNumber}</Text> }
                        subtitle={
                            // <View style={{paddingTop: 5, }}>
                            //     <View style={styles.iconView}>
                            //     {(item.orderDescription !== "") ? <View style={styles.iconView}>
                            //         <Icon name={'info'} size={15} color={'#3c4c96'} style={{marginLeft: 3, marginRight: 6}}/>
                            //         <Text style={styles.listItemText}> {item.orderDescription}</Text>    
                            //         </View> : <View/>
                            //     }    
                            //     </View>
                            //     <View style={{flexDirection: 'row',}}>
                            //         <Icon name={'map-pin'} size={15} color={'#3c4c96'} style={{marginLeft: 2}}/>
                            //         <Text style={styles.listItemText}>  {item.departLocation} </Text> 
                            //     </View>
                            //     <View style={{flexDirection: 'row', marginLeft: 20,}}>
                            //         <Icon name={'long-arrow-right'} size={13} color={'#3c4c96'} style={{marginLeft: 2}}/>
                            //         <Text style={styles.listItemText}>  {item.arriveLocation}</Text>    
                            //     </View>
                            //     <View style={styles.iconView}>
                            //         <Icon name={'calendar'} size={15} color={'#3c4c96'} />
                            //         <Text style={styles.listItemText}> {item.expectedDepartureDate} </Text>
                            //     </View>
                            //     <View style={{flexDirection: 'row', marginLeft: 20,}}>
                            //         <Icon name={'long-arrow-right'} size={13} color={'#3c4c96'} style={{marginLeft: 2}}/>
                            //         <Text style={styles.listItemText}>  {item.expectedArrivalDate}</Text>   
                            //     </View>
                            //     <View style={styles.iconView}>
                            //         <Icon name={'bookmark'} size={15} color={'#3c4c96'} />
                            //         <Text style={styles.listItemText}>  {item.orderStatus}</Text>
                            //     </View>
                            //     <View>
                            //         {(item.isMatch) ? <Badge
                            //                 value={item.isMatchDescription}
                            //                 textStyle={{ color: '#fff', fontWeight: 'bold', fontSize: 12, }}
                            //                 containerStyle={{backgroundColor: 'green', width: 90, marginTop: 10, marginLeft: 5,}}
                            //             />  : <Badge
                            //                 value={item.isMatchDescription}
                            //                 textStyle={{ color: '#3c4c96', fontWeight: 'bold', fontSize: 12, }}
                            //                 containerStyle={{backgroundColor: '#e0e0e0', width: 90, marginTop: 10, marginLeft: 5,}}
                            //             /> 
                            //         }
                            //     </View>
                            // </View>
                            <View style={{margin: 0, padding: 20, marginBottom: -10, backgroundColor: '#EFEFEF', borderRadius: 20,}}>
                                <View style={{flexDirection: 'row', justifyContent: 'space-between', }}>
                                    <Text style={{fontSize: 14, fontFamily: 'AvenirLTStd-Black', color: '#2C2E6D',}}>{item.orderNumber}</Text>
                                    <Text style={{fontSize: 14, fontFamily: 'AvenirLTStd-Roman', color: '#2C2E6D',}}>more info</Text>
                                </View>
                                <View style={{flexDirection: 'row', paddingTop: 10,}}>
                                    <Text style={{fontSize: 14, fontFamily: 'AvenirLTStd-Roman', color: '#2C2E6D',}}>{item.isMatchDescription}</Text>
                                </View>
                                <View style={{flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10, }}>
                                    <View style={{flexDirection: 'column', width: '40%',}}>
                                        <Text style={{fontSize: 14, fontFamily: 'AvenirLTStd-Black', color: '#2C2E6D',}}>{item.departLocation}</Text>
                                        <Text style={{fontSize: 14, fontFamily: 'AvenirLTStd-Roman', color: '#2C2E6D',}}>{item.expectedDepartureDate}</Text>
                                    </View>
                                    <View style={{flexDirection: 'column', width: '20%', justifyContent: 'center',}}>
                                        <AntIcon name="swapright" size={40} color="#2C2E6D" style={{paddingLeft: 5, paddingRight: 5,}}/>
                                    </View>
                                    <View style={{flexDirection: 'column', width: '40%',}}>
                                        <Text style={{fontSize: 14, fontFamily: 'AvenirLTStd-Black', color: '#2C2E6D',}}>{item.arriveLocation}</Text>
                                        <Text style={{fontSize: 14, fontFamily: 'AvenirLTStd-Roman', color: '#2C2E6D',}}>{item.expectedArrivalDate}</Text>
                                    </View>
                                </View>
                            </View>
                        }
                        onPress={() => { (item.isMatch) ? this.props.navigation.navigate('ConfirmedOrderDetail', {
                                driverOrderId: item.driverOrderId,
                            }) : this.props.navigation.navigate('HistoryOrderDetails', {
                                driverOrderId: item.driverOrderId,
                            })
                        }}
                    />
                ))
            }
        }
        console.log('search: ', this.state.searchItem);
        
        return(
            <View style={{flex: 1, backgroundColor: '#fff',}}>
                <SearchBar
                    platform={Platform.OS}
                    lightTheme
                    containerStyle={{backgroundColor:'#fff', borderBottomColor: '#EFEFEF', borderBottomWidth: 1,}}
                    inputStyle={{color: '#3c4c96',}}
                    placeholderTextColor='#A3A9C4'
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
                <ScrollView style={{paddingBottom: 20,}}
                    onScroll={({nativeEvent}) => {
                        // console.log('scrolling ', nativeEvent);
                        if (this.isCloseToBottom(nativeEvent)) {
                            this.callPagination();
                            // console.log('end');
                        }
                    }}
                    scrollEventThrottle={0}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={false}
                            onRefresh={this._onRefresh}
                        />
                    }>
                    {
                        (this.state.spinnerVisible) ? <View style={{marginBottom: 20, marginTop: 20, alignItems: 'center',}}>
                                <Spinner
                                    isVisible={this.state.spinnerVisible}
                                    type={'ThreeBounce'}
                                    color='#F4D549'
                                    size={30}/>
                            </View> : <View>
                                {acceptedView}
                                {(this.state.isScrollSpinner) ? <View style={{marginBottom: 20, marginTop: 20, alignItems: 'center',}}>
                                        <Spinner
                                            isVisible={this.state.isScrollSpinner}
                                            type={'ThreeBounce'}
                                            color='#F4D549'
                                            size={30}/>
                                    </View> : (this.state.noMoreData) ? <View style={styles.noListContainer}>
                                        <Text style={{color: '#9B9B9B', fontSize: 14, fontFamily: 'AvenirLTStd-Roman', paddingTop: 10,}}>No More Driver Order</Text> 
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