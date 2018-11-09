import {
    Instance, View, InstanceState, InstanceErrors, modelManager,
    HasManyComposition, HasManyAggregation, HasManyRefObject,
    ErrorState, State, StringState, IdState, BooleanState, IntegerState,
    EnumState, NumberState, DateState, DateTimeState, RefArrayState, RefObjectState,
    NumberValue
} from '../../../index';


export class SalesOrder extends Instance {
    public static isPersistent: boolean = true;
    public get ruleCount(): number {
        return this._children.ruleCount.value;
    }
    public setRuleCount(value: number): Promise<number> {
        return this._children.ruleCount.setValue(value);
    }
    public get netAmount(): NumberValue {
        return this._children.netAmount;
    }
    public get vat(): NumberValue {
        return this._children.vat;
    }
    public get grossAmount(): NumberValue {
        return this._children.grossAmount;
    }
    public get id(): any {
        return this._children.id.value;
    }
    public get $states(): SalesOrderState {
        return this._states as SalesOrderState;
    }
    public get $errors(): SalesOrderErrors {
        return this._errors as SalesOrderErrors;
    }
    protected init() {
        super.init();
        this._schema = SALESORDER_SCHEMA;
    }
    protected createStates() {
        this._states = new SalesOrderState(this, this._schema);
    }
    protected createErrors() {
        this._errors = new SalesOrderErrors(this, this._schema);
    }
}

export class SalesOrderErrors extends InstanceErrors {
    public get $(): ErrorState {
        return this._messages.$;
    }
    public get ruleCount(): ErrorState {
        return this._messages.ruleCount;
    }
    public get netAmount(): ErrorState {
        return this._messages.netAmount;
    }
    public get vat(): ErrorState {
        return this._messages.vat;
    }
    public get grossAmount(): ErrorState {
        return this._messages.grossAmount;
    }
    public get id(): ErrorState {
        return this._messages.id;
    }
}

export class SalesOrderState extends InstanceState {
    public get ruleCount(): IntegerState {
        return this._states.ruleCount;
    }
    public get netAmount(): NumberState {
        return this._states.netAmount;
    }
    public get vat(): NumberState {
        return this._states.vat;
    }
    public get grossAmount(): NumberState {
        return this._states.grossAmount;
    }
    public get id(): IdState {
        return this._states.id;
    }
}
/* tslint:disable:quotemark */
export const
    SALESORDER_SCHEMA = {
        "name": "salesOrder",
        "type": "object",
        "nameSpace": "salesorder",
        "properties": {
            "ruleCount": {
                "title": "Rule call count",
                "type": "integer"
            },
            "netAmount": {
                "title": "Net Amount (excluding VAT)",
                "type": "number"
            },
            "vat": {
                "title": "VAT",
                "type": "number"
            },
            "grossAmount": {
                "title": "Gross Amount (including VAT)",
                "type": "number"
            },
            "id": {
                "type": "integer",
                "generated": true,
                "format": "id",
                "transient": true
            }
        },
        "states": {
            "netAmount": {
                "decimals": 2
            },
            "vat": {
                "decimals": 2
            },
            "grossAmount": {
                "decimals": 2
            }
        },
        "primaryKey": [
            "id"
        ],
        "meta": {}
    };