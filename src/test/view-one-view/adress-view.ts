import {
    Instance, View, InstanceState, InstanceErrors, modelManager,
    HasManyComposition, HasManyAggregation, HasManyRefObject,
    ErrorState, State, StringState, IdState, BooleanState, IntegerState,
    EnumState, NumberState, DateState, DateTimeState, RefArrayState, RefObjectState,
    NumberValue
} from '../../index';
import { UserDetail } from './user-detail';


export class AdressView extends View {
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
    public get $states(): AdressViewState {
        return <AdressViewState>this._states;
    }
    public get $errors(): AdressViewErrors {
        return <AdressViewErrors>this._errors;
    }
    protected init() {
        super.init();
        let that = this;
        that._schema = ADRESSVIEW_SCHEMA;
    }
    protected createStates() {
        let that = this;
        that._states = new AdressViewState(that, that._schema);
    }
    protected createErrors() {
        let that = this;
        that._errors = new AdressViewErrors(that, that._schema);
    }
}

export class AdressViewErrors extends InstanceErrors {
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

export class AdressViewState extends InstanceState {
    public get street(): StringState {
        return this._states.street;
    }
    public get id(): IdState {
        return this._states.id;
    }
}
export const
    ADRESSVIEW_SCHEMA = {
        name: 'AdressView',
        type: 'object',
        view: true,
        nameSpace: 'view-has-one-view',
        properties: {
            street: {
                title: 'Street',
                type: 'string'
            },
            id: {
                type: 'integer',
                generated: true,
                format: 'id'
            }
        },
        relations: {
            user: {
                type: 'belongsTo',
                model: 'UserDetail',
                invRel: 'address',
                nameSpace: 'view-has-one-view',
                title: 'user',
                aggregationKind: 'composite',
                localFields: [
                    'id'
                ],
                foreignFields: [
                    'addressId'
                ]
            }
        },
        meta: {
            parent: 'UserDetail'
        }
    };