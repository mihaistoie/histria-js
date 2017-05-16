import {
    Instance, View, InstanceState, InstanceErrors, modelManager,
    HasManyComposition, HasManyAggregation, HasManyRefObject,
    ErrorState, State, StringState, IdState, BooleanState, IntegerState,
    EnumState, NumberState, DateState, DateTimeState, RefArrayState, RefObjectState,
    NumberValue
} from '../../index';
import { User } from './user';
import { AdressView } from './adress-view';


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
    public get addressId(): any {
        return this._children.addressId.value;
    }
    public user(): Promise<User> {
        return this._children.user.getValue();
    }
    public setUser(value: User): Promise<User> {
        return this._children.user.setValue(value);
    }
    public address(): Promise<AdressView> {
        return this._children.address.getValue();
    }
    public setAddress(value: AdressView): Promise<AdressView> {
        return this._children.address.setValue(value);
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
    public get addressId(): ErrorState {
        return this._messages.addressId;
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
    public get addressId(): IdState {
        return this._states.addressId;
    }
}
export const
    USERDETAIL_SCHEMA = {
        name: 'UserDetail',
        type: 'object',
        view: true,
        nameSpace: 'view-has-one-view',
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
            },
            addressId: {
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
                nameSpace: 'view-has-one-view',
                title: 'user',
                localFields: [
                    'userId'
                ],
                foreignFields: [
                    'id'
                ]
            },
            address: {
                type: 'hasOne',
                model: 'AdressView',
                aggregationKind: 'composite',
                invRel: 'user',
                nameSpace: 'view-has-one-view',
                title: 'address',
                localFields: [
                    'addressId'
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