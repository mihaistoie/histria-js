import {
    Instance, View, InstanceState, InstanceErrors, modelManager,
    HasManyComposition, HasManyAggregation, HasManyRefObject,
    ErrorState, State, StringState, IdState, BooleanState, IntegerState,
    EnumState, NumberState, DateState, DateTimeState, RefArrayState, RefObjectState,
    NumberValue
} from '../../index';


export class Tree extends View {
    public static isPersistent: boolean = false;
    public get title(): string {
        return this.getPropertyByName('title');
    }
    public setTitle(value: string): Promise<string> {
        return this.setPropertyByName('title', value);
    }
    public get id(): any {
        return this._children.id.value;
    }
    public get parentId(): any {
        return this._children.parentId.value;
    }
    get leafs(): HasManyComposition<Tree> {
        return this._children.leafs;
    }
    public parent(): Promise<Tree> {
        return this._children.parent.getValue();
    }
    public setParent(value: Tree): Promise<Tree> {
        return this._children.parent.setValue(value);
    }
    public get $states(): TreeState {
        return <TreeState>this._states;
    }
    public get $errors(): TreeErrors {
        return <TreeErrors>this._errors;
    }
    protected init() {
        super.init();
        let that = this;
        that._schema = TREE_SCHEMA;
    }
    protected createStates() {
        let that = this;
        that._states = new TreeState(that, that._schema);
    }
    protected createErrors() {
        let that = this;
        that._errors = new TreeErrors(that, that._schema);
    }
}

export class TreeErrors extends InstanceErrors {
    public get $(): ErrorState {
        return this._messages.$;
    }
    public get title(): ErrorState {
        return this._messages.title;
    }
    public get id(): ErrorState {
        return this._messages.id;
    }
    public get parentId(): ErrorState {
        return this._messages.parentId;
    }
    public get leafs(): ErrorState {
        return this._messages.leafs;
    }
}

export class TreeState extends InstanceState {
    public get title(): StringState {
        return this._states.title;
    }
    public get id(): IdState {
        return this._states.id;
    }
    public get parentId(): IdState {
        return this._states.parentId;
    }
}
export const
    TREE_SCHEMA = {
        type: 'object',
        name: 'tree',
        view: true,
        nameSpace: 'view-many-view',
        properties: {
            title: {
                type: 'string'
            },
            id: {
                type: 'integer',
                generated: true,
                format: 'id'
            },
            parentId: {
                type: 'integer',
                isReadOnly: true,
                format: 'id'
            }
        },
        relations: {
            leafs: {
                type: 'hasMany',
                model: 'tree',
                aggregationKind: 'composite',
                invRel: 'parent',
                nameSpace: 'view-many-view',
                title: 'leafs',
                localFields: [
                    'id'
                ],
                foreignFields: [
                    'parentId'
                ]
            },
            parent: {
                type: 'belongsTo',
                model: 'tree',
                aggregationKind: 'composite',
                invRel: 'leafs',
                nameSpace: 'view-many-view',
                title: 'parent',
                localFields: [
                    'parentId'
                ],
                foreignFields: [
                    'id'
                ]
            }
        },
        meta: {
            parent: 'tree',
            parentRelation: 'parent'
        }
    };