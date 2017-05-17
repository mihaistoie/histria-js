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
        let that = this;
        that._schema = exports.USERLIST_SCHEMA;
    }
    createStates() {
        let that = this;
        that._states = new UserListState(that, that._schema);
    }
    createErrors() {
        let that = this;
        that._errors = new UserListErrors(that, that._schema);
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
exports.USERLIST_SCHEMA = {
    name: 'UserList',
    type: 'object',
    view: true,
    nameSpace: 'view-many-view',
    properties: {
        userCount: {
            type: 'integer',
            default: 0
        },
        id: {
            type: 'integer',
            generated: true,
            format: 'id'
        },
        usersId: {
            type: 'array',
            items: {
                type: 'integer',
                isReadOnly: true,
                format: 'id'
            }
        }
    },
    relations: {
        users: {
            type: 'hasMany',
            model: 'user',
            aggregationKind: 'composite',
            invRel: 'list',
            nameSpace: 'view-many-view',
            title: 'users',
            localFields: [
                'usersId'
            ],
            foreignFields: [
                'id'
            ]
        }
    },
    meta: {}
};
