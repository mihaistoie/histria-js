import {
	Instance, InstanceState, InstanceErrors, ModelManager,
	HasManyComposition,
	ErrorState, State, StringState, IntegerState, EnumState, NumberState, DateState, DateTimeState, RefArrayState, RefObjectState,
	IntegerValue, NumberValue
} from '../../../src/index';
import { Engine } from './engine';


export class Car extends Instance {
	protected init() {
		super.init();
		let that = this;
		that._schema = CAR_SCHEMA;
	}
	protected createStates() {
		let that = this;
		that._states = new CarState(that, that._schema);
	}
	protected createErrors() {
		let that = this;
		that._errors = new CarErrors(that, that._schema);
	}
	public get id(): IntegerValue {
		return this._children.id;
	}
	public engine(value?: Engine): Promise<Engine> {
		return this._children.engine.value(value);
	}
	public get $states(): CarState {
		return <CarState>this._states;
	}
	public get $errors(): CarErrors {
		return <CarErrors>this._errors;
	}
}

export class CarErrors extends InstanceErrors {
	public get $(): ErrorState {
		return this._messages.$;
	}
	public get id(): ErrorState {
		return this._messages.id;
	}
	public get engine(): ErrorState {
		return this._messages.engine;
	}
}

export class CarState extends InstanceState {
	public get id(): IntegerState {
		return this._states.id;
	}
}
const
	CAR_SCHEMA = {
		"type": "object",
		"name": "car",
		"nameSpace": "compositions",
		"properties": {
			"id": {
				"type": "integer",
				"generated": true
			}
		},
		"relations": {
			"engine": {
				"type": "hasOne",
				"model": "engine",
				"aggregationKind": "composite",
				"invRel": "car",
				"nameSpace": "compositions",
				"title": "engine",
				"localFields": [
					"id"
				],
				"foreignFields": [
					"carId"
				]
			}
		}
	};
new ModelManager().registerClass(Car, CAR_SCHEMA.name, CAR_SCHEMA.nameSpace);