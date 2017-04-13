import {
    Instance, View, InstanceState, InstanceErrors, modelManager,
    HasManyComposition, HasManyAggregation,
    ErrorState, State, StringState, IdState, BooleanState, IntegerState, EnumState, NumberState, DateState, DateTimeState, RefArrayState, RefObjectState,
    NumberValue
} from '../../../index';
import { Item } from './item';


export class Group extends Instance {
    public static isPersistent: boolean = true;
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
        return <GroupState>this._states;
    }
    public get $errors(): GroupErrors {
        return <GroupErrors>this._errors;
    }
    protected init() {
        super.init();
        let that = this;
        that._schema = GROUP_SCHEMA;
    }
    protected createStates() {
        let that = this;
        that._states = new GroupState(that, that._schema);
    }
    protected createErrors() {
        let that = this;
        that._errors = new GroupErrors(that, that._schema);
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
export const
    GROUP_SCHEMA = {
        type: 'object',
        name: 'group',
        nameSpace: 'cyclicreferences',
        properties: {
            id: {
                type: 'integer',
                generated: true,
                format: 'id'
            },
            itemId: {
                type: 'integer',
                isReadOnly: true,
                format: 'id'
            }
        },
        relations: {
            items: {
                type: 'hasMany',
                model: 'item',
                aggregationKind: 'composite',
                invRel: 'group',
                nameSpace: 'cyclicreferences',
                title: 'items',
                invType: 'belongsTo',
                localFields: [
                    'id'
                ],
                foreignFields: [
                    'groupId'
                ]
            },
            item: {
                type: 'belongsTo',
                model: 'item',
                aggregationKind: 'composite',
                invRel: 'groups',
                nameSpace: 'cyclicreferences',
                title: 'item',
                invType: 'hasMany',
                localFields: [
                    'itemId'
                ],
                foreignFields: [
                    'id'
                ]
            }
        },
        meta: {
            parent: 'item'
        }
    };