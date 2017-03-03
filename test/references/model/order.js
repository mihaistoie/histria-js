"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../../index");
class Order extends index_1.Instance {
    init() {
        super.init();
        let that = this;
        that._schema = exports.ORDER_SCHEMA;
    }
    createStates() {
        let that = this;
        that._states = new OrderState(that, that._schema);
    }
    createErrors() {
        let that = this;
        that._errors = new OrderErrors(that, that._schema);
    }
    get customerStatus() {
        return this.getPropertyByName('customerStatus');
    }
    setCustomerStatus(value) {
        return this.setPropertyByName('customerStatus', value);
    }
    get id() {
        return this._children.id.value;
    }
    get customerId() {
        return this._children.customerId.value;
    }
    customer() {
        return this._children.customer.getValue();
    }
    setCustomer(value) {
        return this._children.customer.setValue(value);
    }
    get $states() {
        return this._states;
    }
    get $errors() {
        return this._errors;
    }
}
exports.Order = Order;
class OrderErrors extends index_1.InstanceErrors {
    get $() {
        return this._messages.$;
    }
    get customerStatus() {
        return this._messages.customerStatus;
    }
    get id() {
        return this._messages.id;
    }
    get customerId() {
        return this._messages.customerId;
    }
    get customer() {
        return this._messages.customer;
    }
}
exports.OrderErrors = OrderErrors;
class OrderState extends index_1.InstanceState {
    get customerStatus() {
        return this._states.customerStatus;
    }
    get id() {
        return this._states.id;
    }
    get customerId() {
        return this._states.customerId;
    }
}
exports.OrderState = OrderState;
exports.ORDER_SCHEMA = {
    "type": "object",
    "nameSpace": "references",
    "name": "order",
    "properties": {
        "customerStatus": {
            "type": "string"
        },
        "id": {
            "type": "integer",
            "generated": true,
            "format": "id"
        },
        "customerId": {
            "type": "integer",
            "isReadOnly": true,
            "format": "id"
        }
    },
    "relations": {
        "customer": {
            "type": "hasOne",
            "model": "customer",
            "nameSpace": "references",
            "title": "customer",
            "aggregationKind": "none",
            "localFields": [
                "customerId"
            ],
            "foreignFields": [
                "id"
            ]
        }
    },
    "meta": {}
};
