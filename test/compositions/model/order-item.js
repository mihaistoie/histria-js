"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../../index");
class OrderItem extends index_1.Instance {
    get amount() {
        return this._children.amount;
    }
    get loaded() {
        return this.getPropertyByName('loaded');
    }
    setLoaded(value) {
        return this.setPropertyByName('loaded', value);
    }
    get id() {
        return this._children.id.value;
    }
    get orderId() {
        return this._children.orderId.value;
    }
    order() {
        return this._children.order.getValue();
    }
    setOrder(value) {
        return this._children.order.setValue(value);
    }
    get $states() {
        return this._states;
    }
    get $errors() {
        return this._errors;
    }
    init() {
        super.init();
        this._schema = exports.ORDERITEM_SCHEMA;
    }
    createStates() {
        this._states = new OrderItemState(this, this._schema);
    }
    createErrors() {
        this._errors = new OrderItemErrors(this, this._schema);
    }
}
OrderItem.isPersistent = true;
exports.OrderItem = OrderItem;
class OrderItemErrors extends index_1.InstanceErrors {
    get $() {
        return this._messages.$;
    }
    get amount() {
        return this._messages.amount;
    }
    get loaded() {
        return this._messages.loaded;
    }
    get id() {
        return this._messages.id;
    }
    get orderId() {
        return this._messages.orderId;
    }
}
exports.OrderItemErrors = OrderItemErrors;
class OrderItemState extends index_1.InstanceState {
    get amount() {
        return this._states.amount;
    }
    get loaded() {
        return this._states.loaded;
    }
    get id() {
        return this._states.id;
    }
    get orderId() {
        return this._states.orderId;
    }
}
exports.OrderItemState = OrderItemState;
/* tslint:disable:object-literal-key-quotes */
/* tslint:disable:quotemark */
exports.ORDERITEM_SCHEMA = {
    "type": "object",
    "name": "orderItem",
    "nameSpace": "compositions",
    "properties": {
        "amount": {
            "type": "number",
            "default": 0
        },
        "loaded": {
            "type": "boolean",
            "default": false
        },
        "id": {
            "type": "integer",
            "generated": true,
            "format": "id",
            "transient": true
        },
        "orderId": {
            "type": "integer",
            "isReadOnly": true,
            "format": "id"
        }
    },
    "relations": {
        "order": {
            "type": "belongsTo",
            "model": "order",
            "aggregationKind": "composite",
            "invRel": "items",
            "nameSpace": "compositions",
            "title": "order",
            "invType": "hasMany",
            "localFields": [
                "orderId"
            ],
            "foreignFields": [
                "id"
            ]
        }
    },
    "meta": {
        "parent": "order",
        "parentRelation": "order"
    },
    "primaryKey": [
        "id"
    ]
};

//# sourceMappingURL=order-item.js.map
