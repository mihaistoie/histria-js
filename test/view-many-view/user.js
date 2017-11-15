"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
class User extends index_1.View {
    get age() {
        return this._children.age.value;
    }
    setAge(value) {
        return this._children.age.setValue(value);
    }
    get firstName() {
        return this.getPropertyByName('firstName');
    }
    setFirstName(value) {
        return this.setPropertyByName('firstName', value);
    }
    get lastName() {
        return this.getPropertyByName('lastName');
    }
    setLastName(value) {
        return this.setPropertyByName('lastName', value);
    }
    get id() {
        return this._children.id.value;
    }
    get listId() {
        return this._children.listId.value;
    }
    list() {
        return this._children.list.getValue();
    }
    setList(value) {
        return this._children.list.setValue(value);
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
        that._schema = exports.USER_SCHEMA;
    }
    createStates() {
        let that = this;
        that._states = new UserState(that, that._schema);
    }
    createErrors() {
        let that = this;
        that._errors = new UserErrors(that, that._schema);
    }
}
User.isPersistent = false;
exports.User = User;
class UserErrors extends index_1.InstanceErrors {
    get $() {
        return this._messages.$;
    }
    get age() {
        return this._messages.age;
    }
    get firstName() {
        return this._messages.firstName;
    }
    get lastName() {
        return this._messages.lastName;
    }
    get id() {
        return this._messages.id;
    }
    get listId() {
        return this._messages.listId;
    }
}
exports.UserErrors = UserErrors;
class UserState extends index_1.InstanceState {
    get age() {
        return this._states.age;
    }
    get firstName() {
        return this._states.firstName;
    }
    get lastName() {
        return this._states.lastName;
    }
    get id() {
        return this._states.id;
    }
    get listId() {
        return this._states.listId;
    }
}
exports.UserState = UserState;
/* tslint:disable:quotemark */
exports.USER_SCHEMA = {
    "name": "user",
    "view": true,
    "type": "object",
    "nameSpace": "view-many-view",
    "properties": {
        "age": {
            "title": "Age",
            "type": "integer"
        },
        "firstName": {
            "title": "First Name",
            "type": "string"
        },
        "lastName": {
            "title": "Last Name",
            "type": "string"
        },
        "id": {
            "type": "integer",
            "generated": true,
            "format": "id"
        },
        "listId": {
            "type": "integer",
            "isReadOnly": true,
            "format": "id"
        }
    },
    "relations": {
        "list": {
            "type": "belongsTo",
            "model": "UserList",
            "aggregationKind": "composite",
            "invRel": "users",
            "nameSpace": "view-many-view",
            "title": "list",
            "localFields": [
                "listId"
            ],
            "foreignFields": [
                "id"
            ]
        }
    },
    "meta": {
        "parent": "UserList",
        "parentRelation": "list"
    }
};
