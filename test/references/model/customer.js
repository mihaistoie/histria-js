"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../../index");
class Customer extends index_1.Instance {
    get title() {
        return this.getPropertyByName('title');
    }
    setTitle(value) {
        return this.setPropertyByName('title', value);
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
    get title() {
        return this._messages.title;
    }
    get id() {
        return this._messages.id;
    }
}
exports.CustomerErrors = CustomerErrors;
class CustomerState extends index_1.InstanceState {
    get title() {
        return this._states.title;
    }
    get id() {
        return this._states.id;
    }
}
exports.CustomerState = CustomerState;
/* tslint:disable:object-literal-key-quotes */
/* tslint:disable:quotemark */
exports.CUSTOMER_SCHEMA = {
    "type": "object",
    "nameSpace": "references",
    "name": "customer",
    "properties": {
        "title": {
            "title": "title",
            "type": "string"
        },
        "id": {
            "type": "integer",
            "generated": true,
            "format": "id",
            "transient": true
        }
    },
    "meta": {},
    "primaryKey": [
        "id"
    ]
};

//# sourceMappingURL=customer.js.map
