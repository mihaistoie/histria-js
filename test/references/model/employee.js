"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../../index");
class Employee extends index_1.Instance {
    get firstName() {
        return this.getPropertyByName('firstName');
    }
    setFirstName(value) {
        return this.setPropertyByName('firstName', value);
    }
    get lastName() {
        return this.getPropertyByName('lastName');
    }
    setLastName(value) {
        return this.setPropertyByName('lastName', value);
    }
    get salary() {
        return this._children.salary;
    }
    get departmentCode() {
        return this.getPropertyByName('departmentCode');
    }
    setDepartmentCode(value) {
        return this.setPropertyByName('departmentCode', value);
    }
    get id() {
        return this._children.id.value;
    }
    department() {
        return this._children.department.getValue();
    }
    setDepartment(value) {
        return this._children.department.setValue(value);
    }
    address() {
        return this._children.address.getValue();
    }
    setAddress(value) {
        return this._children.address.setValue(value);
    }
    get $states() {
        return this._states;
    }
    get $errors() {
        return this._errors;
    }
    init() {
        super.init();
        this._schema = exports.EMPLOYEE_SCHEMA;
    }
    createStates() {
        this._states = new EmployeeState(this, this._schema);
    }
    createErrors() {
        this._errors = new EmployeeErrors(this, this._schema);
    }
}
Employee.isPersistent = true;
exports.Employee = Employee;
class EmployeeErrors extends index_1.InstanceErrors {
    get $() {
        return this._messages.$;
    }
    get firstName() {
        return this._messages.firstName;
    }
    get lastName() {
        return this._messages.lastName;
    }
    get salary() {
        return this._messages.salary;
    }
    get departmentCode() {
        return this._messages.departmentCode;
    }
    get id() {
        return this._messages.id;
    }
    get department() {
        return this._messages.department;
    }
}
exports.EmployeeErrors = EmployeeErrors;
class EmployeeState extends index_1.InstanceState {
    get firstName() {
        return this._states.firstName;
    }
    get lastName() {
        return this._states.lastName;
    }
    get salary() {
        return this._states.salary;
    }
    get departmentCode() {
        return this._states.departmentCode;
    }
    get id() {
        return this._states.id;
    }
}
exports.EmployeeState = EmployeeState;
/* tslint:disable:object-literal-key-quotes */
/* tslint:disable:quotemark */
exports.EMPLOYEE_SCHEMA = {
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

//# sourceMappingURL=employee.js.map
