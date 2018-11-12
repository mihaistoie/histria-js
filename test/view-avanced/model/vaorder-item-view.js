"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../../index");
class VAOrderItemView extends index_1.View {
    get id() {
        return this._children.id.value;
    }
    get orderItemId() {
        return this._children.orderItemId.value;
    }
    orderItem() {
        return this._children.orderItem.getValue();
    }
    setOrderItem(value) {
        return this._children.orderItem.setValue(value);
    }
    get $states() {
        return this._states;
    }
    get $errors() {
        return this._errors;
    }
    init() {
        super.init();
        this._schema = exports.VAORDERITEMVIEW_SCHEMA;
    }
    createStates() {
        this._states = new VAOrderItemViewState(this, this._schema);
    }
    createErrors() {
        this._errors = new VAOrderItemViewErrors(this, this._schema);
    }
}
VAOrderItemView.isPersistent = false;
exports.VAOrderItemView = VAOrderItemView;
class VAOrderItemViewErrors extends index_1.InstanceErrors {
    get $() {
        return this._messages.$;
    }
    get id() {
        return this._messages.id;
    }
    get orderItemId() {
        return this._messages.orderItemId;
    }
}
exports.VAOrderItemViewErrors = VAOrderItemViewErrors;
class VAOrderItemViewState extends index_1.InstanceState {
    get id() {
        return this._states.id;
    }
    get orderItemId() {
        return this._states.orderItemId;
    }
}
exports.VAOrderItemViewState = VAOrderItemViewState;
/* tslint:disable:object-literal-key-quotes */
/* tslint:disable:quotemark */
exports.VAORDERITEMVIEW_SCHEMA = {
    "name": "VAOrderItemView",
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
        "orderItemId": {
            "type": "integer",
            "isReadOnly": true,
            "format": "id",
            "transient": false
        }
    },
    "relations": {
        "orderItem": {
            "default": true,
            "type": "hasOne",
            "model": "VAOrderItem",
            "aggregationKind": "composite",
            "nameSpace": "view-avanced",
            "title": "orderItem",
            "localFields": [
                "orderItemId"
            ],
            "foreignFields": [
                "id"
            ]
        }
    },
    "primaryKey": [
        "id"
    ],
    "meta": {}
};

//# sourceMappingURL=vaorder-item-view.js.map
