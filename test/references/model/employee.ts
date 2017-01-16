import {
	Instance, InstanceState, InstanceErrors, ModelManager,
	HasManyComposition, HasManyAggregation,
	ErrorState, State, StringState, IdState, IntegerState, EnumState, NumberState, DateState, DateTimeState, RefArrayState, RefObjectState,
	IntegerValue, NumberValue
} from '../../../src/index';
import { Department } from './department';
import { EmployeeAddress } from './employeeaddress';


export class Employee extends Instance {
	protected init() {
		super.init();
		let that = this;
		that._schema = EMPLOYEE_SCHEMA;
	}
	protected createStates() {
		let that = this;
		that._states = new EmployeeState(that, that._schema);
	}
	protected createErrors() {
		let that = this;
		that._errors = new EmployeeErrors(that, that._schema);
	}
	public firstName(value?: string): Promise<string> {
		return this.getOrSetProperty('firstName', value);
	}
	public lastName(value?: string): Promise<string> {
		return this.getOrSetProperty('lastName', value);
	}
	public get salary(): NumberValue {
		return this._children.salary;
	}
	public departmentCode(value?: string): Promise<string> {
		return this.getOrSetProperty('departmentCode', value);
	}
	public get id(): Promise<any> {
		return this._children.id.value();
	}
	public department(value?: Department): Promise<Department> {
		return this._children.department.value(value);
	}
	public address(value?: EmployeeAddress): Promise<EmployeeAddress> {
		return this._children.address.value(value);
	}
	public get $states(): EmployeeState {
		return <EmployeeState>this._states;
	}
	public get $errors(): EmployeeErrors {
		return <EmployeeErrors>this._errors;
	}
}

export class EmployeeErrors extends InstanceErrors {
	public get $(): ErrorState {
		return this._messages.$;
	}
	public get firstName(): ErrorState {
		return this._messages.firstName;
	}
	public get lastName(): ErrorState {
		return this._messages.lastName;
	}
	public get salary(): ErrorState {
		return this._messages.salary;
	}
	public get departmentCode(): ErrorState {
		return this._messages.departmentCode;
	}
	public get id(): ErrorState {
		return this._messages.id;
	}
	public get department(): ErrorState {
		return this._messages.department;
	}
	public get address(): ErrorState {
		return this._messages.address;
	}
}

export class EmployeeState extends InstanceState {
	public get firstName(): StringState {
		return this._states.firstName;
	}
	public get lastName(): StringState {
		return this._states.lastName;
	}
	public get salary(): NumberState {
		return this._states.salary;
	}
	public get departmentCode(): StringState {
		return this._states.departmentCode;
	}
	public get id(): IdState {
		return this._states.id;
	}
}
const
	EMPLOYEE_SCHEMA = {
		"type": "object",
		"nameSpace": "references",
		"name": "employee",
		"properties": {
			"firstName": {
				"title": "FirstName",
				"type": "string"
			},
			"lastName": {
				"title": "LastName",
				"type": "string"
			},
			"salary": {
				"title": "Salary",
				"type": "number"
			},
			"departmentCode": {
				"title": "Department Code",
				"type": "string"
			},
			"id": {
				"type": "integer",
				"generated": true,
				"format": "id"
			}
		},
		"relations": {
			"department": {
				"title": "Department",
				"type": "hasOne",
				"model": "department",
				"localFields": [
					"departmentCode"
				],
				"foreignFields": [
					"code"
				],
				"nameSpace": "references",
				"aggregationKind": "none"
			},
			"address": {
				"title": "Address",
				"type": "hasOne",
				"model": "employeeAddress",
				"aggregationKind": "composite",
				"invRel": "employee",
				"nameSpace": "references",
				"localFields": [
					"id"
				],
				"foreignFields": [
					"employeeId"
				]
			}
		}
	};
new ModelManager().registerClass(Employee, EMPLOYEE_SCHEMA.name, EMPLOYEE_SCHEMA.nameSpace);