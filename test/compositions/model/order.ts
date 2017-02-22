import {
	Instance, InstanceState, InstanceErrors, modelManager,
	HasManyComposition, HasManyAggregation,
	ErrorState, State, StringState, IdState, BooleanState, IntegerState, EnumState, NumberState, DateState, DateTimeState, RefArrayState, RefObjectState,
	IntegerValue, NumberValue
} from '../../../src/index';
import { OrderItem } from './order-item';


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
	public get totalAmount(): NumberValue {
		return this._children.totalAmount;
	}
	public get id(): any {
		return this._children.id.value;
	}
	get items(): HasManyComposition<OrderItem> {
		return this._children.items;
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
	public get totalAmount(): ErrorState {
		return this._messages.totalAmount;
	}
	public get id(): ErrorState {
		return this._messages.id;
	}
	public get items(): ErrorState {
		return this._messages.items;
	}
}

export class OrderState extends InstanceState {
	public get totalAmount(): NumberState {
		return this._states.totalAmount;
	}
	public get id(): IdState {
		return this._states.id;
	}
}
export const
	ORDER_SCHEMA = {
		"type": "object",
		"name": "order",
		"nameSpace": "compositions",
		"properties": {
			"totalAmount": {
				"type": "number",
				"default": 0
			},
			"id": {
				"type": "integer",
				"generated": true,
				"format": "id"
			}
		},
		"relations": {
			"items": {
				"type": "hasMany",
				"model": "orderItem",
				"aggregationKind": "composite",
				"invRel": "order",
				"nameSpace": "compositions",
				"title": "items",
				"invType": "belongsTo",
				"localFields": [
					"id"
				],
				"foreignFields": [
					"orderId"
				]
			}
		},
		"meta": {}
	};