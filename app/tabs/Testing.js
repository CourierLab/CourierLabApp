import React from 'react';
import { ScrollView, Dimensions, FlatList, StyleSheet, Text, View, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { Avatar, Button, Divider, Input, Icon, ListItem } from 'react-native-elements';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { RadioButtons } from 'react-native-radio-buttons'
import ImagePicker from 'react-native-image-picker';
import GridView from 'react-native-super-grid';
import FastImage from 'react-native-fast-image';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import MyRealm from '../../database/MyRealm'
import Reactive from '../../utils/Reactive';

let realm = new MyRealm();

export default class AccountScreen extends React.Component {
  constructor(props){
    super(props);
    this.state = {
        imagePath: "https://s3.amazonaws.com/uifaces/faces/twitter/brynn/128.jpg",
        myTicketList: [],
    };
    _this = this;
  }

  // setSelectedOption(selectedOption){
  //   this.setState({
  //     selectedOption
  //   });
  // }

  // renderOption(option, selected, onSelect, index){
  //   const style = selected ? { fontWeight: 'bold', color: '#34A0FF', fontSize: 12, textAlign: 'center',  } : {fontWeight: 'bold', color: '#EEE', fontSize: 12,  textAlign: 'center',};
  //   const containerStyles = selected ? { width: (width-60)/3, borderColor: '#34A0FF', borderWidth: 1, padding: 20, margin: 5,} : { width: (width-60)/3, borderColor: '#EEEEEE', borderWidth: 1, padding: 20, margin: 5,};

  //   return (
  //     <View style={containerStyles}>
  //       <TouchableWithoutFeedback onPress={onSelect} key={index}>
  //         <Text style={style}>{option}</Text>
  //       </TouchableWithoutFeedback>
  //     </View>
  //   );
  // }

  componentDidMount() {
    this.updateUI();
    realm.addListener('change', this.updateUI);
  }

  componentWillUnmount() {
    realm.removeListener('change', this.updateUI);
  }

  updateUI = () => {
    let myTicketList = realm.objects('SelectedRaffle').filtered(`TRUEPREDICATE DISTINCT(id)`);
    this.setState({
      myTicketList: myTicketList,
    })
  };

  renderRow ({ item }) {
    console.log(item);
    let url = '';
    if (item.MainImageUrl.includes('http')) {
      url = item.MainImageUrl;
    } else {
      url = 'https://dev.anyraffle.com' + item.MainImageUrl
    }
    return(
      <ListItem
        containerStyle={{paddingLeft: 5, paddingRight: 5, paddingTop: 0, paddingBottom: 10, flexWrap: 'wrap', flexDirection: 'row', width: (width-20)/2,}}
        key={item.ticketNo}
        title={(<View>
          <FastImage
            style={{height:150, }}
            source={{
              uri: url,
              priority: FastImage.priority.normal,
            }}
            resizeMode={FastImage.resizeMode.cover}
          />
            <View style={{flexDirection: 'row', justifyContent: 'flex-start', alignSelf: 'flex-start', alignItems: 'flex-start', paddingTop: 5, paddingBottom: 5, backgroundColor: '#2a1a35', width: (width-40)/2,}}>
                  <MaterialCommunityIcon
                    name='ticket-outline' 
                    color='#fff' 
                    size={24}
                    style={{paddingTop:0, paddingLeft: 10, paddingRight: 10}}
                  />
                  <Text style={{fontSize: 15, paddingTop: 3, color: '#fff' }}>
                    {(realm.objects('SelectedRaffle') != undefined) ? (realm.objects('SelectedRaffle').filtered('id = ' + item.id)).length : 0}
                  </Text>
              </View>
          </View>
        )}
        onPress={() => _this.props.navigation.navigate('TicketDetails', { item: item, ticketsNo: realm.objects('SelectedRaffle').filtered('id = ' + item.id) })}
      />
    )
  }

  openFile() {
    const options = {
        title: 'Select Image',
        takePhotoButtonTitle: null,
        storageOptions: {
            skipBackup: true,
            path: 'images',
        },
    };

    ImagePicker.showImagePicker(options, (response) => {
        if (response.didCancel) {
            console.log('cancel');
        }else if (response.error) {
          console.log('error');
        }else {
            const source = response.uri;
            this.setState({
                imagePath: source,
            });
        }
    });
  }

  openCamera(){
    const options = {
      title: 'Take picture',
      takePhotoButtonTitle: null,
      storageOptions: {
          skipBackup: true,
          path: 'images',
      },
    };

    ImagePicker.launchCamera(options, (response) => {
      if (response.didCancel) {
        console.log('cancel');
      }else if (response.error) {
        console.log('error');
      }else {
          const source = response.uri;
          this.setState({
              imagePath: source,
          });
      }
    });
  }

  render() {
    // const options = [ "I'M A GUY", "I'M A GAL", "UNSPECIFIED", ];
    return (
      <ScrollView style={styles.container} contentContainerStyle={{alignItems: 'center', padding: 0}}>
        <View style={{flexDirection: 'row', paddingBottom: 20, paddingTop: 20, }}>
          <Avatar
            size="large"
            rounded
            source={{uri: this.state.imagePath}}
            onPress={() => console.log("Works!")}
            activeOpacity={0.7}
          />
          <View style={{flexDirection: 'column'}}>
            <Text style={{fontSize: 13, fontFamily: 'K2D-Regular', padding: 10 }}>
              Change your profile picture
            </Text>
            <View style={{flexDirection: 'row'}}>
              <Button
                onPress={() => {
                  this.openFile()
                }}
                title='Gallery'
                containerStyle={{
                  marginLeft: 10,
                  marginRight: 5,
                }}
                buttonStyle={{
                  backgroundColor: "#2D1E3D",
                  width: (width-120)/2,
                  height: 40,
                  borderColor: "transparent",
                  borderWidth: 0
                }}
              />
                <Button
                onPress={() => {
                  this.openCamera();
                }}
                title='Camera'
                containerStyle={{
                  marginLeft: 5,
                  marginRight: 0,
                }}
                buttonStyle={{
                  backgroundColor: "#2D1E3D",
                  width: (width-120)/2,
                  height: 40,
                  borderColor: "transparent",
                  borderWidth: 0
                }}
              />
            </View>
          </View>
        </View>
        <Divider style={{ height: 2, width:width*0.9, backgroundColor: '#EEEEEE' }} />
        <View style={{flexDirection: 'row', paddingTop: 20, paddingBottom: 20,}}>
          <Input
            label="Family name"
            placeholder="Family name"
            value="Doe"
            fontFamily= 'K2D-Regular'
            lineHeight= {22}
            containerStyle={{
              width: (width-40)/2,
              paddingLeft: 5,
              paddingRight: 10,
            }}
            labelStyle={{
              fontWeight: '400'
            }}
          />
          <Input
            label="Given name"
            placeholder="Given name"
            value="Jane"
            fontFamily= 'K2D-Regular'
            lineHeight= {22}
            containerStyle={{
              width: (width-40)/2,
              paddingLeft: 10,
              paddingRight: 5,
            }}
            labelStyle={{
              fontWeight: '400'
            }}
          />
        </View>
        <View style={{flexDirection: 'row', paddingTop: 0, paddingBottom: 20,}}>
          <Input
            label="Username"
            placeholder="Username"
            value="Jane Doe"
            fontFamily= 'K2D-Regular'
            lineHeight= {22}
            containerStyle={{
              width: width-40,
              paddingLeft: 5,
              paddingRight: 5,
            }}
            labelStyle={{
              fontWeight: '400'
            }}
          />
        </View>
        <View style={{flexDirection: 'row', paddingTop: 0, paddingBottom: 20,}}>
          <Input
            label="Email"
            placeholder="Email"
            value="jane.doe@hotmail.com"
            fontFamily= 'K2D-Regular'
            lineHeight= {22}
            containerStyle={{
              width: width-40,
              paddingLeft: 5,
              paddingRight: 5,
            }}
            labelStyle={{
              fontWeight: '400'
            }}
            rightIcon={
              <Icon
                name='shield'
                size={24}
                type='entypo'
                color='#34A0FF'
              />
            }
          />
        </View>
        <View style={{flexDirection: 'row', paddingTop: 0, paddingBottom: 10,}}>
          <Input
            label="Phone"
            placeholder="000 - 0000 0000"
            value="000 - 0000 0000"
            fontFamily= 'K2D-Regular'
            lineHeight= {22}
            containerStyle={{
              width: width-40,
              paddingLeft: 5,
              paddingRight: 5,
            }}
            labelStyle={{
              fontWeight: '400'
            }}
            rightIcon={
              <Icon
                name='warning'
                size={24}
                type='entypo'
                color='#E53935'
              />
            }
          />
        </View>
        <View style={{paddingTop: 0, paddingBottom: 40, flexDirection: 'column',alignItems: 'flex-end', width: width, paddingRight: 20, }}>
            <TouchableOpacity onPress={console.log('send')}>
              <Text style={{fontSize: 13, fontFamily: 'K2D-Regular', padding: 0, color: '#34A0FF', fontWeight: 'bold', textAlign: 'right',}}>
                Send verification text
              </Text>
            </TouchableOpacity>
        </View>
        <Divider style={{ height: 2, width:width*0.9, backgroundColor: '#EEEEEE' }} />
        {/* <View style={{paddingTop: 20, paddingBottom: 20, flexDirection: 'row',}}>
          <RadioButtons
            options={ options }
            onSelection={ this.setSelectedOption.bind(this) }
            selectedOption={this.state.selectedOption }
            renderOption={ this.renderOption }
            renderContainer={RadioButtons.renderHorizontalContainer}
          />
        </View>      */}
        {
          (this.state.myTicketList.length > 0) ? <View>
              <View style={{ flexDirection: 'column', alignItems: 'flex-start', width: width, paddingTop: 20, paddingLeft: 20,  paddingRight: 20, paddingBottom: 0, }}>
                <Text style={{ fontSize: 11, fontWeight: "bold", paddingLeft: 0, paddingRight: 5, paddingTop: 0, paddingBottom: 0, textAlign: 'left' }}>
                  My Tickets
                </Text>
              </View>
              <View style={{ flexDirection: 'row', paddingTop: 0, paddingLeft: 10,  paddingRight: 10, paddingBottom: 20, }}>
                  <FlatList
                    data={this.state.myTicketList}
                    renderItem={this.renderRow}
                    keyExtractor={item => item.id.toString()}
                    numColumns={2}
                  />
              </View>
            </View>: <View/>
        }
      </ScrollView>
    );
  }
}

let {height, width} = Dimensions.get('window');

let styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 0,
  },
  gridView: {
    flex: 1,
    padding: 0,
  },
});




var bodyData = new FormData();
    bodyData.append('currency_name', this.state.countryName);
    bodyData.append('currency_unit', this.state.countryUnit);
    bodyData.append('min_withdrawal_amount', this.state.minAmount);
    bodyData.append('image_file', { uri: this.state.imagePath, name: 'currencyImage', type: 'image/jpeg' });
    console.log(bodyData);
    fetch(`${myApiUrl}/${addCurrencyPath}`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'multipart/form-data',
            'Authorization': 'Bearer ' + loginAsset[0].accessToken,
        },
        body: bodyData,
    })






    import React, { Component } from 'react';
import { Text, View, ScrollView, TextInput, Image, } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Spinner from 'react-native-spinkit';
import NetworkConnection from '../utils/NetworkConnection';
import MyRealm from '../utils/Realm';
import { ListItem, ButtonGroup, Badge, } from 'react-native-elements';
import ModalSelector from 'react-native-modal-selector';

let myApiUrl = 'http://xpresstransferdev.imaginecup.my/api/admin';
let allCurrencyPath = 'getAllCurrency';
let getMemberCommissionPath = 'getMemberCommissionEarned';
let realm = new MyRealm();
let loginAsset = realm.objects('LoginAsset');

export default class MemberCommissionDetails extends Component{
    static navigationOptions = {
        title: 'Member Commission Summary',
    }

    constructor(props){
        super(props);
        this.state = {
            spinnerVisible: false,
            currencyList: [],
            commissionList: [],
            withdrawalList: [],
            totalEarned: '',
            selectedIndex: 0,
            currencyUnit: '',
            selectedCurrency: '',
        };
        _this = this;
        this.updateIndex = this.updateIndex.bind(this);
    }

    updateIndex(selectedIndex){
        this.setState({
            selectedIndex: selectedIndex,
        })
    }

    componentDidMount(){
        setTimeout(() => {
            this.checkInternetConnection();
        }, 500);
        this.getCurrencyList();
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

    getCurrencyList(){
        fetch(`${myApiUrl}/${allCurrencyPath}`, {
            method: 'POST',
            headers: new Headers({
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + loginAsset[0].accessToken,
            }),
        })
        .then((response) => response.json())
        .then((json) => {
            console.log(json);
            this.setState({
                currencyList: json.currency_lists,
            });
        }).catch(err => {
            console.log(err);
        });
    }

    getMemberCommission(id){
        this.setState({
            spinnerVisible: true,
        })
        fetch(`${myApiUrl}/${getMemberCommissionPath}?user_id=` + this.props.navigation.getParam('userId') + `&currency=` + id, {
            method: 'POST',
            headers: new Headers({
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + loginAsset[0].accessToken,
            }),
        })
        .then((response) => response.json())
        .then((json) => {
            console.log(json);
            if(json.status === "1"){
                this.setState({
                    totalEarned: json.total_earned,
                    commissionList: json.transaction_lists,
                    withdrawalList: json.commission_logs,
                    currencyUnit: json.currency_unit,
                    spinnerVisible: false,
                });
            }
        }).catch(err => {
            console.log(err);
            this.setState({
                spinnerVisible: false,
            })
        });
    }

    render(){
        var buttons = ['Transactions', 'Commission Log'];
        var log = <View/>;
        if(this.state.selectedIndex === 0){
            log = (this.state.spinnerVisible) ? (<View style={{marginTop: 20, marginBottom: 20, alignItems: 'center',}}>
                        <Spinner
                            isVisible={this.state.spinnerVisible}
                            type={'9CubeGrid'}
                            color='#f1a925'
                            paddingLeft={20}
                            size={50}/>
                    </View>) : (this.state.commissionList.length === 0) ? (<View style={{flex: 1, marginTop: 10, marginBottom: 30, marginLeft: 0, flexDirection: 'row', justifyContent: 'center', alignItems: 'center',}}>
                            <Text style={{fontSize: 15, color: '#1a2429',}}>No Commission</Text> 
                    </View>): (
                    <View>
                        <View style={{flexDirection: 'column', paddingTop: 10, paddingBottom: 10, paddingLeft: 10, paddingRight: 10}}>
                            <Text style={{fontSize: 18, paddingLeft: 10, paddingRight: 20, paddingTop: 10,}}>Total Commission Earned:</Text>
                            <Text style={{fontSize: 18, paddingLeft: 10, paddingRight: 20, paddingTop: 10, paddingBottom: 10,}}>{this.state.currencyUnit} {this.state.totalEarned.total_amount}</Text>
                        </View>
                        <View style={{borderBottomColor:'#e0e0e0', borderBottomWidth: 1,}}/>
                        <View style={{flexDirection: 'row', paddingLeft: 5, paddingRight: 5, paddingTop: 10, paddingBottom: 10, backgroundColor: '#E0E5E7',}}>
                            <Text style={{ width: '30%', fontSize: 12, paddingLeft: 10, fontWeight: 'bold', }}>Transaction ID</Text>
                            <Text style={{ width: '70%', fontSize: 12, paddingLeft: 10, fontWeight: 'bold', }}>Commission Earned</Text>
                        </View>
                        <View style={{borderBottomColor:'#e0e0e0', borderBottomWidth: 1,}}/>            
                            {this.state.commissionList.map((item, index) => (
                                <ListItem 
                                    key={index}
                                    bottomDivider={true}
                                    title={ (
                                        <View style={{flex:1, flexDirection: 'row', paddingLeft: 5, paddingRight: 5, }}>
                                            <Text style={{ width: '30%', fontSize: 18, paddingLeft: 10, }}>{item.transaction_id}</Text>
                                            <Text style={{ width: '70%', fontSize: 18, paddingLeft: 10, }}>{this.state.currencyUnit} {item.amount}</Text>
                                        </View>
                                    ) }
                                />
                            ))}
                    </View>
                )
        }else{
            log = (this.state.spinnerVisible) ? (<View style={{marginTop: 20, marginBottom: 20, alignItems: 'center',}}>
                        <Spinner
                            isVisible={this.state.spinnerVisible}
                            type={'9CubeGrid'}
                            color='#f1a925'
                            paddingLeft={20}
                            size={50}/>
                    </View>) : (this.state.withdrawalList.length === 0) ? (<View style={{flex: 1, marginTop: 10, marginBottom: 30, marginLeft: 0, flexDirection: 'row', justifyContent: 'center', alignItems: 'center',}}>
                            <Text style={{fontSize: 15, color: '#1a2429',}}>No Withdrawal</Text> 
                    </View>): (
                    <View>      
                        {this.state.withdrawalList.map((item, index) => (
                            <ListItem 
                                key={index}
                                bottomDivider={true}
                                title={ (
                                    <View style={{flex:1, flexDirection: 'column', paddingLeft: 5, paddingRight: 5, }}>
                                        <Text style={{ fontSize: 18, paddingLeft: 10, }}>{item.message}</Text>
                                    </View>
                                ) }
                                subtitle={
                                    <View style={{paddingTop: 5,}}>
                                        <Text style={{fontSize: 14, paddingLeft: 15, fontStyle: 'italic',}}>{item.created_at}</Text>    
                                        {   
                                            (item.type === "Approved") ? <Badge
                                                value={item.type}
                                                textStyle={{ color: '#fff', fontWeight: 'bold', fontSize: 12, }}
                                                containerStyle={{backgroundColor: 'green', width: 90, marginTop: 5, marginLeft: 10,}}
                                            />  : 
                                            (item.type === "Refund (+)") ? <Badge
                                                value={item.type}
                                                textStyle={{ color: '#fff', fontWeight: 'bold', fontSize: 12, }}
                                                containerStyle={{backgroundColor: 'orange', width: 90, marginTop: 5, marginLeft: 10,}}
                                            />  :
                                            <Badge
                                                value={item.type}
                                                textStyle={{ color: '#fff', fontWeight: 'bold', fontSize: 12, }}
                                                containerStyle={{backgroundColor: 'red', width: 90, marginTop: 5, marginLeft: 10,}}
                                            />
                                        }
                                    </View>
                                    }
                                />
                            ))}
                    </View>
            )
        }
        return(
            <View style={{flex: 1, backgroundColor: '#fff', paddingTop: 10, paddingBottom: 20,}}>
                <View>
                    <Text style={{paddingLeft: 20, paddingTop: 5, paddingBottom: 5, paddingRight: 20, color: '#3C3D39', fontSize: 15,}}>Name: </Text>
                    <Text style={{paddingLeft: 20, paddingTop: 0, paddingBottom: 10, paddingRight: 20, color: '#f1a925', fontSize: 20,}}>{this.props.navigation.getParam('name')}</Text>
                </View>
                <View>
                    <Text style={{paddingLeft: 20, paddingTop: 5, paddingBottom: 5, paddingRight: 20, color: '#3C3D39', fontSize: 15,}}>Email Address: </Text>
                    <Text style={{paddingLeft: 20, paddingTop: 0, paddingBottom: 10, paddingRight: 20, color: '#f1a925', fontSize: 20,}}>{(this.props.navigation.getParam('email') === null) ? '-' : this.props.navigation.getParam('email')}</Text>
                </View>
                <View>
                    <Text style={{paddingLeft: 20, paddingTop: 5, paddingBottom: 5, paddingRight: 20, color: '#3C3D39', fontSize: 15,}}>Phone Number: </Text>
                    <Text style={{paddingLeft: 20, paddingTop: 0, paddingBottom: 10, paddingRight: 20, color: '#f1a925', fontSize: 20,}}>{(this.props.navigation.getParam('phoneNumber') === null) ? '-': this.props.navigation.getParam('phoneNumber')}</Text>
                </View>
                <View>
                    <Text style={{paddingLeft: 15, paddingTop: 5, paddingBottom: 5, paddingRight: 15, color: '#3C3D39', fontSize: 15,}}>Select Currency: </Text>
                    <ModalSelector
                        data={this.state.currencyList}
                        supportedOrientations={['portrait']}
                        keyExtractor= {item => item.id}
                        labelExtractor= {item => item.currency_unit}
                        accessible={true}
                        scrollViewAccessibilityLabel={'Scrollable options'}
                        cancelButtonAccessibilityLabel={'Cancel Button'}
                        onChange={(option)=>{ 
                            this.setState({
                                selectedCurrency: option.currency_unit
                            })
                            this.getMemberCommission(option.id) 
                        }}>
                        <TextInput
                            style={{height: 50, backgroundColor: '#fff', marginBottom: 10, padding: 10, color: '#1a2429', fontSize: 20, borderColor: '#1a2429', borderWidth: 1, marginLeft: 15, marginRight: 15,}}
                            editable={false}
                            placeholder='Select Currency'
                            underlineColorAndroid={'transparent'}
                            placeholderTextColor='#8E9495'
                            value={this.state.selectedCurrency}/>
                    </ModalSelector>
                </View>
                <View>
                    <ButtonGroup 
                        onPress={this.updateIndex}
                        selectedIndex={this.state.selectedIndex}
                        buttons={buttons}
                        containerStyle={{height: 50, marginTop: 10, marginBottom: 10, marginLeft: 10, marginRight: 10,}}
                        selectedButtonStyle={{backgroundColor: '#f2c433', }}
                        selectedTextStyle={{fontWeight: 'bold', textAlign: 'center',}}
                        textStyle={{fontWeight: 'bold', textAlign: 'center',}}
                        containerBorderRadius={3}
                    />
                    <View style={{borderBottomColor:'#e0e0e0', borderBottomWidth: 1,}}/>
                </View>
                <ScrollView>
                    {log}
                </ScrollView>
            </View>
        )
    }
};


import React, { Component } from 'react';
import { Text, View, ScrollView, Image, TouchableOpacity, Alert, TextInput, Platform, KeyboardAvoidingView, } from 'react-native';
import { styles } from '../utils/Style';
import Spinner from 'react-native-spinkit';
import NetworkConnection from '../utils/NetworkConnection';
import MyRealm from '../utils/Realm';
import ModalSelector from 'react-native-modal-selector';
import ImagePicker from 'react-native-image-picker';

let myApiUrl = 'http://xpresstransferdev.imaginecup.my/api/master';
let addCurrencyPath = 'manageCurrencyAddDetail';
let realm = new MyRealm();
let loginAsset = realm.objects('LoginAsset');

export default class AddCurrency extends Component{
    static navigationOptions = {
        title: 'Add Currency',
    }

    constructor(props){
        super(props);
        this.state = {
            spinnerVisible: false,
            isClicked: false,
            isSubmit: false,
            countryName: "",
            countryUnit: "",
            minAmount: "",
            imagePath: "",
        };
    }

    componentDidMount(){
        setTimeout(() => {
            this.checkInternetConnection();
        }, 500);
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

    openImage(){
        const options = {
            title: 'Select Image',
            takePhotoButtonTitle: null,
            storageOptions: {
                skipBackup: true,
                path: 'images',
            },
        };

        ImagePicker.showImagePicker(options, (response) => {
            if (response.didCancel) {
                this.setState({
                    imagePath: "",
                });
            }else if (response.error) {
                this.setState({
                    imagePath: "",
                });
            }else {
                const source = response.uri;
                this.setState({
                    imagePath: source,
                });
            }
        });
    }

    add(){
        this.setState({
            spinnerVisible: true,
            isClicked: true,
            isSubmit: true,
        })
        if(this.state.countryName === "" || this.state.countryUnit === "" || this.state.minAmount === "" || this.state.imagePath === ""){
            Alert.alert('Cannot Add', 'Please key in Country Name, Currency Unit, Minimum Withdrawal Amount or Image.', [{
                text: 'OK',
                onPress: () => {},
            }], {cancelable: false});
            this.setState({
                spinnerVisible: false,
                isClicked: false,
                isSubmit: false,
            })
        }else{
            var bodyData = new FormData();
            bodyData.append('currency_name', this.state.countryName);
            bodyData.append('currency_unit', this.state.countryUnit);
            bodyData.append('min_withdrawal_amount', this.state.minAmount);
            bodyData.append('image_file', { uri: this.state.imagePath, name: 'currencyImage', type: 'image/jpeg' });
            console.log(bodyData);
            fetch(`${myApiUrl}/${addCurrencyPath}`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'multipart/form-data',
                    'Authorization': 'Bearer ' + loginAsset[0].accessToken,
                },
                body: bodyData,
            })
            .then((response) => response.json())
            .then((json) => {
                console.log(json);
                if(json.status === "0"){
                    Alert.alert('Cannot Add', json.message, [{
                        text: 'OK',
                        onPress: () => {},
                    }], {cancelable: false});
                    this.setState({
                        spinnerVisible: false,
                        isClicked: false,
                        isSubmit: false,
                    })
                }else if(json.status === "1"){
                    console.log(json);
                    Alert.alert('Successfully Add', json.message, [{
                        text: 'OK',
                        onPress: () => {
                            this.setState({
                                spinnerVisible: false,
                                isClicked: false,
                                isSubmit: false,
                            })
                            this.props.navigation.state.params.rerenderFunction();
                            this.props.navigation.goBack();
                        },
                    }], {cancelable: false});
                }
            }).catch(err => {
                console.log(err);
                this.setState({
                    spinnerVisible: false,
                    isClicked: false,
                    isSubmit: false,
                })
            })
        }
    }

    render(){
        let spinnerView = this.state.isClicked ? <View style={styles.spinnerView2}> 
                    <Spinner
                        isVisible={this.state.spinnerVisible}
                        type={'9CubeGrid'}
                        color='#f1a925'
                        paddingLeft={20}
                        size={50}/>
                </View> : <View/>;
        return(
            (Platform.OS === 'ios') ? <KeyboardAvoidingView style={{flex: 1, backgroundColor: '#fff', paddingTop: 20, paddingBottom: 0, paddingLeft: 20, paddingRight: 20,}} behavior="padding">
                <ScrollView>
                    <View>
                        <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 15,}}>Country Name: </Text>
                        <TextInput
                            style={styles.input}
                            autoCapitalize="none"
                            autoCorrect={false}
                            underlineColorAndroid={'transparent'}
                            keyboardType='default'
                            returnKeyLabel="next"
                            placeholder='Country Name'
                            placeholderTextColor='#8E9495'
                            value={this.state.countryName}
                            onChangeText={(text) => this.setState({ countryName: text })}  />
                    </View>
                    <View>
                        <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 15,}}>Currency Unit: </Text>
                        <TextInput
                            style={styles.input}
                            autoCapitalize="none"
                            autoCorrect={false}
                            underlineColorAndroid={'transparent'}
                            keyboardType='default'
                            returnKeyLabel="next"
                            placeholder='Currency Unit'
                            placeholderTextColor='#8E9495'
                            value={this.state.countryUnit}
                            onChangeText={(text) => this.setState({ countryUnit: text })}  />
                    </View>
                    <View>
                        <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 15,}}>Min. Withdrawal Amount: </Text>
                        <TextInput
                            style={styles.input}
                            autoCapitalize="none"
                            autoCorrect={false}
                            underlineColorAndroid={'transparent'}
                            keyboardType='numeric'
                            returnKeyLabel="next"
                            placeholder='Min. Withdrawal Amount'
                            placeholderTextColor='#8E9495'
                            value={this.state.minAmount}
                            onChangeText={(text) => this.setState({ minAmount: text })}  />
                    </View>
                    <View>
                        <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 15,}}>Currency Image: </Text>
                        <View style={{flexDirection: 'row',}}>
                            {
                                (this.state.imagePath !== "") ? <View style={{flexDirection: 'row',}}>
                                    <Image resizeMode="cover" source={{ uri: this.state.imagePath }} style={{width: 50, height: 40, marginLeft: 5, marginRight: 0,}} /> 
                                    <TouchableOpacity
                                        style={{backgroundColor: '#f1a925', marginLeft: 20, marginRight: 20, marginBottom: 5, marginTop: 0, paddingVertical: 10, width: 150,}}
                                        onPress={(e) => this.openImage()}>
                                        <Text style={{color: '#fff', textAlign: 'center', fontWeight: '700', fontSize: 15,}}>Choose Image</Text>
                                    </TouchableOpacity>
                                </View>
                                : <TouchableOpacity
                                    style={{backgroundColor: '#f1a925', marginLeft: 0, marginRight: 0, marginBottom: 5, marginTop: 0, paddingVertical: 10, width: 150,}}
                                    onPress={(e) => this.openImage()}>
                                    <Text style={{color: '#fff', textAlign: 'center', fontWeight: '700', fontSize: 15,}}>Choose Image</Text>
                                </TouchableOpacity>
                            }
                        </View>
                        <Text style={{fontSize: 10, color: '#1a2429', textAlign: 'left', paddingBottom: 10, paddingLeft: 5, paddingRight: 5, }}>*Recommend Size: 50 x 40</Text>
                    </View>
                    {spinnerView}
                    <TouchableOpacity
                        disabled={this.state.isSubmit}
                        style={this.state.isSubmit ? {backgroundColor: '#A99D87', paddingVertical: 15, marginTop: 10, marginLeft: 0, marginRight: 0, marginBottom: 30,} : {backgroundColor: '#f1a925', paddingVertical: 15, marginLeft: 0, marginRight: 0, marginTop: 10, marginBottom: 30,}}
                        onPress={(e) => { this.add(); }}>
                        <Text style={{color: '#fff', textAlign: 'center', fontWeight: '700', fontSize: 20,}}>Add</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView> : <KeyboardAvoidingView style={{flex: 1, backgroundColor: '#fff', paddingTop: 20, paddingBottom: 0, paddingLeft: 20, paddingRight: 20,}}>
                <ScrollView>
                    <View>
                        <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 15,}}>Country Name: </Text>
                        <TextInput
                            style={styles.input}
                            autoCapitalize="none"
                            autoCorrect={false}
                            underlineColorAndroid={'transparent'}
                            keyboardType='default'
                            returnKeyLabel="next"
                            placeholder='Country Name'
                            placeholderTextColor='#8E9495'
                            value={this.state.countryName}
                            onChangeText={(text) => this.setState({ countryName: text })}  />
                    </View>
                    <View>
                        <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 15,}}>Currency Unit: </Text>
                        <TextInput
                            style={styles.input}
                            autoCapitalize="none"
                            autoCorrect={false}
                            underlineColorAndroid={'transparent'}
                            keyboardType='default'
                            returnKeyLabel="next"
                            placeholder='Currency Unit'
                            placeholderTextColor='#8E9495'
                            value={this.state.countryUnit}
                            onChangeText={(text) => this.setState({ countryUnit: text })}  />
                    </View>
                    <View>
                        <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 15,}}>Min. Withdrawal Amount: </Text>
                        <TextInput
                            style={styles.input}
                            autoCapitalize="none"
                            autoCorrect={false}
                            underlineColorAndroid={'transparent'}
                            keyboardType='numeric'
                            returnKeyLabel="next"
                            placeholder='Min. Withdrawal Amount'
                            placeholderTextColor='#8E9495'
                            value={this.state.minAmount}
                            onChangeText={(text) => this.setState({ minAmount: text })}  />
                    </View>
                    <View>
                        <Text style={{paddingLeft: 5, paddingTop: 0, paddingBottom: 5, paddingRight: 5, color: '#3C3D39', fontSize: 15,}}>Currency Image: </Text>
                        <View style={{flexDirection: 'row',}}>
                            {
                                (this.state.imagePath !== "") ? <View style={{flexDirection: 'row',}}>
                                    <Image resizeMode="cover" source={{ uri: this.state.imagePath }} style={{width: 50, height: 40, marginLeft: 5, marginRight: 0,}} /> 
                                    <TouchableOpacity
                                        style={{backgroundColor: '#f1a925', marginLeft: 20, marginRight: 20, marginBottom: 5, marginTop: 0, paddingVertical: 10, width: 150,}}
                                        onPress={(e) => this.openImage()}>
                                        <Text style={{color: '#fff', textAlign: 'center', fontWeight: '700', fontSize: 15,}}>Choose Image</Text>
                                    </TouchableOpacity>
                                </View>
                                : <TouchableOpacity
                                    style={{backgroundColor: '#f1a925', marginLeft: 0, marginRight: 0, marginBottom: 5, marginTop: 0, paddingVertical: 10, width: 150,}}
                                    onPress={(e) => this.openImage()}>
                                    <Text style={{color: '#fff', textAlign: 'center', fontWeight: '700', fontSize: 15,}}>Choose Image</Text>
                                </TouchableOpacity>
                            }
                        </View>
                        <Text style={{fontSize: 10, color: '#1a2429', textAlign: 'left', paddingBottom: 10, paddingLeft: 5, paddingRight: 5, }}>*Recommend Size: 50 x 40</Text>
                    </View>
                    {spinnerView}
                    <TouchableOpacity
                        disabled={this.state.isSubmit}
                        style={this.state.isSubmit ? {backgroundColor: '#A99D87', paddingVertical: 15, marginTop: 10, marginLeft: 0, marginRight: 0, marginBottom: 30,} : {backgroundColor: '#f1a925', paddingVertical: 15, marginLeft: 0, marginRight: 0, marginTop: 10, marginBottom: 30,}}
                        onPress={(e) => { this.add(); }}>
                        <Text style={{color: '#fff', textAlign: 'center', fontWeight: '700', fontSize: 20,}}>Add</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        )
    }
};
