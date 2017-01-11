import {
	Instance, InstanceState, InstanceErrors, ModelManager,
	ErrorState, State, StringState, IntegerState, EnumState, NumberState, DateState, DateTimeState, RefArrayState, RefObjectState,
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
	public get id(): IntegerValue {
		return this._children.id;
	}
	public get carId(): IntegerValue {
		return this._children.carId;
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
	public get id(): IntegerState {
		return this._states.id;
	}
	public get carId(): IntegerState {
		return this._states.carId;
	}
}
const
	ENGINE_SCHEMA = {
		"type": "object",
		"name": "engine",
		"nameSpace": "compositions",
		"properties": {
			"id": {
				"type": "integer",
				"generated": true
			},
			"carId": {
				"type": "integer",
				"isReadOnly": true
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