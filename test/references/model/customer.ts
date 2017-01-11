import {
	Instance, InstanceState, InstanceErrors, ModelManager,
	ErrorState, State, StringState, IntegerState, EnumState, NumberState, DateState, DateTimeState, RefArrayState, RefObjectState,
	IntegerValue, NumberValue
} from '../../../src/index';


export class Customer extends Instance {
	protected init() {
		super.init();
		let that = this;
		that._schema = CUSTOMER_SCHEMA;
	}
	protected createStates() {
		let that = this;
		that._states = new CustomerState(that, that._schema);
	}
	protected createErrors() {
		let that = this;
		that._errors = new CustomerErrors(that, that._schema);
	}
	public title(value?: string): Promise<string> {
		return this.getOrSetProperty('title', value);
	}
	public get id(): IntegerValue {
		return this._children.id;
	}
	public get $states(): CustomerState {
		return <CustomerState>this._states;
	}
	public get $errors(): CustomerErrors {
		return <CustomerErrors>this._errors;
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
	public get id(): IntegerState {
		return this._states.id;
	}
}
const
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
				"generated": true
			}
		}
	};
new ModelManager().registerClass(Customer, CUSTOMER_SCHEMA.name, CUSTOMER_SCHEMA.nameSpace);