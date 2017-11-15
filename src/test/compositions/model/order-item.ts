import {
    Instance, View, InstanceState, InstanceErrors, modelManager,
    HasManyComposition, HasManyAggregation, HasManyRefObject,
    ErrorState, State, StringState, IdState, BooleanState, IntegerState,
    EnumState, NumberState, DateState, DateTimeState, RefArrayState, RefObjectState,
    NumberValue
} from '../../../index';
import { Order } from './order';


export class OrderItem extends Instance {
    public static isPersistent: boolean = true;
    public get amount(): NumberValue {
        return this._children.amount;
    }
    public get loaded(): boolean {
        return this.getPropertyByName('loaded');
    }
    public setLoaded(value: boolean): Promise<boolean> {
        return this.setPropertyByName('loaded', value);
    }
    public get id(): any {
        return this._children.id.value;
    }
    public get orderId(): any {
        return this._children.orderId.value;
    }
    public order(): Promise<Order> {
        return this._children.order.getValue();
    }
    public setOrder(value: Order): Promise<Order> {
        return this._children.order.setValue(value);
    }
    public get $states(): OrderItemState {
        return <OrderItemState>this._states;
    }
    public get $errors(): OrderItemErrors {
        return <OrderItemErrors>this._errors;
    }
    protected init() {
        super.init();
        let that = this;
        that._schema = ORDERITEM_SCHEMA;
    }
    protected createStates() {
        let that = this;
        that._states = new OrderItemState(that, that._schema);
    }
    protected createErrors() {
        let that = this;
        that._errors = new OrderItemErrors(that, that._schema);
    }
}

export class OrderItemErrors extends InstanceErrors {
    public get $(): ErrorState {
        return this._messages.$;
    }
    public get amount(): ErrorState {
        return this._messages.amount;
    }
    public get loaded(): ErrorState {
        return this._messages.loaded;
    }
    public get id(): ErrorState {
        return this._messages.id;
    }
    public get orderId(): ErrorState {
        return this._messages.orderId;
    }
}

export class OrderItemState extends InstanceState {
    public get amount(): NumberState {
        return this._states.amount;
    }
    public get loaded(): BooleanState {
        return this._states.loaded;
    }
    public get id(): IdState {
        return this._states.id;
    }
    public get orderId(): IdState {
        return this._states.orderId;
    }
}
/* tslint:disable:quotemark */
export const
    ORDERITEM_SCHEMA = {
        "type": "object",
        "name": "orderItem",
        "nameSpace": "compositions",
        "properties": {
            "amount": {
                "type": "number",
                "default": 0
            },
            "loaded": {
                "type": "boolean",
                "default": false
            },
            "id": {
                "type": "integer",
                "generated": true,
                "format": "id"
            },
            "orderId": {
                "type": "integer",
                "isReadOnly": true,
                "format": "id"
            }
        },
        "relations": {
            "order": {
                "type": "belongsTo",
                "model": "order",
                "aggregationKind": "composite",
                "invRel": "items",
                "nameSpace": "compositions",
                "title": "order",
                "invType": "hasMany",
                "localFields": [
                    "orderId"
                ],
                "foreignFields": [
                    "id"
                ]
            }
        },
        "meta": {
            "parent": "order",
            "parentRelation": "order"
        }
    };