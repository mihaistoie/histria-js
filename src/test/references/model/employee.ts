import {
    Instance, View, InstanceState, InstanceErrors, modelManager,
    HasManyComposition, HasManyAggregation, HasManyRefObject,
    ErrorState, State, StringState, IdState, BooleanState, IntegerState,
    EnumState, NumberState, DateState, DateTimeState, RefArrayState, RefObjectState,
    NumberValue
} from '../../../index';
import { Department } from './department';
import { EmployeeAddress } from './employee-address';

export class Employee extends Instance {
    public static isPersistent: boolean = true;
    public get firstName(): string {
        return this.getPropertyByName('firstName');
    }
    public setFirstName(value: string): Promise<string> {
        return this.setPropertyByName('firstName', value);
    }
    public get lastName(): string {
        return this.getPropertyByName('lastName');
    }
    public setLastName(value: string): Promise<string> {
        return this.setPropertyByName('lastName', value);
    }
    public get salary(): NumberValue {
        return this._children.salary;
    }
    public get departmentCode(): string {
        return this.getPropertyByName('departmentCode');
    }
    public setDepartmentCode(value: string): Promise<string> {
        return this.setPropertyByName('departmentCode', value);
    }
    public get id(): any {
        return this._children.id.value;
    }
    public department(): Promise<Department> {
        return this._children.department.getValue();
    }
    public setDepartment(value: Department): Promise<Department> {
        return this._children.department.setValue(value);
    }
    public address(): Promise<EmployeeAddress> {
        return this._children.address.getValue();
    }
    public setAddress(value: EmployeeAddress): Promise<EmployeeAddress> {
        return this._children.address.setValue(value);
    }
    public get $states(): EmployeeState {
        return this._states as EmployeeState;
    }
    public get $errors(): EmployeeErrors {
        return this._errors as EmployeeErrors;
    }
    protected init() {
        super.init();
        this._schema = EMPLOYEE_SCHEMA;
    }
    protected createStates() {
        this._states = new EmployeeState(this, this._schema);
    }
    protected createErrors() {
        this._errors = new EmployeeErrors(this, this._schema);
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
/* tslint:disable:object-literal-key-quotes */
/* tslint:disable:quotemark */
export const
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
                "format": "id",
                "transient": true
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
                "invType": "belongsTo",
                "localFields": [
                    "id"
                ],
                "foreignFields": [
                    "employeeId"
                ]
            }
        },
        "meta": {},
        "primaryKey": [
            "id"
        ]
    };