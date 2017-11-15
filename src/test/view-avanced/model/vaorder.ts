import {
    Instance, View, InstanceState, InstanceErrors, modelManager,
    HasManyComposition, HasManyAggregation, HasManyRefObject,
    ErrorState, State, StringState, IdState, BooleanState, IntegerState,
    EnumState, NumberState, DateState, DateTimeState, RefArrayState, RefObjectState,
    NumberValue
} from '../../../index';
import { VAOrderItem } from './vaorder-item';


export class VAOrder extends Instance {
    public static isPersistent: boolean = true;
    public get totalAmount(): NumberValue {
        return this._children.totalAmount;
    }
    public get id(): any {
        return this._children.id.value;
    }
    get items(): HasManyComposition<VAOrderItem> {
        return this._children.items;
    }
    public get $states(): VAOrderState {
        return <VAOrderState>this._states;
    }
    public get $errors(): VAOrderErrors {
        return <VAOrderErrors>this._errors;
    }
    protected init() {
        super.init();
        let that = this;
        that._schema = VAORDER_SCHEMA;
    }
    protected createStates() {
        let that = this;
        that._states = new VAOrderState(that, that._schema);
    }
    protected createErrors() {
        let that = this;
        that._errors = new VAOrderErrors(that, that._schema);
    }
}

export class VAOrderErrors extends InstanceErrors {
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

export class VAOrderState extends InstanceState {
    public get totalAmount(): NumberState {
        return this._states.totalAmount;
    }
    public get id(): IdState {
        return this._states.id;
    }
}
/* tslint:disable:quotemark */
export const
    VAORDER_SCHEMA = {
        "type": "object",
        "name": "VAOrder",
        "nameSpace": "view-avanced",
        "properties": {
            "totalAmount": {
                "type": "number",
                "default": 0
            },
            "id": {
                "type": "integer",
                "generated": true,
                "format": "id"
            }
        },
        "relations": {
            "items": {
                "type": "hasMany",
                "model": "VAOrderItem",
                "aggregationKind": "composite",
                "invRel": "order",
                "nameSpace": "view-avanced",
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
        "viewsOfMe": {
            "view-avanced.VAOrder": {
                "nameSpace": "view-avanced",
                "model": "VAOrderView",
                "relation": "order",
                "localFields": [
                    "orderId"
                ],
                "foreignFields": [
                    "id"
                ]
            }
        }
    };