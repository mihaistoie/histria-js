"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
class AddressView extends index_1.View {
    get street() {
        return this.getPropertyByName('street');
    }
    setStreet(value) {
        return this.setPropertyByName('street', value);
    }
    get id() {
        return this._children.id.value;
    }
    user() {
        return this._children.user.getValue();
    }
    setUser(value) {
        return this._children.user.setValue(value);
    }
    get $states() {
        return this._states;
    }
    get $errors() {
        return this._errors;
    }
    init() {
        super.init();
        this._schema = exports.ADDRESSVIEW_SCHEMA;
    }
    createStates() {
        this._states = new AddressViewState(this, this._schema);
    }
    createErrors() {
        this._errors = new AddressViewErrors(this, this._schema);
    }
}
AddressView.isPersistent = false;
exports.AddressView = AddressView;
class AddressViewErrors extends index_1.InstanceErrors {
    get $() {
        return this._messages.$;
    }
    get street() {
        return this._messages.street;
    }
    get id() {
        return this._messages.id;
    }
}
exports.AddressViewErrors = AddressViewErrors;
class AddressViewState extends index_1.InstanceState {
    get street() {
        return this._states.street;
    }
    get id() {
        return this._states.id;
    }
}
exports.AddressViewState = AddressViewState;
/* tslint:disable:object-literal-key-quotes */
/* tslint:disable:quotemark */
exports.ADDRESSVIEW_SCHEMA = {
    "name": "AddressView",
    "type": "object",
    "view": true,
    "nameSpace": "view-has-one-view",
    "properties": {
        "street": {
            "title": "Street",
            "type": "string"
        },
        "id": {
            "type": "integer",
            "generated": true,
            "format": "id",
            "transient": false
        }
    },
    "relations": {
        "user": {
            "type": "belongsTo",
            "model": "UserDetail",
            "invRel": "address",
            "nameSpace": "view-has-one-view",
            "title": "user",
            "aggregationKind": "composite",
            "localFields": [
                "id"
            ],
            "foreignFields": [
                "addressId"
            ]
        }
    },
    "primaryKey": [
        "id"
    ],
    "meta": {
        "parent": "UserDetail",
        "parentRelation": "user"
    }
};

//# sourceMappingURL=address-view.js.map
