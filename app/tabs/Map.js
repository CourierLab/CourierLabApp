import React, { Component } from 'react';
import { Text, TextInput, View, Image, TouchableOpacity, KeyboardAvoidingView, Alert, ScrollView,  } from 'react-native';
import { styles } from '../utils/Style';
import NetworkConnection from '../utils/NetworkConnection';
// import { Marker, MapView } from 'react-native-maps';
  
export default class Map extends Component{
    static navigationOptions = ({ navigation }) => ({
        title: `${navigation.state.params.title}`,
    })
    
    constructor(props){
        super(props);
        this.state = {
            latitude: '',
            longitude: '',
            region: {},
            x: {},
            location: '',
        }
    }

    componentDidMount() {
        setTimeout(() => {
            this.checkInternetConnection();
        }, 500);
        this.getVehicleSpec();
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

    getInitialState() {
        return {
          region: {
            latitude: 37.78825,
            longitude: -122.4324,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          },
        };
      }
      
      onRegionChange(region) {
        this.setState({ region });
      }

    render(){
        return(
            <View style={{backgroundColor: '#fff', flex: 1,}}>
                {/* <MapView
                    region={this.state.region}
                    onRegionChange={this.onRegionChange}
                >
                <Marker draggable
                    coordinate={this.state.x}
                    onDragEnd={(e) => this.setState({ x: e.nativeEvent.coordinate })}
                />
                </MapView> */}
                <TextInput
                    style={styles.input}
                    underlineColorAndroid={'transparent'}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType='default'
                    returnKeyLabel="next"
                    placeholder='Location'
                    placeholderTextColor='#3c4c96'
                    value={this.state.location}
                    onChangeText={(text) => this.setState({ location: text })}  />
            </View>
        )
    }
}