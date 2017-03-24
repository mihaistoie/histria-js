"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../../index");
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
    get fullName() {
        return this.getPropertyByName('fullName');
    }
    setFullName(value) {
        return this.setPropertyByName('fullName', value);
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
    get fullName() {
        return this._messages.fullName;
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
    get fullName() {
        return this._states.fullName;
    }
    get id() {
        return this._states.id;
    }
}
exports.UserState = UserState;
exports.USER_SCHEMA = {
    name: 'user',
    type: 'object',
    nameSpace: 'salesorder',
    properties: {
        age: {
            title: 'Age',
            type: 'integer'
        },
        firstName: {
            title: 'First Name',
            type: 'string'
        },
        lastName: {
            title: 'Last Name',
            type: 'string'
        },
        fullName: {
            title: 'Full Name',
            type: 'string'
        },
        id: {
            type: 'integer',
            generated: true,
            format: 'id'
        }
    },
    states: {
        firstName: {
            isMandatory: true
        },
        fullName: {
            isReadOnly: true
        }
    },
    meta: {}
};
