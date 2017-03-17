import {
	Instance, View, InstanceState, InstanceErrors, modelManager,
	HasManyComposition, HasManyAggregation,
	ErrorState, State, StringState, IdState, BooleanState, IntegerState, EnumState, NumberState, DateState, DateTimeState, RefArrayState, RefObjectState,
	NumberValue
} from '../../../index';
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
	public get engineChangedHits(): number {
		return this._children.engineChangedHits.value;
	}
	public setEngineChangedHits(value: number): Promise<number> {
		return this._children.engineChangedHits.setValue(value);
	}
	public get engineName(): string {
		return this.getPropertyByName('engineName');
	}
	public setEngineName(value: string): Promise<string> {
		return this.setPropertyByName('engineName', value);
	}
	public get id(): any {
		return this._children.id.value;
	}
	public engine(): Promise<Engine> {
		return this._children.engine.getValue();
	}
	public setEngine(value: Engine): Promise<Engine> {
		return this._children.engine.setValue(value);
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
	public get engineChangedHits(): ErrorState {
		return this._messages.engineChangedHits;
	}
	public get engineName(): ErrorState {
		return this._messages.engineName;
	}
	public get id(): ErrorState {
		return this._messages.id;
	}
	public get engine(): ErrorState {
		return this._messages.engine;
	}
}

export class CarState extends InstanceState {
	public get engineChangedHits(): IntegerState {
		return this._states.engineChangedHits;
	}
	public get engineName(): StringState {
		return this._states.engineName;
	}
	public get id(): IdState {
		return this._states.id;
	}
}
export const
	CAR_SCHEMA = {
		"type": "object",
		"name": "car",
		"nameSpace": "compositions",
		"properties": {
			"engineChangedHits": {
				"type": "integer",
				"default": 0
			},
			"engineName": {
				"type": "string"
			},
			"id": {
				"type": "integer",
				"generated": true,
				"format": "id"
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
				"invType": "belongsTo",
				"localFields": [
					"id"
				],
				"foreignFields": [
					"carId"
				]
			}
		},
		"meta": {}
	};