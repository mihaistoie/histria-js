import {
    Instance, View, InstanceState, InstanceErrors, modelManager,
    HasManyComposition, HasManyAggregation,
    ErrorState, State, StringState, IdState, BooleanState, IntegerState, EnumState, NumberState, DateState, DateTimeState, RefArrayState, RefObjectState,
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
    public get age(): number {
        return this.user.age;
    }
    public setAge(value: number): Promise<number> {
        return this._children.user.setAge(value);
    }
    public get firstName(): string {
        return this.user.firstName;
    }
    public setFirstName(value: string): Promise<string> {
        return this.user.setFirstName(value);
    }
    public get lastName(): string {
        return this.user.lastName;
    }
    public setLastName(value: string): Promise<string> {
        return this.user.setLastName(value);
    }
    public get user(): User {
        return this._children.user.getSyncValue();
    }
    public set user(value: User) {
        this._children.user.setSyncValue(value);
    }
    public get $states(): UserDetailState {
        return <UserDetailState>this._states;
    }
    public get $errors(): UserDetailErrors {
        return <UserDetailErrors>this._errors;
    }
    protected init() {
        super.init();
        let that = this;
        that._schema = USERDETAIL_SCHEMA;
    }
    protected createStates() {
        let that = this;
        that._states = new UserDetailState(that, that._schema);
    }
    protected createErrors() {
        let that = this;
        that._errors = new UserDetailErrors(that, that._schema);
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
export const
    USERDETAIL_SCHEMA = {
        name: 'UserDetail',
        type: 'object',
        view: true,
        nameSpace: 'view-one',
        properties: {
            fullName: {
                title: 'FullName Name',
                type: 'string'
            },
            id: {
                type: 'integer',
                generated: true,
                format: 'id'
            },
            userId: {
                type: 'integer',
                isReadOnly: true,
                format: 'id'
            }
        },
        relations: {
            user: {
                type: 'hasOne',
                model: 'user',
                embedded: true,
                aggregationKind: 'composite',
                nameSpace: 'view-one',
                title: 'user',
                localFields: [
                    'userId'
                ],
                foreignFields: [
                    'id'
                ]
            }
        },
        states: {
            fullName: {
                isReadOnly: true
            }
        },
        meta: {}
    };