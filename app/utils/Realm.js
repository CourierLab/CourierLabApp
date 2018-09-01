import Realm from 'realm';
// Realm.clearTestState();

let instance = null;

class MyRealm {
    constructor(){
        if(!instance){
            const LoginAsset = {
                name: 'LoginAsset',
                properties: {
                    userId: {type: 'int'},
                    accessToken: 'string',
                    accessTokenExpiredDate: 'string',
                    refreshToken: 'string',
                    roleId: {type: 'int'},
                    roleName: 'string',
                    email: 'string',
                    loginUserId: {type: 'int'},
                    loginUserName: 'string',
                    loginUserNRIC: 'string',
                    loginUserPhoneNumber: 'string',
                    loginUserAddress: 'string',
                    loginUserState: 'string',
                    loginUserPostcode: {type: 'int'},
                }
            };

            instance = new Realm({
                schema: [LoginAsset],
                schemaVersion: 1,
            });
        }
        return instance;
    }
}

module.exports = MyRealm;