import {
    Instance, View, InstanceState, InstanceErrors, modelManager,
    HasManyComposition, HasManyAggregation, HasManyRefObject,
    ErrorState, State, StringState, IdState, BooleanState, IntegerState,
    EnumState, NumberState, DateState, DateTimeState, RefArrayState, RefObjectState,
    NumberValue
} from '../../../index';
import { Item } from './item';


export class Group extends View {
    public static isPersistent: boolean = false;
    public get id(): any {
        return this._children.id.value;
    }
    public get itemId(): any {
        return this._children.itemId.value;
    }
    get items(): HasManyComposition<Item> {
        return this._children.items;
    }
    public item(): Promise<Item> {
        return this._children.item.getValue();
    }
    public setItem(value: Item): Promise<Item> {
        return this._children.item.setValue(value);
    }
    public get $states(): GroupState {
        return this._states as GroupState;
    }
    public get $errors(): GroupErrors {
        return this._errors as GroupErrors;
    }
    protected init() {
        super.init();
        this._schema = GROUP_SCHEMA;
    }
    protected createStates() {
        this._states = new GroupState(this, this._schema);
    }
    protected createErrors() {
        this._errors = new GroupErrors(this, this._schema);
    }
}

export class GroupErrors extends InstanceErrors {
    public get $(): ErrorState {
        return this._messages.$;
    }
    public get id(): ErrorState {
        return this._messages.id;
    }
    public get itemId(): ErrorState {
        return this._messages.itemId;
    }
    public get items(): ErrorState {
        return this._messages.items;
    }
}

export class GroupState extends InstanceState {
    public get id(): IdState {
        return this._states.id;
    }
    public get itemId(): IdState {
        return this._states.itemId;
    }
}
/* tslint:disable:quotemark */
export const
    GROUP_SCHEMA = {
        "type": "object",
        "name": "group",
        "view": true,
        "nameSpace": "cyclicreferencesviews",
        "properties": {
            "id": {
                "type": "integer",
                "generated": true,
                "format": "id",
                "transient": false
            },
            "itemId": {
                "type": "integer",
                "isReadOnly": true,
                "format": "id",
                "transient": false
            }
        },
        "relations": {
            "items": {
                "type": "hasMany",
                "model": "item",
                "aggregationKind": "composite",
                "invRel": "group",
                "nameSpace": "cyclicreferencesviews",
                "title": "items",
                "localFields": [
                    "id"
                ],
                "foreignFields": [
                    "groupId"
                ]
            },
            "item": {
                "type": "belongsTo",
                "model": "item",
                "aggregationKind": "composite",
                "invRel": "groups",
                "nameSpace": "cyclicreferencesviews",
                "title": "item",
                "localFields": [
                    "itemId"
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
            "parent": "item",
            "parentRelation": "item"
        }
    };