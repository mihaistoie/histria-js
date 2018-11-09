import {
    Instance, View, InstanceState, InstanceErrors, modelManager,
    HasManyComposition, HasManyAggregation, HasManyRefObject,
    ErrorState, State, StringState, IdState, BooleanState, IntegerState,
    EnumState, NumberState, DateState, DateTimeState, RefArrayState, RefObjectState,
    NumberValue
} from '../../index';


export class Customer extends Instance {
    public static isPersistent: boolean = true;
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
    public get $states(): CustomerState {
        return this._states as CustomerState;
    }
    public get $errors(): CustomerErrors {
        return this._errors as CustomerErrors;
    }
    protected init() {
        super.init();
        this._schema = CUSTOMER_SCHEMA;
    }
    protected createStates() {
        this._states = new CustomerState(this, this._schema);
    }
    protected createErrors() {
        this._errors = new CustomerErrors(this, this._schema);
    }
}

export class CustomerErrors extends InstanceErrors {
    public get $(): ErrorState {
        return this._messages.$;
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
}

export class CustomerState extends InstanceState {
    public get firstName(): StringState {
        return this._states.firstName;
    }
    public get lastName(): StringState {
        return this._states.lastName;
    }
    public get id(): IdState {
        return this._states.id;
    }
}
/* tslint:disable:quotemark */
export const
    CUSTOMER_SCHEMA = {
        "name": "customer",
        "type": "object",
        "nameSpace": "customer-view-sample",
        "properties": {
            "firstName": {
                "title": "First Name",
                "type": "string"
            },
            "lastName": {
                "title": "Last Name",
                "type": "string"
            },
            "id": {
                "type": "integer",
                "generated": true,
                "format": "id",
                "transient": true
            }
        },
        "primaryKey": [
            "id"
        ],
        "meta": {},
        "viewsOfMe": {
            "customer-view-sample.customerView": {
                "nameSpace": "customer-view-sample",
                "model": "customerView",
                "relation": "customer",
                "localFields": [
                    "customerId"
                ],
                "foreignFields": [
                    "id"
                ]
            }
        }
    };