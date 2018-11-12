"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../../index");
class Order extends index_1.Instance {
    get totalAmount() {
        return this._children.totalAmount;
    }
    get id() {
        return this._children.id.value;
    }
    get items() {
        return this._children.items;
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
    get totalAmount() {
        return this._messages.totalAmount;
    }
    get id() {
        return this._messages.id;
    }
    get items() {
        return this._messages.items;
    }
}
exports.OrderErrors = OrderErrors;
class OrderState extends index_1.InstanceState {
    get totalAmount() {
        return this._states.totalAmount;
    }
    get id() {
        return this._states.id;
    }
}
exports.OrderState = OrderState;
/* tslint:disable:object-literal-key-quotes */
/* tslint:disable:quotemark */
exports.ORDER_SCHEMA = {
    "type": "object",
    "name": "order",
    "nameSpace": "compositions",
    "properties": {
        "totalAmount": {
            "type": "number",
            "default": 0
        },
        "id": {
            "type": "integer",
            "generated": true,
            "format": "id",
            "transient": true
        }
    },
    "relations": {
        "items": {
            "type": "hasMany",
            "model": "orderItem",
            "aggregationKind": "composite",
            "invRel": "order",
            "nameSpace": "compositions",
            "title": "items",
            "invType": "belongsTo",
            "localFields": [
                "id"
            ],
            "foreignFields": [
                "orderId"
            ]
        }
    },
    "meta": {},
    "primaryKey": [
        "id"
    ]
};

//# sourceMappingURL=order.js.map
