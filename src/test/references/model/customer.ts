import {
    Instance, View, InstanceState, InstanceErrors, modelManager,
    HasManyComposition, HasManyAggregation, HasManyRefObject,
    ErrorState, State, StringState, IdState, BooleanState, IntegerState,
    EnumState, NumberState, DateState, DateTimeState, RefArrayState, RefObjectState,
    NumberValue
} from '../../../index';

export class Customer extends Instance {
    public static isPersistent: boolean = true;
    public get title(): string {
        return this.getPropertyByName('title');
    }
    public setTitle(value: string): Promise<string> {
        return this.setPropertyByName('title', value);
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
    public get title(): ErrorState {
        return this._messages.title;
    }
    public get id(): ErrorState {
        return this._messages.id;
    }
}

export class CustomerState extends InstanceState {
    public get title(): StringState {
        return this._states.title;
    }
    public get id(): IdState {
        return this._states.id;
    }
}
/* tslint:disable:object-literal-key-quotes */
/* tslint:disable:quotemark */
export const
    CUSTOMER_SCHEMA = {
        "type": "object",
        "nameSpace": "references",
        "name": "customer",
        "properties": {
            "title": {
                "title": "title",
                "type": "string"
            },
            "id": {
                "type": "integer",
                "generated": true,
                "format": "id",
                "transient": true
            }
        },
        "meta": {},
        "primaryKey": [
            "id"
        ]
    };