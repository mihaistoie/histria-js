"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../../index");
class Department extends index_1.Instance {
    init() {
        super.init();
        let that = this;
        that._schema = exports.DEPARTMENT_SCHEMA;
    }
    createStates() {
        let that = this;
        that._states = new DepartmentState(that, that._schema);
    }
    createErrors() {
        let that = this;
        that._errors = new DepartmentErrors(that, that._schema);
    }
    get code() {
        return this.getPropertyByName('code');
    }
    setCode(value) {
        return this.setPropertyByName('code', value);
    }
    get title() {
        return this.getPropertyByName('title');
    }
    setTitle(value) {
        return this.setPropertyByName('title', value);
    }
    get id() {
        return this._children.id.value;
    }
    get $states() {
        return this._states;
    }
    get $errors() {
        return this._errors;
    }
}
exports.Department = Department;
class DepartmentErrors extends index_1.InstanceErrors {
    get $() {
        return this._messages.$;
    }
    get code() {
        return this._messages.code;
    }
    get title() {
        return this._messages.title;
    }
    get id() {
        return this._messages.id;
    }
}
exports.DepartmentErrors = DepartmentErrors;
class DepartmentState extends index_1.InstanceState {
    get code() {
        return this._states.code;
    }
    get title() {
        return this._states.title;
    }
    get id() {
        return this._states.id;
    }
}
exports.DepartmentState = DepartmentState;
exports.DEPARTMENT_SCHEMA = {
    "type": "object",
    "nameSpace": "references",
    "name": "department",
    "primaryKey": [
        "code"
    ],
    "properties": {
        "code": {
            "type": "string",
            "title": "Code"
        },
        "title": {
            "type": "string",
            "title": "Title"
        },
        "id": {
            "type": "integer",
            "generated": true,
            "format": "id"
        }
    },
    "meta": {}
};
