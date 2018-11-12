import {
    Instance, View, InstanceState, InstanceErrors, modelManager,
    HasManyComposition, HasManyAggregation, HasManyRefObject,
    ErrorState, State, StringState, IdState, BooleanState, IntegerState,
    EnumState, NumberState, DateState, DateTimeState, RefArrayState, RefObjectState,
    NumberValue
} from '../../../index';
import { OrderItem } from './order-item';

export class Order extends Instance {
    public static isPersistent: boolean = true;
    public get totalAmount(): NumberValue {
        return this._children.totalAmount;
    }
    public get id(): any {
        return this._children.id.value;
    }
    get items(): HasManyComposition<OrderItem> {
        return this._children.items;
    }
    public get $states(): OrderState {
        return this._states as OrderState;
    }
    public get $errors(): OrderErrors {
        return this._errors as OrderErrors;
    }
    protected init() {
        super.init();
        this._schema = ORDER_SCHEMA;
    }
    protected createStates() {
        this._states = new OrderState(this, this._schema);
    }
    protected createErrors() {
        this._errors = new OrderErrors(this, this._schema);
    }
}

export class OrderErrors extends InstanceErrors {
    public get $(): ErrorState {
        return this._messages.$;
    }
    public get totalAmount(): ErrorState {
        return this._messages.totalAmount;
    }
    public get id(): ErrorState {
        return this._messages.id;
    }
    public get items(): ErrorState {
        return this._messages.items;
    }
}

export class OrderState extends InstanceState {
    public get totalAmount(): NumberState {
        return this._states.totalAmount;
    }
    public get id(): IdState {
        return this._states.id;
    }
}
/* tslint:disable:object-literal-key-quotes */
/* tslint:disable:quotemark */
export const
    ORDER_SCHEMA = {
        "type": "object",
        "name": "order",
        "nameSpace": "compositions",
        "properties": {
            "totalAmount": {
                "type": "number",
                "default": 0
            },
            "id": {
                "type": "integer",
                "generated": true,
                "format": "id",
                "transient": true
            }
        },
        "relations": {
            "items": {
                "type": "hasMany",
                "model": "orderItem",
                "aggregationKind": "composite",
                "invRel": "order",
                "nameSpace": "compositions",
                "title": "items",
                "invType": "belongsTo",
                "localFields": [
                    "id"
                ],
                "foreignFields": [
                    "orderId"
                ]
            }
        },
        "meta": {},
        "primaryKey": [
            "id"
        ]
    };