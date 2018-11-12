import {
    Instance, View, InstanceState, InstanceErrors, modelManager,
    HasManyComposition, HasManyAggregation, HasManyRefObject,
    ErrorState, State, StringState, IdState, BooleanState, IntegerState,
    EnumState, NumberState, DateState, DateTimeState, RefArrayState, RefObjectState,
    NumberValue
} from '../../index';
import { User } from './user';

export class UserDetail extends View {
    public static isPersistent: boolean = false;
    public get fullName(): string {
        return this.getPropertyByName('fullName');
    }
    public setFullName(value: string): Promise<string> {
        return this.setPropertyByName('fullName', value);
    }
    public get id(): any {
        return this._children.id.value;
    }
    public get userId(): any {
        return this._children.userId.value;
    }
    public user(): Promise<User> {
        return this._children.user.getValue();
    }
    public setUser(value: User): Promise<User> {
        return this._children.user.setValue(value);
    }
    public get $states(): UserDetailState {
        return this._states as UserDetailState;
    }
    public get $errors(): UserDetailErrors {
        return this._errors as UserDetailErrors;
    }
    protected init() {
        super.init();
        this._schema = USERDETAIL_SCHEMA;
    }
    protected createStates() {
        this._states = new UserDetailState(this, this._schema);
    }
    protected createErrors() {
        this._errors = new UserDetailErrors(this, this._schema);
    }
}

export class UserDetailErrors extends InstanceErrors {
    public get $(): ErrorState {
        return this._messages.$;
    }
    public get fullName(): ErrorState {
        return this._messages.fullName;
    }
    public get id(): ErrorState {
        return this._messages.id;
    }
    public get userId(): ErrorState {
        return this._messages.userId;
    }
}

export class UserDetailState extends InstanceState {
    public get fullName(): StringState {
        return this._states.fullName;
    }
    public get id(): IdState {
        return this._states.id;
    }
    public get userId(): IdState {
        return this._states.userId;
    }
}
/* tslint:disable:object-literal-key-quotes */
/* tslint:disable:quotemark */
export const
    USERDETAIL_SCHEMA = {
        "name": "UserDetail",
        "type": "object",
        "view": true,
        "nameSpace": "view-one",
        "properties": {
            "fullName": {
                "title": "FullName Name",
                "type": "string"
            },
            "id": {
                "type": "integer",
                "generated": true,
                "format": "id",
                "transient": false
            },
            "userId": {
                "type": "integer",
                "isReadOnly": true,
                "format": "id",
                "transient": false
            }
        },
        "relations": {
            "user": {
                "type": "hasOne",
                "model": "user",
                "embedded": true,
                "aggregationKind": "composite",
                "nameSpace": "view-one",
                "title": "user",
                "localFields": [
                    "userId"
                ],
                "foreignFields": [
                    "id"
                ]
            }
        },
        "states": {
            "fullName": {
                "isReadOnly": true
            }
        },
        "primaryKey": [
            "id"
        ],
        "meta": {}
    };