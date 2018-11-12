"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../../index");
class VAOrderView extends index_1.View {
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
        this._schema = exports.VAORDERVIEW_SCHEMA;
    }
    createStates() {
        this._states = new VAOrderViewState(this, this._schema);
    }
    createErrors() {
        this._errors = new VAOrderViewErrors(this, this._schema);
    }
}
VAOrderView.isPersistent = false;
exports.VAOrderView = VAOrderView;
class VAOrderViewErrors extends index_1.InstanceErrors {
    get $() {
        return this._messages.$;
    }
    get id() {
        return this._messages.id;
    }
    get orderId() {
        return this._messages.orderId;
    }
}
exports.VAOrderViewErrors = VAOrderViewErrors;
class VAOrderViewState extends index_1.InstanceState {
    get id() {
        return this._states.id;
    }
    get orderId() {
        return this._states.orderId;
    }
}
exports.VAOrderViewState = VAOrderViewState;
/* tslint:disable:object-literal-key-quotes */
/* tslint:disable:quotemark */
exports.VAORDERVIEW_SCHEMA = {
    "name": "VAOrderView",
    "type": "object",
    "view": true,
    "nameSpace": "view-avanced",
    "properties": {
        "id": {
            "type": "integer",
            "generated": true,
            "format": "id",
            "transient": false
        },
        "orderId": {
            "type": "integer",
            "isReadOnly": true,
            "format": "id",
            "transient": false
        }
    },
    "relations": {
        "order": {
            "type": "hasOne",
            "model": "VAOrder",
            "aggregationKind": "composite",
            "nameSpace": "view-avanced",
            "title": "order",
            "localFields": [
                "orderId"
            ],
            "foreignFields": [
                "id"
            ]
        }
    },
    "hooks": [
        {
            "type": "factory",
            "property": "order.items",
            "model": "VAOrderItemView",
            "relation": "orderItem",
            "nameSpace": "view-avanced"
        }
    ],
    "primaryKey": [
        "id"
    ],
    "meta": {}
};

//# sourceMappingURL=vaorder-view.js.map
