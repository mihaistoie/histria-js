import {
    Instance, View, InstanceState, InstanceErrors, modelManager,
    HasManyComposition, HasManyAggregation, HasManyRefObject,
    ErrorState, State, StringState, IdState, BooleanState, IntegerState,
    EnumState, NumberState, DateState, DateTimeState, RefArrayState, RefObjectState,
    NumberValue
} from '../../index';
import { Customer } from './customer';


export class CustomerView extends View {
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
    public get customerId(): any {
        return this._children.customerId.value;
    }
    public customer(): Promise<Customer> {
        return this._children.customer.getValue();
    }
    public setCustomer(value: Customer): Promise<Customer> {
        return this._children.customer.setValue(value);
    }
    public get $states(): CustomerViewState {
        return <CustomerViewState>this._states;
    }
    public get $errors(): CustomerViewErrors {
        return <CustomerViewErrors>this._errors;
    }
    protected init() {
        super.init();
        let that = this;
        that._schema = CUSTOMERVIEW_SCHEMA;
    }
    protected createStates() {
        let that = this;
        that._states = new CustomerViewState(that, that._schema);
    }
    protected createErrors() {
        let that = this;
        that._errors = new CustomerViewErrors(that, that._schema);
    }
}

export class CustomerViewErrors extends InstanceErrors {
    public get $(): ErrorState {
        return this._messages.$;
    }
    public get fullName(): ErrorState {
        return this._messages.fullName;
    }
    public get id(): ErrorState {
        return this._messages.id;
    }
    public get customerId(): ErrorState {
        return this._messages.customerId;
    }
}

export class CustomerViewState extends InstanceState {
    public get fullName(): StringState {
        return this._states.fullName;
    }
    public get id(): IdState {
        return this._states.id;
    }
    public get customerId(): IdState {
        return this._states.customerId;
    }
}
export const
    CUSTOMERVIEW_SCHEMA = {
        name: 'customerView',
        type: 'object',
        view: true,
        nameSpace: 'customer-view-sample',
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
            customerId: {
                type: 'integer',
                isReadOnly: true,
                format: 'id'
            }
        },
        relations: {
            customer: {
                type: 'hasOne',
                model: 'customer',
                aggregationKind: 'composite',
                nameSpace: 'customer-view-sample',
                title: 'customer',
                localFields: [
                    'customerId'
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