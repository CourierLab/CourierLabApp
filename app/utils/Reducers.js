const defaultState = {
    isLoggedIn: false,
    email: '',
};

export default function reducer(state = defaultState, action){
    switch(action.type){
        case 'LOGIN':
            return Object.assign({}, state, {
                isLoggedIn: true,
                email: action.email,
            });
        case 'LOGOUT': 
            return Object.assign({}, state, {
                isLoggedIn: false,
                email: '',
            });
        default: 
            return state;
    }
};