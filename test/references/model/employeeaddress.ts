import {
	Instance, InstanceState, InstanceErrors, ModelManager,
	HasManyComposition, HasManyAggregation,
	ErrorState, State, StringState, IntegerState, EnumState, NumberState, DateState, DateTimeState, RefArrayState, RefObjectState,
	IntegerValue, NumberValue
} from '../../../src/index';
import { Employee } from './employee';


export class EmployeeAddress extends Instance {
	protected init() {
		super.init();
		let that = this;
		that._schema = EMPLOYEEADDRESS_SCHEMA;
	}
	protected createStates() {
		let that = this;
		that._states = new EmployeeAddressState(that, that._schema);
	}
	protected createErrors() {
		let that = this;
		that._errors = new EmployeeAddressErrors(that, that._schema);
	}
	public street(value?: string): Promise<string> {
		return this.getOrSetProperty('street', value);
	}
	public city(value?: string): Promise<string> {
		return this.getOrSetProperty('city', value);
	}
	public province(value?: string): Promise<string> {
		return this.getOrSetProperty('province', value);
	}
	public postalCode(value?: string): Promise<string> {
		return this.getOrSetProperty('postalCode', value);
	}
	public country(value?: string): Promise<string> {
		return this.getOrSetProperty('country', value);
	}
	public get id(): IntegerValue {
		return this._children.id;
	}
	public get employeeId(): IntegerValue {
		return this._children.employeeId;
	}
	public employee(value?: Employee): Promise<Employee> {
		return this._children.employee.value(value);
	}
	public get $states(): EmployeeAddressState {
		return <EmployeeAddressState>this._states;
	}
	public get $errors(): EmployeeAddressErrors {
		return <EmployeeAddressErrors>this._errors;
	}
}

export class EmployeeAddressErrors extends InstanceErrors {
	public get $(): ErrorState {
		return this._messages.$;
	}
	public get street(): ErrorState {
		return this._messages.street;
	}
	public get city(): ErrorState {
		return this._messages.city;
	}
	public get province(): ErrorState {
		return this._messages.province;
	}
	public get postalCode(): ErrorState {
		return this._messages.postalCode;
	}
	public get country(): ErrorState {
		return this._messages.country;
	}
	public get id(): ErrorState {
		return this._messages.id;
	}
	public get employeeId(): ErrorState {
		return this._messages.employeeId;
	}
	public get employee(): ErrorState {
		return this._messages.employee;
	}
}

export class EmployeeAddressState extends InstanceState {
	public get street(): StringState {
		return this._states.street;
	}
	public get city(): StringState {
		return this._states.city;
	}
	public get province(): StringState {
		return this._states.province;
	}
	public get postalCode(): StringState {
		return this._states.postalCode;
	}
	public get country(): StringState {
		return this._states.country;
	}
	public get id(): IntegerState {
		return this._states.id;
	}
	public get employeeId(): IntegerState {
		return this._states.employeeId;
	}
}
const
	EMPLOYEEADDRESS_SCHEMA = {
		"type": "object",
		"name": "employeeAddress",
		"nameSpace": "references",
		"properties": {
			"street": {
				"title": "Street",
				"type": "string"
			},
			"city": {
				"title": "City",
				"type": "string"
			},
			"province": {
				"title": "Province",
				"type": "string"
			},
			"postalCode": {
				"title": "Postal Code",
				"type": "string"
			},
			"country": {
				"title": "Country",
				"type": "string"
			},
			"id": {
				"type": "integer",
				"generated": true
			},
			"employeeId": {
				"type": "integer",
				"isReadOnly": true
			}
		},
		"relations": {
			"employee": {
				"title": "Address",
				"type": "belongsTo",
				"model": "employee",
				"aggregationKind": "composite",
				"invRel": "address",
				"nameSpace": "references",
				"localFields": [
					"employeeId"
				],
				"foreignFields": [
					"id"
				]
			}
		}
	};
new ModelManager().registerClass(EmployeeAddress, EMPLOYEEADDRESS_SCHEMA.name, EMPLOYEEADDRESS_SCHEMA.nameSpace);