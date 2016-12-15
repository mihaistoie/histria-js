import {
	Instance, InstanceState, InstanceErrors, ModelManager,
	ErrorState, State, StringState, IntegerState, EnumState, NumberState, DateState, DateTimeState, RefArrayState, RefObjectState,
	IntegerValue, NumberValue
} from '../../../src/index';

const
	EMPLOYEE_SCHEMA = {
		"type": "object",
		"nameSpace": "employee",
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
						"generated": true
				}
		},
		"relations": {
				"department": {
						"title": "Department",
						"type": "association",
						"model": "department",
						"multiplicity": "one",
						"localFields": [
								"departmentCode"
						],
						"foreignFields": [
								"code"
						]
				},
				"address": {
						"title": "Department",
						"type": "composition",
						"model": "employeAddress",
						"multiplicity": "one",
						"localFields": [
								"id"
						],
						"foreignFields": [
								"addressId"
						],
						"invName": "employee"
				}
		}
};

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
	public get id(): IntegerState {
		return this._states.id;
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
}

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
	public get id(): IntegerValue {
		return this._children.id;
	}
	public get $states(): EmployeeState {
		return <EmployeeState>this._states;
	}
	public get $errors(): EmployeeErrors {
		return <EmployeeErrors>this._errors;
	}
}
new ModelManager().registerClass(Employee, EMPLOYEE_SCHEMA.nameSpace);