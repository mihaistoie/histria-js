import {
	Instance, InstanceState, InstanceErrors, ModelManager,
	ErrorState, State, StringState, IntegerState, EnumState, NumberState, DateState, DateTimeState, RefArrayState, RefObjectState,
	IntegerValue, NumberValue
} from '../../../src/index';
import { OrderItem } from './orderitem';


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
	public get id(): IntegerValue {
		return this._children.id;
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
	public get id(): ErrorState {
		return this._messages.id;
	}
	public get items(): ErrorState {
		return this._messages.items;
	}
}

export class OrderState extends InstanceState {
	public get id(): IntegerState {
		return this._states.id;
	}
}
const
	ORDER_SCHEMA = {
		"type": "object",
		"name": "order",
		"properties": {
			"id": {
				"type": "integer",
				"generated": true
			}
		},
		"relations": {
			"items": {
				"type": "hasMany",
				"model": "orderItem",
				"aggregationKind": "composite",
				"invRel": "order",
				"title": "items",
				"localFields": [
					"id"
				],
				"foreignFields": [
					"orderId"
				]
			}
		},
		"nameSpace": "Order"
	};
new ModelManager().registerClass(Order, ORDER_SCHEMA.name, ORDER_SCHEMA.nameSpace);