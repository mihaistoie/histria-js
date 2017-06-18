import { ModelObject } from '../model/model-object'
const
    _serialize = (instance: ModelObject, pattern: any[], output: any): void => {
        const instanceSchema = instance.getSchema();
        pattern.forEach(propertyName => {

            if (typeof propertyName === 'string') {

            }
        });

    }

let sample = {
    properties: [
        'fullName',       // equivalent to  {fullName: 'fullName'}
        'user.firstName',  // equivalent  to {firstName: 'user.firstName'}
        { lastName: 'user.lastName' },
        {
            addresses: 'user.addresses',
            properties: [
                'city',
                'street',
                'cp',
                'country'
            ]
        }
    ]
};

// Internal reference
let sample2 = {
    properties: [
        'fullName',
        'user.firstName',
        { lastName: 'user.lastName' },
        {
            addresses: 'user.addresses',
            $ref: '#/definitions/address', // internal reference
        }
    ],
    definitions: {
        address: {
            properties: [
                'city',
                'street',
                'cp',
                'country'
            ]

        }

    }

};


// External reference

let address = {
    properties: [
        'city',
        'street',
        'cp',
        'country'
    ]
}