import React, { Component } from 'react';
import { StyleSheet, TextInput, Text, View, Alert, PermissionsAndroid, Platform, } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import NetworkConnection from '../utils/NetworkConnection';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import Geocoder from 'react-native-geocoding';
  
export default class Map extends Component{
    static navigationOptions = ({ navigation }) => ({
        title: `${navigation.state.params.title}`,
        headerRight: (
            <Icon onPress={() => {
                _this.props.navigation.state.params.onGoBack(_this.props.navigation.getParam('type'), _this.state.searchLocation, _this.state.lastLat, _this.state.lastLong); 
                _this.props.navigation.goBack();
            }} name={'check'} size={25} color={'#fff'} style={{paddingRight: 20,}}/>
        ),
    })
    
    constructor(props){
        super(props);
        this.state = {
            mapRegion: null,
            lastLat: null,
            lastLong: null,
            searchLocation: '',
            getLocation: '',
        }
        _this = this;
    }

    async requestLocationPermission() {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: 'Liners requires your location Permission',
              message:
                'Liners needs access to your location ' +
                'so you can pick the location.',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            },
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log('You can use google map');
            this.watchID = navigator.geolocation.watchPosition((position) => {
                console.log(position)
                let region = {
                    latitude:       position.coords.latitude,
                    longitude:      position.coords.longitude,
                    latitudeDelta:  0.00922*1.5,
                    longitudeDelta: 0.00421*1.5
                }
                this.onRegionChange(region, region.latitude, region.longitude);
                this.getAddress()
            }, (error)=>console.log(error));
          } else {
            console.log('Google Map permission denied');
          }
        } catch (err) {
          console.warn(err);
        }
      }

    componentDidMount() {
        setTimeout(() => {
            this.checkInternetConnection();
        }, 500);
        if(Platform.OS === 'ios'){
            this.watchID = navigator.geolocation.watchPosition((position) => {
                console.log(position)
                let region = {
                    latitude:       position.coords.latitude,
                    longitude:      position.coords.longitude,
                    latitudeDelta:  0.00922*1.5,
                    longitudeDelta: 0.00421*1.5
                }
                this.onRegionChange(region, region.latitude, region.longitude);
                this.getAddress()
            }, (error)=>console.log(error));
        }else{
            this.requestLocationPermission()
        }
        Geocoder.init('AIzaSyCgGvYKsFv6HeUdTF-8FdE389pYjBOolvc');
    }

    componentWillUnmount() {
        navigator.geolocation.clearWatch(this.watchID);
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
      
    onRegionChange(region, lastLat, lastLong) {
        this.setState({
            mapRegion: region,
            lastLat: lastLat || this.state.lastLat,
            lastLong: lastLong || this.state.lastLong
        });
    }

    getCoordination(){
        Geocoder.from(this.state.searchLocation)
		.then(json => {
			var location = json.results[0].geometry.location;
            console.log(json.results[0].geometry);
            let region = {
                latitude:       location.lat,
                longitude:      location.lng,
                latitudeDelta:  0.00922*1.5,
                longitudeDelta: 0.00421*1.5
            }
            this.onRegionChange(region, location.lat, location.lng);
		})
		.catch(error => console.warn(error));
    }

    getAddress(){
        Geocoder.from(this.state.lastLat, this.state.lastLong)
		.then(json => {
        	var addressComponent = json.results[0].address_components[0];
            console.log(addressComponent);
            this.setState({
                searchLocation: addressComponent.long_name,
            })
		})
		.catch(error => console.warn(error));
    }

    render(){
        return(
            <View style={styles.container}>
                <TextInput
                    style={styles.input}
                    autoCapitalize="none"
                    underlineColorAndroid={'transparent'}
                    autoCorrect={false}
                    keyboardType='default'
                    returnKeyLabel="next"
                    placeholder='Search Location'
                    placeholderTextColor='#939ABA'
                    value={this.state.searchLocation}
                    onChangeText={(text) => {
                        this.setState({ searchLocation: text })
                    }}  
                    onEndEditing={() => {
                        console.log('ended')
                        this.getCoordination()
                    }}/>
                <MapView
                    provider={PROVIDER_GOOGLE}
                    style={styles.map}
                    region={this.state.mapRegion}
                    onRegionChange={this.onRegionChange.bind(this)}>
                    <MapView.Marker
                        draggable
                        coordinate={{
                            latitude: (this.state.lastLat) || -36.82339,
                            longitude: (this.state.lastLong) || -73.03569,
                        }}
                        onDragEnd={(e) => {
                            console.log(e.nativeEvent.coordinate) 
                            this.setState({
                                lastLat: e.nativeEvent.coordinate.latitude,
                                lastLong: e.nativeEvent.coordinate.longitude,
                            })
                            this.getAddress()
                        }} />
                </MapView>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
    map: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    input: {
        height: 50, 
        backgroundColor: '#fff', 
        marginBottom: 5, 
        padding: 10, 
        color: '#3c4c96', 
        fontSize: 20, 
        borderColor: '#3c4c96', 
        borderWidth: 1, 
        fontFamily: 'Raleway-Bold', 
        position: 'absolute',
        top: 10,
        left: 10,
        right: 10,
        zIndex: 9999,
    },  
  });