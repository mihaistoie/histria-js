"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../../index");
class VROrderView extends index_1.View {
    get id() {
        return this._children.id.value;
    }
    get orderId() {
        return this._children.orderId.value;
    }
    order() {
        return this._children.order.getValue();
    }
    setOrder(value) {
        return this._children.order.setValue(value);
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
        that._schema = exports.VRORDERVIEW_SCHEMA;
    }
    createStates() {
        let that = this;
        that._states = new VROrderViewState(that, that._schema);
    }
    createErrors() {
        let that = this;
        that._errors = new VROrderViewErrors(that, that._schema);
    }
}
VROrderView.isPersistent = false;
exports.VROrderView = VROrderView;
class VROrderViewErrors extends index_1.InstanceErrors {
    get $() {
        return this._messages.$;
    }
    get id() {
        return this._messages.id;
    }
    get orderId() {
        return this._messages.orderId;
    }
}
exports.VROrderViewErrors = VROrderViewErrors;
class VROrderViewState extends index_1.InstanceState {
    get id() {
        return this._states.id;
    }
    get orderId() {
        return this._states.orderId;
    }
}
exports.VROrderViewState = VROrderViewState;
exports.VRORDERVIEW_SCHEMA = {
    name: 'VROrderView',
    type: 'object',
    view: true,
    nameSpace: 'view-avanced',
    properties: {
        id: {
            type: 'integer',
            generated: true,
            format: 'id'
        },
        orderId: {
            type: 'integer',
            isReadOnly: true,
            format: 'id'
        }
    },
    relations: {
        order: {
            type: 'hasOne',
            model: 'VAOrder',
            aggregationKind: 'composite',
            nameSpace: 'view-avanced',
            title: 'order',
            localFields: [
                'orderId'
            ],
            foreignFields: [
                'id'
            ]
        }
    },
    meta: {}
};
