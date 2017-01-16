import {
	Instance, InstanceState, InstanceErrors, ModelManager,
	HasManyComposition, HasManyAggregation,
	ErrorState, State, StringState, IdState, IntegerState, EnumState, NumberState, DateState, DateTimeState, RefArrayState, RefObjectState,
	IntegerValue, NumberValue
} from '../../../src/index';
import { Customer } from './customer';


export class Order extends Instance {
	protected init() {
		super.init();
		let that = this;
		that._schema = ORDER_SCHEMA;
	}
	protected createStates() {
		let that = this;
		that._states = new OrderState(that, that._schema);
	}
	protected createErrors() {
		let that = this;
		that._errors = new OrderErrors(that, that._schema);
	}
	public customerStatus(value?: string): Promise<string> {
		return this.getOrSetProperty('customerStatus', value);
	}
	public get id(): Promise<any> {
		return this._children.id.value();
	}
	public get customerId(): Promise<any> {
		return this._children.customerId.value();
	}
	public customer(value?: Customer): Promise<Customer> {
		return this._children.customer.value(value);
	}
	public get $states(): OrderState {
		return <OrderState>this._states;
	}
	public get $errors(): OrderErrors {
		return <OrderErrors>this._errors;
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
const
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
				"format": "id"
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
		}
	};
new ModelManager().registerClass(Order, ORDER_SCHEMA.name, ORDER_SCHEMA.nameSpace);