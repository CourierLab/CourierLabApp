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
                    driverId: {type: 'int'},
                    driverName: 'string',
                    driverNRIC: 'string',
                    driverPhoneNumber: 'string',
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