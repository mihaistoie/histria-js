import {
	Instance, InstanceState, InstanceErrors, modelManager,
	HasManyComposition, HasManyAggregation,
	ErrorState, State, StringState, IdState, BooleanState, IntegerState, EnumState, NumberState, DateState, DateTimeState, RefArrayState, RefObjectState,
	NumberValue
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
	public get id(): IdState {
		return this._states.id;
	}
}
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
				"format": "id"
			}
		},
		"meta": {}
	};