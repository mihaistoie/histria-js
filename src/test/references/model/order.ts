import {
    Instance, View, InstanceState, InstanceErrors, modelManager,
    HasManyComposition, HasManyAggregation, HasManyRefObject,
    ErrorState, State, StringState, IdState, BooleanState, IntegerState,
    EnumState, NumberState, DateState, DateTimeState, RefArrayState, RefObjectState,
    NumberValue
} from '../../../index';
import { Customer } from './customer';

export class Order extends Instance {
    public static isPersistent: boolean = true;
    public get customerStatus(): string {
        return this.getPropertyByName('customerStatus');
    }
    public setCustomerStatus(value: string): Promise<string> {
        return this.setPropertyByName('customerStatus', value);
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
    public get $states(): OrderState {
        return this._states as OrderState;
    }
    public get $errors(): OrderErrors {
        return this._errors as OrderErrors;
    }
    protected init() {
        super.init();
        this._schema = ORDER_SCHEMA;
    }
    protected createStates() {
        this._states = new OrderState(this, this._schema);
    }
    protected createErrors() {
        this._errors = new OrderErrors(this, this._schema);
    }
}

export class OrderErrors extends InstanceErrors {
    public get $(): ErrorState {
        return this._messages.$;
    }
    public get customerStatus(): ErrorState {
        return this._messages.customerStatus;
    }
    public get id(): ErrorState {
        return this._messages.id;
    }
    public get customerId(): ErrorState {
        return this._messages.customerId;
    }
    public get customer(): ErrorState {
        return this._messages.customer;
    }
}

export class OrderState extends InstanceState {
    public get customerStatus(): StringState {
        return this._states.customerStatus;
    }
    public get id(): IdState {
        return this._states.id;
    }
    public get customerId(): IdState {
        return this._states.customerId;
    }
}
/* tslint:disable:object-literal-key-quotes */
/* tslint:disable:quotemark */
export const
    ORDER_SCHEMA = {
        "type": "object",
        "nameSpace": "references",
        "name": "order",
        "properties": {
            "customerStatus": {
                "type": "string"
            },
            "id": {
                "type": "integer",
                "generated": true,
                "format": "id",
                "transient": true
            },
            "customerId": {
                "type": "integer",
                "isReadOnly": true,
                "format": "id"
            }
        },
        "relations": {
            "customer": {
                "type": "hasOne",
                "model": "customer",
                "nameSpace": "references",
                "title": "customer",
                "aggregationKind": "none",
                "localFields": [
                    "customerId"
                ],
                "foreignFields": [
                    "id"
                ]
            }
        },
        "meta": {},
        "primaryKey": [
            "id"
        ]
    };