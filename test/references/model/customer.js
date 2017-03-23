"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../../index");
class Customer extends index_1.Instance {
    init() {
        super.init();
        let that = this;
        that._schema = exports.CUSTOMER_SCHEMA;
    }
    createStates() {
        let that = this;
        that._states = new CustomerState(that, that._schema);
    }
    createErrors() {
        let that = this;
        that._errors = new CustomerErrors(that, that._schema);
    }
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
}
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
exports.CUSTOMER_SCHEMA = {
    type: 'object',
    nameSpace: 'references',
    name: 'customer',
    properties: {
        title: {
            title: 'title',
            type: 'string'
        },
        id: {
            type: 'integer',
            generated: true,
            format: 'id'
        }
    },
    meta: {}
};
