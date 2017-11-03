"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../../index");
class VAOrderItem extends index_1.Instance {
    get amount() {
        return this._children.amount;
    }
    get loaded() {
        return this.getPropertyByName('loaded');
    }
    setLoaded(value) {
        return this.setPropertyByName('loaded', value);
    }
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
        that._schema = exports.VAORDERITEM_SCHEMA;
    }
    createStates() {
        let that = this;
        that._states = new VAOrderItemState(that, that._schema);
    }
    createErrors() {
        let that = this;
        that._errors = new VAOrderItemErrors(that, that._schema);
    }
}
VAOrderItem.isPersistent = true;
exports.VAOrderItem = VAOrderItem;
class VAOrderItemErrors extends index_1.InstanceErrors {
    get $() {
        return this._messages.$;
    }
    get amount() {
        return this._messages.amount;
    }
    get loaded() {
        return this._messages.loaded;
    }
    get id() {
        return this._messages.id;
    }
    get orderId() {
        return this._messages.orderId;
    }
}
exports.VAOrderItemErrors = VAOrderItemErrors;
class VAOrderItemState extends index_1.InstanceState {
    get amount() {
        return this._states.amount;
    }
    get loaded() {
        return this._states.loaded;
    }
    get id() {
        return this._states.id;
    }
    get orderId() {
        return this._states.orderId;
    }
}
exports.VAOrderItemState = VAOrderItemState;
exports.VAORDERITEM_SCHEMA = {
    type: 'object',
    name: 'VAOrderItem',
    nameSpace: 'view-avanced',
    properties: {
        amount: {
            type: 'number',
            default: 0
        },
        loaded: {
            type: 'boolean',
            default: false
        },
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
            type: 'belongsTo',
            model: 'VAOrder',
            aggregationKind: 'composite',
            invRel: 'items',
            nameSpace: 'view-avanced',
            title: 'order',
            invType: 'hasMany',
            localFields: [
                'orderId'
            ],
            foreignFields: [
                'id'
            ]
        }
    },
    meta: {
        parent: 'VAOrder',
        parentRelation: 'order'
    }
};
