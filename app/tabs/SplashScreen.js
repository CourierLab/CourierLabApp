import React from 'react';
import { Dimensions, StyleSheet, View, Image, } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import MyRealm from '../utils/Realm';

let myApiUrl = 'http://courierlabapi.azurewebsites.net/api/v1/MobileApi';
let driverOrderPath = 'ViewDriverOrder';
let shipperOrderPath = 'ViewShipperOrder';
let realm = new MyRealm();
let {height, width} = Dimensions.get('window');
let loginAsset = realm.objects('LoginAsset');
let deviceId = DeviceInfo.getUniqueID();

export default class SplashScreen extends React.Component {
    static navigationOptions = {
        header: null,
    }
    
    constructor(props){
        super(props);
        // this.state = {
        //     driverOrderData: [],
        //     shipperOrderData: [],
        //     pagination: [],
        // };
        // this._isMounted = false
        _this = this;
    }

    componentDidMount() {
        setTimeout(() => {
            // this._isMounted = true 
            // this._isMounted && this.getData()
            this.props.navigation.navigate('Login')
        }, 3000);
    }

    // componentWillUnmount(){
    //     this._isMounted = false
    // }

    // async getData(){
    //     var number = 0
    //     if(loginAsset[0] !== undefined){          
    //         if(loginAsset[0].roleName === "Driver"){
    //             await fetch(`${myApiUrl}/${driverOrderPath}?deviceId=` + deviceId + `&userId=` + loginAsset[0].userId + `&driverId=` + loginAsset[0].loginUserId, {
    //                 method: 'GET',
    //                 headers: {
    //                     'Accept': 'application/json',
    //                     'Content-Type': 'application/json',
    //                     'Authorization': loginAsset[0].accessToken,
    //                 },
    //             })
    //             .then((response) => response.json())
    //             .then((json) => {
    //                 console.log('getResult: ', json);
    //                 if(json.succeeded){
    //                     var last = json.paging.last
    //                     var page = last.split('&')
    //                     var pageNumber = page[3].lastIndexOf('=')
    //                     number = page[3].substring(pageNumber + 1)
    //                     this._isMounted && this.setState({
    //                         driverOrderData: json.results,
    //                         pagination: json.paging,
    //                     });

    //                     for(var i=0; i<json.results; i++){
    //                         realm.write(() => {
    //                             realm.create('DriverOrderData', {
    //                                 driverOrderId: json.results[i].driverOrderId,
    //                                 arriveLocation: json.results[i].arriveLocation,
    //                                 createdAt: json.results[i].createdAt,
    //                                 departLocation: json.results[i].departLocation,
    //                                 expectedArrivalDate: json.results[i].expectedArrivalDate,
    //                                 expectedDepartureDate: json.results[i].expectedDepartureDate,
    //                                 isMatch: json.results[i].isMatch,
    //                                 isMatchDescription: json.results[i].isMatchDescription,
    //                                 isReturn: json.results[i].isReturn,
    //                                 orderDescription: json.results[i].orderDescription,
    //                                 orderNumber: json.results[i].orderNumber,
    //                                 orderStatus: json.results[i].orderStatus,
    //                                 vehicleSpecifications: json.results[i].vehicleSpecifications,
    //                             })
    //                         })
    //                     }
    //                 }
    //             }).catch(err => {
    //                 console.log(err);
    //             });

    //             for(var i=1; i<number; i++){
    //                 await fetch(this.state.pagination.next, {
    //                     method: 'GET',
    //                     headers: {
    //                         'Accept': 'application/json',
    //                         'Content-Type': 'application/json',
    //                         'Authorization': loginAsset[0].accessToken,
    //                     },
    //                 })
    //                 .then((response) => response.json())
    //                 .then((json) => {
    //                     if(json.succeeded){
    //                         this._isMounted && this.setState({
    //                             driverOrderData: [...this.state.driverOrderData, ...json.results],
    //                             pagination: json.paging,
    //                         });
    //                         for(var j=0; j<json.results; j++){
    //                             realm.write(() => {
    //                                 realm.create('DriverOrderData', {
    //                                     driverOrderId: json.results[j].driverOrderId,
    //                                     arriveLocation: json.results[j].arriveLocation,
    //                                     createdAt: json.results[j].createdAt,
    //                                     departLocation: json.results[j].departLocation,
    //                                     expectedArrivalDate: json.results[j].expectedArrivalDate,
    //                                     expectedDepartureDate: json.results[j].expectedDepartureDate,
    //                                     isMatch: json.results[j].isMatch,
    //                                     isMatchDescription: json.results[j].isMatchDescription,
    //                                     isReturn: json.results[j].isReturn,
    //                                     orderDescription: json.results[j].orderDescription,
    //                                     orderNumber: json.results[j].orderNumber,
    //                                     orderStatus: json.results[j].orderStatus,
    //                                     vehicleSpecifications: json.results[j].vehicleSpecifications,
    //                                 })
    //                             })
    //                         }
    //                     }
    //                     console.log('latest paging: ', json.paging);
    //                 }).catch(err => {
    //                     console.log(err);
    //                 });
    //             }
    //         }else{
                
    //         }
    //     }
    //     this.props.navigation.navigate('Login')
    // }

    render() {
        return (
        <View style={styles.container}>
            <Image resizeMode="contain" style={{width: width-100, height: 64,}} source={require('../assets/logo.png')} />
        </View>
        );
    }
}


let styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2C3789',
    padding: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});