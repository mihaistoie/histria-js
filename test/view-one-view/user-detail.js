"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
class UserDetail extends index_1.View {
    get fullName() {
        return this.getPropertyByName('fullName');
    }
    setFullName(value) {
        return this.setPropertyByName('fullName', value);
    }
    get id() {
        return this._children.id.value;
    }
    get userId() {
        return this._children.userId.value;
    }
    get addressId() {
        return this._children.addressId.value;
    }
    user() {
        return this._children.user.getValue();
    }
    setUser(value) {
        return this._children.user.setValue(value);
    }
    address() {
        return this._children.address.getValue();
    }
    setAddress(value) {
        return this._children.address.setValue(value);
    }
    get $states() {
        return this._states;
    }
    get $errors() {
        return this._errors;
    }
    init() {
        super.init();
        let that = this;
        that._schema = exports.USERDETAIL_SCHEMA;
    }
    createStates() {
        let that = this;
        that._states = new UserDetailState(that, that._schema);
    }
    createErrors() {
        let that = this;
        that._errors = new UserDetailErrors(that, that._schema);
    }
}
UserDetail.isPersistent = false;
exports.UserDetail = UserDetail;
class UserDetailErrors extends index_1.InstanceErrors {
    get $() {
        return this._messages.$;
    }
    get fullName() {
        return this._messages.fullName;
    }
    get id() {
        return this._messages.id;
    }
    get userId() {
        return this._messages.userId;
    }
    get addressId() {
        return this._messages.addressId;
    }
}
exports.UserDetailErrors = UserDetailErrors;
class UserDetailState extends index_1.InstanceState {
    get fullName() {
        return this._states.fullName;
    }
    get id() {
        return this._states.id;
    }
    get userId() {
        return this._states.userId;
    }
    get addressId() {
        return this._states.addressId;
    }
}
exports.UserDetailState = UserDetailState;
/* tslint:disable:quotemark */
exports.USERDETAIL_SCHEMA = {
    "name": "UserDetail",
    "type": "object",
    "view": true,
    "nameSpace": "view-has-one-view",
    "properties": {
        "fullName": {
            "title": "FullName Name",
            "type": "string"
        },
        "id": {
            "type": "integer",
            "generated": true,
            "format": "id"
        },
        "userId": {
            "type": "integer",
            "isReadOnly": true,
            "format": "id"
        },
        "addressId": {
            "type": "integer",
            "isReadOnly": true,
            "format": "id"
        }
    },
    "relations": {
        "user": {
            "type": "hasOne",
            "model": "user",
            "aggregationKind": "composite",
            "nameSpace": "view-has-one-view",
            "title": "user",
            "localFields": [
                "userId"
            ],
            "foreignFields": [
                "id"
            ]
        },
        "address": {
            "type": "hasOne",
            "model": "AddressView",
            "aggregationKind": "composite",
            "invRel": "user",
            "nameSpace": "view-has-one-view",
            "title": "address",
            "localFields": [
                "addressId"
            ],
            "foreignFields": [
                "id"
            ]
        }
    },
    "states": {
        "fullName": {
            "isReadOnly": true
        }
    },
    "meta": {}
};
