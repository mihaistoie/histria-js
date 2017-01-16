import {
	Instance, InstanceState, InstanceErrors, ModelManager,
	HasManyComposition, HasManyAggregation,
	ErrorState, State, StringState, IdState, IntegerState, EnumState, NumberState, DateState, DateTimeState, RefArrayState, RefObjectState,
	IntegerValue, NumberValue
} from '../../../src/index';
import { Car } from './car';


export class Engine extends Instance {
	protected init() {
		super.init();
		let that = this;
		that._schema = ENGINE_SCHEMA;
	}
	protected createStates() {
		let that = this;
		that._states = new EngineState(that, that._schema);
	}
	protected createErrors() {
		let that = this;
		that._errors = new EngineErrors(that, that._schema);
	}
	public get carChangedHits(): IntegerValue {
		return this._children.carChangedHits;
	}
	public get id(): Promise<any> {
		return this._children.id.value();
	}
	public get carId(): Promise<any> {
		return this._children.carId.value();
	}
	public car(value?: Car): Promise<Car> {
		return this._children.car.value(value);
	}
	public get $states(): EngineState {
		return <EngineState>this._states;
	}
	public get $errors(): EngineErrors {
		return <EngineErrors>this._errors;
	}
}

export class EngineErrors extends InstanceErrors {
	public get $(): ErrorState {
		return this._messages.$;
	}
	public get carChangedHits(): ErrorState {
		return this._messages.carChangedHits;
	}
	public get id(): ErrorState {
		return this._messages.id;
	}
	public get carId(): ErrorState {
		return this._messages.carId;
	}
	public get car(): ErrorState {
		return this._messages.car;
	}
}

export class EngineState extends InstanceState {
	public get carChangedHits(): IntegerState {
		return this._states.carChangedHits;
	}
	public get id(): IdState {
		return this._states.id;
	}
	public get carId(): IdState {
		return this._states.carId;
	}
}
const
	ENGINE_SCHEMA = {
		"type": "object",
		"name": "engine",
		"nameSpace": "compositions",
		"properties": {
			"carChangedHits": {
				"type": "integer",
				"default": 0
			},
			"id": {
				"type": "integer",
				"generated": true,
				"format": "id"
			},
			"carId": {
				"type": "integer",
				"isReadOnly": true,
				"format": "id"
			}
		},
		"relations": {
			"car": {
				"type": "belongsTo",
				"model": "car",
				"aggregationKind": "composite",
				"invRel": "engine",
				"nameSpace": "compositions",
				"title": "car",
				"localFields": [
					"carId"
				],
				"foreignFields": [
					"id"
				]
			}
		}
	};
new ModelManager().registerClass(Engine, ENGINE_SCHEMA.name, ENGINE_SCHEMA.nameSpace);