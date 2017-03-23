"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../../index");
class Order extends index_1.Instance {
    init() {
        super.init();
        let that = this;
        that._schema = exports.ORDER_SCHEMA;
    }
    createStates() {
        let that = this;
        that._states = new OrderState(that, that._schema);
    }
    createErrors() {
        let that = this;
        that._errors = new OrderErrors(that, that._schema);
    }
    get totalAmount() {
        return this._children.totalAmount;
    }
    get id() {
        return this._children.id.value;
    }
    get items() {
        return this._children.items;
    }
    get $states() {
        return this._states;
    }
    get $errors() {
        return this._errors;
    }
}
exports.Order = Order;
class OrderErrors extends index_1.InstanceErrors {
    get $() {
        return this._messages.$;
    }
    get totalAmount() {
        return this._messages.totalAmount;
    }
    get id() {
        return this._messages.id;
    }
    get items() {
        return this._messages.items;
    }
}
exports.OrderErrors = OrderErrors;
class OrderState extends index_1.InstanceState {
    get totalAmount() {
        return this._states.totalAmount;
    }
    get id() {
        return this._states.id;
    }
}
exports.OrderState = OrderState;
exports.ORDER_SCHEMA = {
    type: 'object',
    name: 'order',
    nameSpace: 'compositions',
    properties: {
        totalAmount: {
            type: 'number',
            default: 0
        },
        id: {
            type: 'integer',
            generated: true,
            format: 'id'
        }
    },
    relations: {
        items: {
            type: 'hasMany',
            model: 'orderItem',
            aggregationKind: 'composite',
            invRel: 'order',
            nameSpace: 'compositions',
            title: 'items',
            invType: 'belongsTo',
            localFields: [
                'id'
            ],
            foreignFields: [
                'orderId'
            ]
        }
    },
    meta: {}
};
