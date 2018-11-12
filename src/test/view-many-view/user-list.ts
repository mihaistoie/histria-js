import {
    Instance, View, InstanceState, InstanceErrors, modelManager,
    HasManyComposition, HasManyAggregation, HasManyRefObject,
    ErrorState, State, StringState, IdState, BooleanState, IntegerState,
    EnumState, NumberState, DateState, DateTimeState, RefArrayState, RefObjectState,
    NumberValue
} from '../../index';
import { User } from './user';

export class UserList extends View {
    public static isPersistent: boolean = false;
    public get userCount(): number {
        return this._children.userCount.value;
    }
    public setUserCount(value: number): Promise<number> {
        return this._children.userCount.setValue(value);
    }
    public get id(): any {
        return this._children.id.value;
    }
    get users(): HasManyComposition<User> {
        return this._children.users;
    }
    public get $states(): UserListState {
        return this._states as UserListState;
    }
    public get $errors(): UserListErrors {
        return this._errors as UserListErrors;
    }
    protected init() {
        super.init();
        this._schema = USERLIST_SCHEMA;
    }
    protected createStates() {
        this._states = new UserListState(this, this._schema);
    }
    protected createErrors() {
        this._errors = new UserListErrors(this, this._schema);
    }
}

export class UserListErrors extends InstanceErrors {
    public get $(): ErrorState {
        return this._messages.$;
    }
    public get userCount(): ErrorState {
        return this._messages.userCount;
    }
    public get id(): ErrorState {
        return this._messages.id;
    }
    public get users(): ErrorState {
        return this._messages.users;
    }
}

export class UserListState extends InstanceState {
    public get userCount(): IntegerState {
        return this._states.userCount;
    }
    public get id(): IdState {
        return this._states.id;
    }
}
/* tslint:disable:object-literal-key-quotes */
/* tslint:disable:quotemark */
export const
    USERLIST_SCHEMA = {
        "name": "UserList",
        "type": "object",
        "view": true,
        "nameSpace": "view-many-view",
        "properties": {
            "userCount": {
                "type": "integer",
                "default": 0
            },
            "id": {
                "type": "integer",
                "generated": true,
                "format": "id",
                "transient": false
            }
        },
        "relations": {
            "users": {
                "type": "hasMany",
                "model": "user",
                "aggregationKind": "composite",
                "invRel": "list",
                "nameSpace": "view-many-view",
                "title": "users",
                "localFields": [
                    "id"
                ],
                "foreignFields": [
                    "listId"
                ]
            }
        },
        "primaryKey": [
            "id"
        ],
        "meta": {}
    };