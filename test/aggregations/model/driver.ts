import {
	Instance, InstanceState, InstanceErrors, ModelManager,
	ErrorState, State, StringState, IntegerState, EnumState, NumberState, DateState, DateTimeState, RefArrayState, RefObjectState,
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
	public get id(): IntegerValue {
		return this._children.id;
	}
	public get drivesId(): IntegerValue {
		return this._children.drivesId;
	}
	public drives(): Promise<Car> {
		return this._children.drives.value();
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
	public get id(): IntegerState {
		return this._states.id;
	}
	public get drivesId(): IntegerState {
		return this._states.drivesId;
	}
}
const
	DRIVER_SCHEMA = {
		"type": "object",
		"name": "driver",
		"properties": {
			"id": {
				"type": "integer",
				"generated": true
			},
			"drivesId": {
				"type": "integer",
				"isReadOnly": true
			}
		},
		"relations": {
			"drives": {
				"type": "belongsTo",
				"model": "car",
				"aggregationKind": "shared",
				"invRel": "drivenBy",
				"title": "drives",
				"localFields": [
					"drivesId"
				],
				"foreignFields": [
					"id"
				]
			}
		},
		"nameSpace": "Driver"
	};
new ModelManager().registerClass(Driver, DRIVER_SCHEMA.name, DRIVER_SCHEMA.nameSpace);