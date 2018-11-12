import {
    Instance, View, InstanceState, InstanceErrors, modelManager,
    HasManyComposition, HasManyAggregation, HasManyRefObject,
    ErrorState, State, StringState, IdState, BooleanState, IntegerState,
    EnumState, NumberState, DateState, DateTimeState, RefArrayState, RefObjectState,
    NumberValue
} from '../../../index';
import { VAOrder } from './vaorder';

export class VAOrderItem extends Instance {
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
    public order(): Promise<VAOrder> {
        return this._children.order.getValue();
    }
    public setOrder(value: VAOrder): Promise<VAOrder> {
        return this._children.order.setValue(value);
    }
    public get $states(): VAOrderItemState {
        return this._states as VAOrderItemState;
    }
    public get $errors(): VAOrderItemErrors {
        return this._errors as VAOrderItemErrors;
    }
    protected init() {
        super.init();
        this._schema = VAORDERITEM_SCHEMA;
    }
    protected createStates() {
        this._states = new VAOrderItemState(this, this._schema);
    }
    protected createErrors() {
        this._errors = new VAOrderItemErrors(this, this._schema);
    }
}

export class VAOrderItemErrors extends InstanceErrors {
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

export class VAOrderItemState extends InstanceState {
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
/* tslint:disable:object-literal-key-quotes */
/* tslint:disable:quotemark */
export const
    VAORDERITEM_SCHEMA = {
        "type": "object",
        "name": "VAOrderItem",
        "nameSpace": "view-avanced",
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
                "format": "id",
                "transient": true
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
                "model": "VAOrder",
                "aggregationKind": "composite",
                "invRel": "items",
                "nameSpace": "view-avanced",
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
        "primaryKey": [
            "id"
        ],
        "meta": {
            "parent": "VAOrder",
            "parentRelation": "order"
        },
        "viewsOfMe": {
            "view-avanced.VAOrderItemView": {
                "nameSpace": "view-avanced",
                "model": "VAOrderItemView",
                "relation": "orderItem",
                "localFields": [
                    "orderItemId"
                ],
                "foreignFields": [
                    "id"
                ]
            }
        }
    };