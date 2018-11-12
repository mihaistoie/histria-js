"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
class User extends index_1.Instance {
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
    get $states() {
        return this._states;
    }
    get $errors() {
        return this._errors;
    }
    init() {
        super.init();
        this._schema = exports.USER_SCHEMA;
    }
    createStates() {
        this._states = new UserState(this, this._schema);
    }
    createErrors() {
        this._errors = new UserErrors(this, this._schema);
    }
}
User.isPersistent = true;
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
}
exports.UserState = UserState;
/* tslint:disable:object-literal-key-quotes */
/* tslint:disable:quotemark */
exports.USER_SCHEMA = {
    "name": "user",
    "type": "object",
    "nameSpace": "view-has-one-view",
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
            "format": "id",
            "transient": true
        }
    },
    "primaryKey": [
        "id"
    ],
    "meta": {},
    "viewsOfMe": {
        "view-has-one-view.UserDetail": {
            "nameSpace": "view-has-one-view",
            "model": "UserDetail",
            "relation": "user",
            "localFields": [
                "userId"
            ],
            "foreignFields": [
                "id"
            ]
        }
    }
};

//# sourceMappingURL=user.js.map
