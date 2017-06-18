"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _serialize = (instance, pattern, output) => {
    const instanceSchema = instance.getSchema();
    pattern.forEach(propertyName => {
        if (typeof propertyName === 'string') {
        }
    });
};
let sample = {
    properties: [
        'fullName',
        'user.firstName',
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
            $ref: '#/definitions/address',
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
};
