import {
    Instance, View, InstanceState, InstanceErrors, modelManager,
    HasManyComposition, HasManyAggregation, HasManyRefObject,
    ErrorState, State, StringState, IdState, BooleanState, IntegerState,
    EnumState, NumberState, DateState, DateTimeState, RefArrayState, RefObjectState,
    NumberValue
} from '../../../index';
import { Group } from './group';

export class Item extends Instance {
    public static isPersistent: boolean = true;
    public get id(): any {
        return this._children.id.value;
    }
    public get groupId(): any {
        return this._children.groupId.value;
    }
    get groups(): HasManyComposition<Group> {
        return this._children.groups;
    }
    public group(): Promise<Group> {
        return this._children.group.getValue();
    }
    public setGroup(value: Group): Promise<Group> {
        return this._children.group.setValue(value);
    }
    public get $states(): ItemState {
        return this._states as ItemState;
    }
    public get $errors(): ItemErrors {
        return this._errors as ItemErrors;
    }
    protected init() {
        super.init();
        this._schema = ITEM_SCHEMA;
    }
    protected createStates() {
        this._states = new ItemState(this, this._schema);
    }
    protected createErrors() {
        this._errors = new ItemErrors(this, this._schema);
    }
}

export class ItemErrors extends InstanceErrors {
    public get $(): ErrorState {
        return this._messages.$;
    }
    public get id(): ErrorState {
        return this._messages.id;
    }
    public get groupId(): ErrorState {
        return this._messages.groupId;
    }
    public get groups(): ErrorState {
        return this._messages.groups;
    }
}

export class ItemState extends InstanceState {
    public get id(): IdState {
        return this._states.id;
    }
    public get groupId(): IdState {
        return this._states.groupId;
    }
}
/* tslint:disable:object-literal-key-quotes */
/* tslint:disable:quotemark */
export const
    ITEM_SCHEMA = {
        "type": "object",
        "name": "item",
        "nameSpace": "cyclicreferences",
        "properties": {
            "id": {
                "type": "integer",
                "generated": true,
                "format": "id",
                "transient": true
            },
            "groupId": {
                "type": "integer",
                "isReadOnly": true,
                "format": "id"
            }
        },
        "relations": {
            "groups": {
                "type": "hasMany",
                "model": "group",
                "aggregationKind": "composite",
                "invRel": "item",
                "nameSpace": "cyclicreferences",
                "title": "groups",
                "invType": "belongsTo",
                "localFields": [
                    "id"
                ],
                "foreignFields": [
                    "itemId"
                ]
            },
            "group": {
                "type": "belongsTo",
                "model": "group",
                "aggregationKind": "composite",
                "invRel": "items",
                "nameSpace": "cyclicreferences",
                "title": "group",
                "invType": "hasMany",
                "localFields": [
                    "groupId"
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
            "parent": "group",
            "parentRelation": "group"
        }
    };