"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
class UserList extends index_1.View {
    get userCount() {
        return this._children.userCount.value;
    }
    setUserCount(value) {
        return this._children.userCount.setValue(value);
    }
    get id() {
        return this._children.id.value;
    }
    get users() {
        return this._children.users;
    }
    get $states() {
        return this._states;
    }
    get $errors() {
        return this._errors;
    }
    init() {
        super.init();
        this._schema = exports.USERLIST_SCHEMA;
    }
    createStates() {
        this._states = new UserListState(this, this._schema);
    }
    createErrors() {
        this._errors = new UserListErrors(this, this._schema);
    }
}
UserList.isPersistent = false;
exports.UserList = UserList;
class UserListErrors extends index_1.InstanceErrors {
    get $() {
        return this._messages.$;
    }
    get userCount() {
        return this._messages.userCount;
    }
    get id() {
        return this._messages.id;
    }
    get users() {
        return this._messages.users;
    }
}
exports.UserListErrors = UserListErrors;
class UserListState extends index_1.InstanceState {
    get userCount() {
        return this._states.userCount;
    }
    get id() {
        return this._states.id;
    }
}
exports.UserListState = UserListState;
/* tslint:disable:object-literal-key-quotes */
/* tslint:disable:quotemark */
exports.USERLIST_SCHEMA = {
    "name": "UserList",
    "type": "object",
    "view": true,
    "nameSpace": "view-many",
    "properties": {
        "userCount": {
            "type": "integer",
            "default": 0
        },
        "id": {
            "type": "integer",
            "generated": true,
            "format": "id",
            "transient": false
        },
        "usersId": {
            "type": "array",
            "items": {
                "type": "integer",
                "isReadOnly": true,
                "format": "id",
                "transient": false
            }
        }
    },
    "relations": {
        "users": {
            "type": "hasMany",
            "model": "user",
            "aggregationKind": "composite",
            "nameSpace": "view-many",
            "title": "users",
            "localFields": [
                "usersId"
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

//# sourceMappingURL=user-list.js.map
