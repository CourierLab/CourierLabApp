import React , { Component } from 'react';
import { AppRegistry } from 'react-native';
import App from './app/utils/App';
import { Provider } from 'react-redux';
import store from './app/utils/ReduxIndex';
import { YellowBox } from 'react-native';

export default class CourierLab extends Component{
    render(){
        return(
            <Provider store={store}>
                <App />
            </Provider>
        )
    }
}

//ignore the warning for isMounted is deprecated
YellowBox.ignoreWarnings(['Warning: isMounted(...) is deprecated', 'Module RCTImageLoader']);
AppRegistry.registerComponent('CourierLab', () => CourierLab);
