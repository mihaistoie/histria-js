"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../../index");
class VAOrderItemView extends index_1.View {
    get id() {
        return this._children.id.value;
    }
    get orderitemId() {
        return this._children.orderitemId.value;
    }
    orderitem() {
        return this._children.orderitem.getValue();
    }
    setOrderitem(value) {
        return this._children.orderitem.setValue(value);
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
        that._schema = exports.VAORDERITEMVIEW_SCHEMA;
    }
    createStates() {
        let that = this;
        that._states = new VAOrderItemViewState(that, that._schema);
    }
    createErrors() {
        let that = this;
        that._errors = new VAOrderItemViewErrors(that, that._schema);
    }
}
VAOrderItemView.isPersistent = false;
exports.VAOrderItemView = VAOrderItemView;
class VAOrderItemViewErrors extends index_1.InstanceErrors {
    get $() {
        return this._messages.$;
    }
    get id() {
        return this._messages.id;
    }
    get orderitemId() {
        return this._messages.orderitemId;
    }
}
exports.VAOrderItemViewErrors = VAOrderItemViewErrors;
class VAOrderItemViewState extends index_1.InstanceState {
    get id() {
        return this._states.id;
    }
    get orderitemId() {
        return this._states.orderitemId;
    }
}
exports.VAOrderItemViewState = VAOrderItemViewState;
exports.VAORDERITEMVIEW_SCHEMA = {
    name: 'VAOrderItemView',
    type: 'object',
    view: true,
    nameSpace: 'view-avanced',
    properties: {
        id: {
            type: 'integer',
            generated: true,
            format: 'id'
        },
        orderitemId: {
            type: 'integer',
            isReadOnly: true,
            format: 'id'
        }
    },
    relations: {
        orderitem: {
            default: true,
            type: 'hasOne',
            model: 'VAOrderItem',
            aggregationKind: 'composite',
            nameSpace: 'view-avanced',
            title: 'orderitem',
            localFields: [
                'orderitemId'
            ],
            foreignFields: [
                'id'
            ]
        }
    },
    meta: {}
};
