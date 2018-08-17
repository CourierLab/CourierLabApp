import { createStore } from 'redux';
import rootReducer from './Components';

let store = createStore(rootReducer);
export default store;