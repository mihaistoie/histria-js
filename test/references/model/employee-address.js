"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../../index");
class EmployeeAddress extends index_1.Instance {
    get street() {
        return this.getPropertyByName('street');
    }
    setStreet(value) {
        return this.setPropertyByName('street', value);
    }
    get city() {
        return this.getPropertyByName('city');
    }
    setCity(value) {
        return this.setPropertyByName('city', value);
    }
    get province() {
        return this.getPropertyByName('province');
    }
    setProvince(value) {
        return this.setPropertyByName('province', value);
    }
    get postalCode() {
        return this.getPropertyByName('postalCode');
    }
    setPostalCode(value) {
        return this.setPropertyByName('postalCode', value);
    }
    get country() {
        return this.getPropertyByName('country');
    }
    setCountry(value) {
        return this.setPropertyByName('country', value);
    }
    get id() {
        return this._children.id.value;
    }
    get employeeId() {
        return this._children.employeeId.value;
    }
    employee() {
        return this._children.employee.getValue();
    }
    setEmployee(value) {
        return this._children.employee.setValue(value);
    }
    get $states() {
        return this._states;
    }
    get $errors() {
        return this._errors;
    }
    init() {
        super.init();
        this._schema = exports.EMPLOYEEADDRESS_SCHEMA;
    }
    createStates() {
        this._states = new EmployeeAddressState(this, this._schema);
    }
    createErrors() {
        this._errors = new EmployeeAddressErrors(this, this._schema);
    }
}
EmployeeAddress.isPersistent = true;
exports.EmployeeAddress = EmployeeAddress;
class EmployeeAddressErrors extends index_1.InstanceErrors {
    get $() {
        return this._messages.$;
    }
    get street() {
        return this._messages.street;
    }
    get city() {
        return this._messages.city;
    }
    get province() {
        return this._messages.province;
    }
    get postalCode() {
        return this._messages.postalCode;
    }
    get country() {
        return this._messages.country;
    }
    get id() {
        return this._messages.id;
    }
    get employeeId() {
        return this._messages.employeeId;
    }
}
exports.EmployeeAddressErrors = EmployeeAddressErrors;
class EmployeeAddressState extends index_1.InstanceState {
    get street() {
        return this._states.street;
    }
    get city() {
        return this._states.city;
    }
    get province() {
        return this._states.province;
    }
    get postalCode() {
        return this._states.postalCode;
    }
    get country() {
        return this._states.country;
    }
    get id() {
        return this._states.id;
    }
    get employeeId() {
        return this._states.employeeId;
    }
}
exports.EmployeeAddressState = EmployeeAddressState;
/* tslint:disable:object-literal-key-quotes */
/* tslint:disable:quotemark */
exports.EMPLOYEEADDRESS_SCHEMA = {
    "type": "object",
    "name": "employeeAddress",
    "nameSpace": "references",
    "properties": {
        "street": {
            "title": "Street",
            "type": "string"
        },
        "city": {
            "title": "City",
            "type": "string"
        },
        "province": {
            "title": "Province",
            "type": "string"
        },
        "postalCode": {
            "title": "Postal Code",
            "type": "string"
        },
        "country": {
            "title": "Country",
            "type": "string"
        },
        "id": {
            "type": "integer",
            "generated": true,
            "format": "id",
            "transient": true
        },
        "employeeId": {
            "type": "integer",
            "isReadOnly": true,
            "format": "id"
        }
    },
    "relations": {
        "employee": {
            "title": "Address",
            "type": "belongsTo",
            "model": "employee",
            "aggregationKind": "composite",
            "invRel": "address",
            "nameSpace": "references",
            "invType": "hasOne",
            "localFields": [
                "employeeId"
            ],
            "foreignFields": [
                "id"
            ]
        }
    },
    "meta": {
        "parent": "employee",
        "parentRelation": "employee"
    },
    "primaryKey": [
        "id"
    ]
};

//# sourceMappingURL=employee-address.js.map
