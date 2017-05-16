"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
class AdressView extends index_1.View {
    get street() {
        return this.getPropertyByName('street');
    }
    setStreet(value) {
        return this.setPropertyByName('street', value);
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
        that._schema = exports.ADRESSVIEW_SCHEMA;
    }
    createStates() {
        let that = this;
        that._states = new AdressViewState(that, that._schema);
    }
    createErrors() {
        let that = this;
        that._errors = new AdressViewErrors(that, that._schema);
    }
}
AdressView.isPersistent = false;
exports.AdressView = AdressView;
class AdressViewErrors extends index_1.InstanceErrors {
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
exports.AdressViewErrors = AdressViewErrors;
class AdressViewState extends index_1.InstanceState {
    get street() {
        return this._states.street;
    }
    get id() {
        return this._states.id;
    }
}
exports.AdressViewState = AdressViewState;
exports.ADRESSVIEW_SCHEMA = {
    name: 'AdressView',
    type: 'object',
    view: true,
    nameSpace: 'view-has-one-view',
    properties: {
        street: {
            title: 'Street',
            type: 'string'
        },
        id: {
            type: 'integer',
            generated: true,
            format: 'id'
        }
    },
    relations: {
        user: {
            type: 'belongsTo',
            model: 'UserDetail',
            invRel: 'address',
            nameSpace: 'view-has-one-view',
            title: 'user',
            aggregationKind: 'composite',
            localFields: [
                'id'
            ],
            foreignFields: [
                'addressId'
            ]
        }
    },
    meta: {
        parent: 'UserDetail'
    }
};
