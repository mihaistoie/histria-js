import {
    Instance, View, InstanceState, InstanceErrors, modelManager,
    HasManyComposition, HasManyAggregation, HasManyRefObject,
    ErrorState, State, StringState, IdState, BooleanState, IntegerState,
    EnumState, NumberState, DateState, DateTimeState, RefArrayState, RefObjectState,
    NumberValue
} from '../../index';
import { UserList } from './user-list';


export class User extends View {
    public static isPersistent: boolean = false;
    public get age(): number {
        return this._children.age.value;
    }
    public setAge(value: number): Promise<number> {
        return this._children.age.setValue(value);
    }
    public get firstName(): string {
        return this.getPropertyByName('firstName');
    }
    public setFirstName(value: string): Promise<string> {
        return this.setPropertyByName('firstName', value);
    }
    public get lastName(): string {
        return this.getPropertyByName('lastName');
    }
    public setLastName(value: string): Promise<string> {
        return this.setPropertyByName('lastName', value);
    }
    public get id(): any {
        return this._children.id.value;
    }
    public get listId(): any {
        return this._children.listId.value;
    }
    public list(): Promise<UserList> {
        return this._children.list.getValue();
    }
    public setList(value: UserList): Promise<UserList> {
        return this._children.list.setValue(value);
    }
    public get $states(): UserState {
        return <UserState>this._states;
    }
    public get $errors(): UserErrors {
        return <UserErrors>this._errors;
    }
    protected init() {
        super.init();
        let that = this;
        that._schema = USER_SCHEMA;
    }
    protected createStates() {
        let that = this;
        that._states = new UserState(that, that._schema);
    }
    protected createErrors() {
        let that = this;
        that._errors = new UserErrors(that, that._schema);
    }
}

export class UserErrors extends InstanceErrors {
    public get $(): ErrorState {
        return this._messages.$;
    }
    public get age(): ErrorState {
        return this._messages.age;
    }
    public get firstName(): ErrorState {
        return this._messages.firstName;
    }
    public get lastName(): ErrorState {
        return this._messages.lastName;
    }
    public get id(): ErrorState {
        return this._messages.id;
    }
    public get listId(): ErrorState {
        return this._messages.listId;
    }
}

export class UserState extends InstanceState {
    public get age(): IntegerState {
        return this._states.age;
    }
    public get firstName(): StringState {
        return this._states.firstName;
    }
    public get lastName(): StringState {
        return this._states.lastName;
    }
    public get id(): IdState {
        return this._states.id;
    }
    public get listId(): IdState {
        return this._states.listId;
    }
}
export const
    USER_SCHEMA = {
        name: 'user',
        view: true,
        type: 'object',
        nameSpace: 'view-many-view',
        properties: {
            age: {
                title: 'Age',
                type: 'integer'
            },
            firstName: {
                title: 'First Name',
                type: 'string'
            },
            lastName: {
                title: 'Last Name',
                type: 'string'
            },
            id: {
                type: 'integer',
                generated: true,
                format: 'id'
            },
            listId: {
                type: 'integer',
                isReadOnly: true,
                format: 'id'
            }
        },
        relations: {
            list: {
                type: 'belongsTo',
                model: 'UserList',
                aggregationKind: 'composite',
                invRel: 'users',
                nameSpace: 'view-many-view',
                title: 'list',
                localFields: [
                    'listId'
                ],
                foreignFields: [
                    'id'
                ]
            }
        },
        meta: {
            parent: 'UserList',
            parentRelation: 'list'
        }
    };