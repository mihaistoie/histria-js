import {
	Instance, InstanceState, InstanceErrors, modelManager,
	HasManyComposition, HasManyAggregation,
	ErrorState, State, StringState, IdState, BooleanState, IntegerState, EnumState, NumberState, DateState, DateTimeState, RefArrayState, RefObjectState,
	IntegerValue, NumberValue
} from '../../../src/index';
import { Car } from './car';


export class Driver extends Instance {
	protected init() {
		super.init();
		let that = this;
		that._schema = DRIVER_SCHEMA;
	}
	protected createStates() {
		let that = this;
		that._states = new DriverState(that, that._schema);
	}
	protected createErrors() {
		let that = this;
		that._errors = new DriverErrors(that, that._schema);
	}
	public get carChangedHits(): IntegerValue {
		return this._children.carChangedHits;
	}
	public get name(): string {
		return this.getPropertyByName('name');
	}
	public setName(value: string): Promise<string> {
		return this.setPropertyByName('name', value);
	}
	public get id(): any {
		return this._children.id.value;
	}
	public get drivesId(): any {
		return this._children.drivesId.value;
	}
	public drives(): Promise<Car> {
		return this._children.drives.getValue();
	}
	public setDrives(value: Car): Promise<Car> {
		return this._children.drives.setValue(value);
	}
	public get $states(): DriverState {
		return <DriverState>this._states;
	}
	public get $errors(): DriverErrors {
		return <DriverErrors>this._errors;
	}
}

export class DriverErrors extends InstanceErrors {
	public get $(): ErrorState {
		return this._messages.$;
	}
	public get carChangedHits(): ErrorState {
		return this._messages.carChangedHits;
	}
	public get name(): ErrorState {
		return this._messages.name;
	}
	public get id(): ErrorState {
		return this._messages.id;
	}
	public get drivesId(): ErrorState {
		return this._messages.drivesId;
	}
	public get drives(): ErrorState {
		return this._messages.drives;
	}
}

export class DriverState extends InstanceState {
	public get carChangedHits(): IntegerState {
		return this._states.carChangedHits;
	}
	public get name(): StringState {
		return this._states.name;
	}
	public get id(): IdState {
		return this._states.id;
	}
	public get drivesId(): IdState {
		return this._states.drivesId;
	}
}
export const
	DRIVER_SCHEMA = {
		"type": "object",
		"name": "driver",
		"properties": {
			"carChangedHits": {
				"type": "integer",
				"default": 0
			},
			"name": {
				"type": "string"
			},
			"id": {
				"type": "integer",
				"generated": true,
				"format": "id"
			},
			"drivesId": {
				"type": "integer",
				"isReadOnly": true,
				"format": "id"
			}
		},
		"nameSpace": "aggregations",
		"relations": {
			"drives": {
				"type": "belongsTo",
				"model": "car",
				"aggregationKind": "shared",
				"invRel": "drivenBy",
				"nameSpace": "aggregations",
				"title": "drives",
				"invType": "hasOne",
				"localFields": [
					"drivesId"
				],
				"foreignFields": [
					"id"
				]
			}
		},
		"meta": {}
	};