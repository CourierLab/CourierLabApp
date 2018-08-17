export const login = (email) => {
    return {
        type: 'LOGIN',
        email: email,
    };
};

export const logout = () => {
    return {
        type: 'LOGOUT',
    };
};

export const forgotPassword = (email) => {
    return (dispatch) => {

    };
};
