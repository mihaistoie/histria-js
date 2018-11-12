"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../../index");
class Order extends index_1.Instance {
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
    init() {
        super.init();
        this._schema = exports.ORDER_SCHEMA;
    }
    createStates() {
        this._states = new OrderState(this, this._schema);
    }
    createErrors() {
        this._errors = new OrderErrors(this, this._schema);
    }
}
Order.isPersistent = true;
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
/* tslint:disable:object-literal-key-quotes */
/* tslint:disable:quotemark */
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
            "format": "id",
            "transient": true
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
    "meta": {},
    "primaryKey": [
        "id"
    ]
};

//# sourceMappingURL=order.js.map
