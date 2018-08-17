import {NetInfo, Platform} from 'react-native'

class NetworkConnection {
  static check() {
    if (Platform.OS === 'ios') {
      return new Promise(resolve => {
        const handleFirstConnectivityChangeIOS = isConnected => {
          NetInfo
            .isConnected
            .removeEventListener('connectionChange', handleFirstConnectivityChangeIOS);
          resolve(isConnected);
        };
        NetInfo
          .isConnected
          .addEventListener('connectionChange', handleFirstConnectivityChangeIOS);
      });
    }
    
    return NetInfo
      .isConnected
      .fetch();
  }
}

module.exports = NetworkConnection;