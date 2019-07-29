import React, { Component } from 'react';
import { StyleSheet, TextInput, Dimensions, Text, View, Alert, PermissionsAndroid, Platform, TouchableOpacity, Modal, ScrollView, } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialComIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import OctiIcon from 'react-native-vector-icons/Octicons';
import SimIcon from 'react-native-vector-icons/SimpleLineIcons';
import NetworkConnection from '../utils/NetworkConnection';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import Geocoder from 'react-native-geocoding';
import RNGooglePlaces from 'react-native-google-places';
import { ListItem } from 'react-native-elements';

let { height, width } = Dimensions.get('window');

export default class Map extends Component{
    static navigationOptions = ({ navigation }) => ({
        // title: `${navigation.state.params.title}`,
        headerTitle: <View style={{flexDirection: 'row',}}>
                <MaterialComIcon name="map-marker-outline" size={19} color="#fff" style={{paddingLeft: 10, paddingRight: 10,}}/>
                <Text style={{color: '#fff', fontWeight: 'bold', fontFamily: 'AvenirLTStd-Black', fontSize: 15, paddingTop: 3,}}>{navigation.state.params.title}</Text>
            </View>,
        headerRight: (
            <MaterialComIcon onPress={() => {
                console.log(_this.state.invalidAddress)
                if(_this.state.invalidAddress){
                    Alert.alert('Unable to get the location', 'Please enter a valid location before proceed', [
                    {
                        text: 'OK',
                        onPress: () => {
                            _this.setState({
                                invalidAddress: true,
                            })
                        }
                    }], {cancelable: false})
                }else{
                    _this.props.navigation.state.params.onGoBack(_this.props.navigation.getParam('type'), _this.state.searchLocation, _this.state.lastLat, _this.state.lastLong); 
                    _this.props.navigation.goBack();
                }
            }} name={'check-outline'} size={25} color={'#fff'} style={{paddingRight: 20,}}/>
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
            invalidAddress: false,
            nearbyLocation: null,
            nearbyList: [],
            modalVisible: false,
        }
        _this = this;
    }

    setModalVisible(visible) {
        this.setState({modalVisible: visible});
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
        console.log(region)
        this.setState({
            mapRegion: region,
            lastLat: lastLat || this.state.lastLat,
            lastLong: lastLong || this.state.lastLong
        });
    }

    async getCoordination(){
        console.log(this.state.searchLocation)
        await Geocoder.from(this.state.searchLocation)
		.then(json => {
			var location = json.results[0].geometry.location;
            console.log(json.results[0].geometry);
            let region = {
                latitude: location.lat,
                longitude: location.lng,
                latitudeDelta:  0.00922*1.5,
                longitudeDelta: 0.00421*1.5
            }
            this.onRegionChange(region, location.lat, location.lng);
		})
		.catch(error => {
            Alert.alert('Unable to get the location', 'Please enter a valid location', [
            {
                text: 'OK',
                onPress: () => {
                    this.setState({
                        invalidAddress: true,
                    })
                }
            }], {cancelable: false})
            console.warn(error)
        });
    }

    async getAddress(){
        let region = {
            latitude: this.state.lastLat,
            longitude: this.state.lastLong,
            latitudeDelta:  0.00922*1.5,
            longitudeDelta: 0.00421*1.5
        }
        this.setState({
            mapRegion: region,
        })
        await Geocoder.from(this.state.lastLat, this.state.lastLong)
		.then(json => {
        	var addressComponent = json.results[0];
            console.log(json);
            this.setState({
                searchLocation: addressComponent.formatted_address,
                invalidAddress: false,
                nearbyLocation: addressComponent.address_components[1].long_name,
            })
		})
		.catch(error => {
            this.setState({
                invalidAddress: true,
            })
            console.warn(error)
        });

        console.log(this.state.searchLocation)
        this.searchFilterFunction()
    }

    async searchFilterFunction(){
        await RNGooglePlaces.getAutocompletePredictions(this.state.searchLocation)
        .then((results) => {
            console.log(results)
            this.setState({
                nearbyList: results,
            })
        }).catch((error) => 
            console.log(error.message)
        );
    }

    render(){
        return(
            <View style={styles.container}>
                <MapView
                    provider={PROVIDER_GOOGLE}
                    style={styles.map}
                    region={this.state.mapRegion}
                    onRegionChange={() => this.onRegionChange.bind(this)}>
                    <MapView.Marker
                        draggable
                        tracksViewChanges={false}
                        coordinate={{
                            latitude: (this.state.lastLat) || -36.82339,
                            longitude: (this.state.lastLong) || -73.03569,
                        }}
                        onDragEnd={(e) => {
                            console.log(e.nativeEvent.coordinate) 
                            this.setState({
                                lastLat: e.nativeEvent.coordinate.latitude,
                                lastLong: e.nativeEvent.coordinate.longitude,
                            }, function(){
                                this.getAddress()
                            })
                        }} />
                </MapView>
                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={this.state.modalVisible}
                    onRequestClose={() => {
                        Alert.alert('Modal has been closed.');
                    }}> 
                    <View style={{flex: 1, }}>
                        <View styl={{justifyContent: 'center', alignItems:'flex-end',}}>
                            <TouchableOpacity
                                style={{height: (Platform.OS === 'ios') ? height*0.1 : height*0.07, backgroundColor: '#3c4c96',}}
                                onPress={() => {
                                    this.setModalVisible(!this.state.modalVisible)
                                }}>
                                <Icon name={'times'} size={25} color={'#fff'} style={{justifyContent: 'center', alignSelf:'flex-end', bottom: 0, right: 20, top: (Platform.OS === 'ios') ? height*0.055 : height*0.02,}}/>
                            </TouchableOpacity>
                        </View>
                        <TextInput
                            style={{fontSize: 14, fontFamily: 'AvenirLTStd-Roman', color: '#3c4c96', borderColor: '#A3A9C4', borderWidth: 1, height: 40, paddingLeft: 10, paddingRight: 10,}}
                            autoCapitalize="none"
                            underlineColorAndroid={'transparent'}
                            autoCorrect={false}
                            keyboardType='default'
                            returnKeyLabel="next"
                            placeholder='Search Location'
                            placeholderTextColor='#A3A9C4'
                            value={this.state.searchLocation}
                            onChangeText={(text) => {
                                this.setState({ searchLocation: text })
                            }}  
                            onEndEditing={() => {
                                console.log('ended')
                                this.searchFilterFunction()
                            }}
                        />
                        <View style={{borderTopWidth: 1, borderColor: '#DBDBDB',}} />
                        <ScrollView styl={{justifyContent: 'center', alignItems:'flex-start',}}>
                            {(this.state.nearbyList !== []) ? this.state.nearbyList.map((item, index) => (
                                <ListItem 
                                    key={index}
                                    bottomDivider={true}
                                    title={ <Text style={{fontSize: 15, fontFamily: 'AvenirLTStd-Heavy', padding: 0, color: '#3c4c96',}}>{item.primaryText}</Text> }
                                    subtitle={ <Text style={{fontSize: 13, fontFamily: 'AvenirLTStd-Roman', padding: 0, color: '#3c4c96',}}> {item.fullText}</Text> }
                                    onPress={() => {
                                        this.setState({ 
                                            searchLocation: item.fullText,
                                        }, function(){
                                            this.getCoordination()
                                        })
                                        this.setModalVisible(!this.state.modalVisible)
                                    }}
                                />)) : <View/>
                            }
                        </ScrollView>
                    </View>
                </Modal>
                <TouchableOpacity
                    style={{height: 40, backgroundColor: '#fff', borderColor: '#3c4c96', borderWidth: 1, padding: 10, position: 'absolute', top: 10, left: 10, right: 10, zIndex: 9999,}}
                    onPress={() => this.setModalVisible(true)}>
                    <Text style={{fontSize: 14, fontFamily: 'AvenirLTStd-Roman', color: '#3c4c96', }}>{this.state.searchLocation}</Text>
                </TouchableOpacity>
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