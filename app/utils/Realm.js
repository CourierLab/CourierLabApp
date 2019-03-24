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
                    lorryId: {type: 'int', optional: true},
                    lorryColor: {type: 'string', optional: true},
                    lorryImage: {type: 'string', optional: true},
                    // lorryLengthId: {type: 'int', optional: true},  //blank now
                    // lorryLengthAmount: {type: 'int', optional: true},  //blank now
                    lorryName: {type: 'string', optional: true},
                    lorryPlateNumber: {type: 'string', optional: true},
                    lorryTypeId: {type: 'int', optional: true},
                    lorryTypeName: {type: 'string', optional: true},
                    // lorryWeightId: {type: 'int', optional: true},  //blank now
                    // lorryWeigthAmount: {type: 'int', optional: true},  //blank now
                    bankId: {type: 'int', optional: true},
                    bankName: {type: 'string', optional: true},
                    bankAccountNumber: {type: 'string', optional: true},
                    driverImage: {type: 'string', optional: true},
                    driverICImage: {type: 'string', optional: true},
                    driverLicenseImage: {type: 'string', optional: true},
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