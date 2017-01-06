import {
	Instance, InstanceState, InstanceErrors, ModelManager,
	ErrorState, State, StringState, IntegerState, EnumState, NumberState, DateState, DateTimeState, RefArrayState, RefObjectState,
	IntegerValue, NumberValue
} from '../../src/index';


export class SalesOrder extends Instance {
	protected init() {
		super.init();
		let that = this;
		that._schema = SALESORDER_SCHEMA;
	}
	protected createStates() {
		let that = this;
		that._states = new SalesOrderState(that, that._schema);
	}
	protected createErrors() {
		let that = this;
		that._errors = new SalesOrderErrors(that, that._schema);
	}
	public get ruleCount(): IntegerValue {
		return this._children.ruleCount;
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
	public get id(): IntegerValue {
		return this._children.id;
	}
	public get $states(): SalesOrderState {
		return <SalesOrderState>this._states;
	}
	public get $errors(): SalesOrderErrors {
		return <SalesOrderErrors>this._errors;
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
	public get id(): IntegerState {
		return this._states.id;
	}
}
const
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
				"generated": true
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
		}
	};
new ModelManager().registerClass(SalesOrder, SALESORDER_SCHEMA.name, SALESORDER_SCHEMA.nameSpace);