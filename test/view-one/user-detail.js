"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
class UserDetail extends index_1.View {
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
    get fullName() {
        return this.getPropertyByName('fullName');
    }
    setFullName(value) {
        return this.setPropertyByName('fullName', value);
    }
    get id() {
        return this._children.id.value;
    }
    get masterId() {
        return this._children.masterId.value;
    }
    master() {
        return this._children.master.getValue();
    }
    setMaster(value) {
        return this._children.master.setValue(value);
    }
    get $states() {
        return this._states;
    }
    get $errors() {
        return this._errors;
    }
}
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
    get masterId() {
        return this._messages.masterId;
    }
    get master() {
        return this._messages.master;
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
    get masterId() {
        return this._states.masterId;
    }
}
exports.UserDetailState = UserDetailState;
exports.USERDETAIL_SCHEMA = {
    name: 'UserDetail',
    type: 'object',
    view: true,
    nameSpace: 'view-one',
    properties: {
        fullName: {
            title: 'FullName Name',
            type: 'string'
        },
        id: {
            type: 'integer',
            generated: true,
            format: 'id'
        },
        masterId: {
            type: 'integer',
            isReadOnly: true,
            format: 'id'
        }
    },
    relations: {
        master: {
            type: 'hasOne',
            model: 'user',
            aggregationKind: 'composite',
            nameSpace: 'view-one',
            title: 'master',
            localFields: [
                'masterId'
            ],
            foreignFields: [
                'id'
            ]
        }
    },
    states: {
        fullName: {
            isReadOnly: true
        }
    },
    meta: {}
};
