import {
    Instance, View, InstanceState, InstanceErrors, modelManager,
    HasManyComposition, HasManyAggregation, HasManyRefObject,
    ErrorState, State, StringState, IdState, BooleanState, IntegerState,
    EnumState, NumberState, DateState, DateTimeState, RefArrayState, RefObjectState,
    NumberValue
} from '../../../index';
import { VAOrderItem } from './vaorder-item';

export class VAOrderItemView extends View {
    public static isPersistent: boolean = false;
    public get id(): any {
        return this._children.id.value;
    }
    public get orderItemId(): any {
        return this._children.orderItemId.value;
    }
    public orderItem(): Promise<VAOrderItem> {
        return this._children.orderItem.getValue();
    }
    public setOrderItem(value: VAOrderItem): Promise<VAOrderItem> {
        return this._children.orderItem.setValue(value);
    }
    public get $states(): VAOrderItemViewState {
        return this._states as VAOrderItemViewState;
    }
    public get $errors(): VAOrderItemViewErrors {
        return this._errors as VAOrderItemViewErrors;
    }
    protected init() {
        super.init();
        this._schema = VAORDERITEMVIEW_SCHEMA;
    }
    protected createStates() {
        this._states = new VAOrderItemViewState(this, this._schema);
    }
    protected createErrors() {
        this._errors = new VAOrderItemViewErrors(this, this._schema);
    }
}

export class VAOrderItemViewErrors extends InstanceErrors {
    public get $(): ErrorState {
        return this._messages.$;
    }
    public get id(): ErrorState {
        return this._messages.id;
    }
    public get orderItemId(): ErrorState {
        return this._messages.orderItemId;
    }
}

export class VAOrderItemViewState extends InstanceState {
    public get id(): IdState {
        return this._states.id;
    }
    public get orderItemId(): IdState {
        return this._states.orderItemId;
    }
}
/* tslint:disable:object-literal-key-quotes */
/* tslint:disable:quotemark */
export const
    VAORDERITEMVIEW_SCHEMA = {
        "name": "VAOrderItemView",
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
            "orderItemId": {
                "type": "integer",
                "isReadOnly": true,
                "format": "id",
                "transient": false
            }
        },
        "relations": {
            "orderItem": {
                "default": true,
                "type": "hasOne",
                "model": "VAOrderItem",
                "aggregationKind": "composite",
                "nameSpace": "view-avanced",
                "title": "orderItem",
                "localFields": [
                    "orderItemId"
                ],
                "foreignFields": [
                    "id"
                ]
            }
        },
        "primaryKey": [
            "id"
        ],
        "meta": {}
    };