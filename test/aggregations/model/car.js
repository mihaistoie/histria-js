"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../../index");
class Car extends index_1.Instance {
    get driverName() {
        return this.getPropertyByName('driverName');
    }
    setDriverName(value) {
        return this.setPropertyByName('driverName', value);
    }
    get id() {
        return this._children.id.value;
    }
    drivenBy() {
        return this._children.drivenBy.getValue();
    }
    setDrivenBy(value) {
        return this._children.drivenBy.setValue(value);
    }
    get $states() {
        return this._states;
    }
    get $errors() {
        return this._errors;
    }
    init() {
        super.init();
        this._schema = exports.CAR_SCHEMA;
    }
    createStates() {
        this._states = new CarState(this, this._schema);
    }
    createErrors() {
        this._errors = new CarErrors(this, this._schema);
    }
}
Car.isPersistent = true;
exports.Car = Car;
class CarErrors extends index_1.InstanceErrors {
    get $() {
        return this._messages.$;
    }
    get driverName() {
        return this._messages.driverName;
    }
    get id() {
        return this._messages.id;
    }
    get drivenBy() {
        return this._messages.drivenBy;
    }
}
exports.CarErrors = CarErrors;
class CarState extends index_1.InstanceState {
    get driverName() {
        return this._states.driverName;
    }
    get id() {
        return this._states.id;
    }
}
exports.CarState = CarState;
/* tslint:disable:object-literal-key-quotes */
/* tslint:disable:quotemark */
exports.CAR_SCHEMA = {
    "type": "object",
    "name": "car",
    "nameSpace": "aggregations",
    "properties": {
        "driverName": {
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
        "drivenBy": {
            "type": "hasOne",
            "model": "driver",
            "aggregationKind": "shared",
            "invRel": "drives",
            "nameSpace": "aggregations",
            "title": "drivenBy",
            "invType": "belongsTo",
            "localFields": [
                "id"
            ],
            "foreignFields": [
                "drivesId"
            ]
        }
    },
    "meta": {},
    "primaryKey": [
        "id"
    ]
};

//# sourceMappingURL=car.js.map
