"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
class Customer extends index_1.Instance {
    get firstName() {
        return this.getPropertyByName('firstName');
    }
    setFirstName(value) {
        return this.setPropertyByName('firstName', value);
    }
    get lastName() {
        return this.getPropertyByName('lastName');
    }
    setLastName(value) {
        return this.setPropertyByName('lastName', value);
    }
    get id() {
        return this._children.id.value;
    }
    get $states() {
        return this._states;
    }
    get $errors() {
        return this._errors;
    }
    init() {
        super.init();
        this._schema = exports.CUSTOMER_SCHEMA;
    }
    createStates() {
        this._states = new CustomerState(this, this._schema);
    }
    createErrors() {
        this._errors = new CustomerErrors(this, this._schema);
    }
}
Customer.isPersistent = true;
exports.Customer = Customer;
class CustomerErrors extends index_1.InstanceErrors {
    get $() {
        return this._messages.$;
    }
    get firstName() {
        return this._messages.firstName;
    }
    get lastName() {
        return this._messages.lastName;
    }
    get id() {
        return this._messages.id;
    }
}
exports.CustomerErrors = CustomerErrors;
class CustomerState extends index_1.InstanceState {
    get firstName() {
        return this._states.firstName;
    }
    get lastName() {
        return this._states.lastName;
    }
    get id() {
        return this._states.id;
    }
}
exports.CustomerState = CustomerState;
/* tslint:disable:object-literal-key-quotes */
/* tslint:disable:quotemark */
exports.CUSTOMER_SCHEMA = {
    "name": "customer",
    "type": "object",
    "nameSpace": "customer-view-sample",
    "properties": {
        "firstName": {
            "title": "First Name",
            "type": "string"
        },
        "lastName": {
            "title": "Last Name",
            "type": "string"
        },
        "id": {
            "type": "integer",
            "generated": true,
            "format": "id",
            "transient": true
        }
    },
    "primaryKey": [
        "id"
    ],
    "meta": {},
    "viewsOfMe": {
        "customer-view-sample.customerView": {
            "nameSpace": "customer-view-sample",
            "model": "customerView",
            "relation": "customer",
            "localFields": [
                "customerId"
            ],
            "foreignFields": [
                "id"
            ]
        }
    }
};

//# sourceMappingURL=customer.js.map
