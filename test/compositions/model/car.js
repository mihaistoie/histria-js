"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../../index");
class Car extends index_1.Instance {
    get engineChangedHits() {
        return this._children.engineChangedHits.value;
    }
    setEngineChangedHits(value) {
        return this._children.engineChangedHits.setValue(value);
    }
    get engineName() {
        return this.getPropertyByName('engineName');
    }
    setEngineName(value) {
        return this.setPropertyByName('engineName', value);
    }
    get id() {
        return this._children.id.value;
    }
    engine() {
        return this._children.engine.getValue();
    }
    setEngine(value) {
        return this._children.engine.setValue(value);
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
    get engineChangedHits() {
        return this._messages.engineChangedHits;
    }
    get engineName() {
        return this._messages.engineName;
    }
    get id() {
        return this._messages.id;
    }
}
exports.CarErrors = CarErrors;
class CarState extends index_1.InstanceState {
    get engineChangedHits() {
        return this._states.engineChangedHits;
    }
    get engineName() {
        return this._states.engineName;
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
            "format": "id",
            "transient": true
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
    "meta": {},
    "primaryKey": [
        "id"
    ]
};

//# sourceMappingURL=car.js.map
