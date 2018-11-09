import {
    Instance, View, InstanceState, InstanceErrors, modelManager,
    HasManyComposition, HasManyAggregation, HasManyRefObject,
    ErrorState, State, StringState, IdState, BooleanState, IntegerState,
    EnumState, NumberState, DateState, DateTimeState, RefArrayState, RefObjectState,
    NumberValue
} from '../../index';
import { UserDetail } from './user-detail';


export class AddressView extends View {
    public static isPersistent: boolean = false;
    public get street(): string {
        return this.getPropertyByName('street');
    }
    public setStreet(value: string): Promise<string> {
        return this.setPropertyByName('street', value);
    }
    public get id(): any {
        return this._children.id.value;
    }
    public user(): Promise<UserDetail> {
        return this._children.user.getValue();
    }
    public setUser(value: UserDetail): Promise<UserDetail> {
        return this._children.user.setValue(value);
    }
    public get $states(): AddressViewState {
        return this._states as AddressViewState;
    }
    public get $errors(): AddressViewErrors {
        return this._errors as AddressViewErrors;
    }
    protected init() {
        super.init();
        this._schema = ADDRESSVIEW_SCHEMA;
    }
    protected createStates() {
        this._states = new AddressViewState(this, this._schema);
    }
    protected createErrors() {
        this._errors = new AddressViewErrors(this, this._schema);
    }
}

export class AddressViewErrors extends InstanceErrors {
    public get $(): ErrorState {
        return this._messages.$;
    }
    public get street(): ErrorState {
        return this._messages.street;
    }
    public get id(): ErrorState {
        return this._messages.id;
    }
}

export class AddressViewState extends InstanceState {
    public get street(): StringState {
        return this._states.street;
    }
    public get id(): IdState {
        return this._states.id;
    }
}
/* tslint:disable:quotemark */
export const
    ADDRESSVIEW_SCHEMA = {
        "name": "AddressView",
        "type": "object",
        "view": true,
        "nameSpace": "view-has-one-view",
        "properties": {
            "street": {
                "title": "Street",
                "type": "string"
            },
            "id": {
                "type": "integer",
                "generated": true,
                "format": "id",
                "transient": false
            }
        },
        "relations": {
            "user": {
                "type": "belongsTo",
                "model": "UserDetail",
                "invRel": "address",
                "nameSpace": "view-has-one-view",
                "title": "user",
                "aggregationKind": "composite",
                "localFields": [
                    "id"
                ],
                "foreignFields": [
                    "addressId"
                ]
            }
        },
        "primaryKey": [
            "id"
        ],
        "meta": {
            "parent": "UserDetail",
            "parentRelation": "user"
        }
    };