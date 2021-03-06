"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../../index");
class VAOrder extends index_1.Instance {
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
        this._schema = exports.VAORDER_SCHEMA;
    }
    createStates() {
        this._states = new VAOrderState(this, this._schema);
    }
    createErrors() {
        this._errors = new VAOrderErrors(this, this._schema);
    }
}
VAOrder.isPersistent = true;
exports.VAOrder = VAOrder;
class VAOrderErrors extends index_1.InstanceErrors {
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
exports.VAOrderErrors = VAOrderErrors;
class VAOrderState extends index_1.InstanceState {
    get totalAmount() {
        return this._states.totalAmount;
    }
    get id() {
        return this._states.id;
    }
}
exports.VAOrderState = VAOrderState;
/* tslint:disable:object-literal-key-quotes */
/* tslint:disable:quotemark */
exports.VAORDER_SCHEMA = {
    "type": "object",
    "name": "VAOrder",
    "nameSpace": "view-avanced",
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
            "model": "VAOrderItem",
            "aggregationKind": "composite",
            "invRel": "order",
            "nameSpace": "view-avanced",
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
    "primaryKey": [
        "id"
    ],
    "meta": {},
    "viewsOfMe": {
        "view-avanced.VAOrderView": {
            "nameSpace": "view-avanced",
            "model": "VAOrderView",
            "relation": "order",
            "localFields": [
                "orderId"
            ],
            "foreignFields": [
                "id"
            ]
        }
    }
};

//# sourceMappingURL=vaorder.js.map
