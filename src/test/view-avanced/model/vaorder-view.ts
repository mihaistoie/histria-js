import {
    Instance, View, InstanceState, InstanceErrors, modelManager,
    HasManyComposition, HasManyAggregation, HasManyRefObject,
    ErrorState, State, StringState, IdState, BooleanState, IntegerState,
    EnumState, NumberState, DateState, DateTimeState, RefArrayState, RefObjectState,
    NumberValue
} from '../../../index';
import { VAOrder } from './vaorder';

export class VAOrderView extends View {
    public static isPersistent: boolean = false;
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
    public get $states(): VAOrderViewState {
        return this._states as VAOrderViewState;
    }
    public get $errors(): VAOrderViewErrors {
        return this._errors as VAOrderViewErrors;
    }
    protected init() {
        super.init();
        this._schema = VAORDERVIEW_SCHEMA;
    }
    protected createStates() {
        this._states = new VAOrderViewState(this, this._schema);
    }
    protected createErrors() {
        this._errors = new VAOrderViewErrors(this, this._schema);
    }
}

export class VAOrderViewErrors extends InstanceErrors {
    public get $(): ErrorState {
        return this._messages.$;
    }
    public get id(): ErrorState {
        return this._messages.id;
    }
    public get orderId(): ErrorState {
        return this._messages.orderId;
    }
}

export class VAOrderViewState extends InstanceState {
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
    VAORDERVIEW_SCHEMA = {
        "name": "VAOrderView",
        "type": "object",
        "view": true,
        "nameSpace": "view-avanced",
        "properties": {
            "id": {
                "type": "integer",
                "generated": true,
                "format": "id",
                "transient": false
            },
            "orderId": {
                "type": "integer",
                "isReadOnly": true,
                "format": "id",
                "transient": false
            }
        },
        "relations": {
            "order": {
                "type": "hasOne",
                "model": "VAOrder",
                "aggregationKind": "composite",
                "nameSpace": "view-avanced",
                "title": "order",
                "localFields": [
                    "orderId"
                ],
                "foreignFields": [
                    "id"
                ]
            }
        },
        "hooks": [
            {
                "type": "factory",
                "property": "order.items",
                "model": "VAOrderItemView",
                "relation": "orderItem",
                "nameSpace": "view-avanced"
            }
        ],
        "primaryKey": [
            "id"
        ],
        "meta": {}
    };