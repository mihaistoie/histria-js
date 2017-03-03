"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../../index");
class Engine extends index_1.Instance {
    init() {
        super.init();
        let that = this;
        that._schema = exports.ENGINE_SCHEMA;
    }
    createStates() {
        let that = this;
        that._states = new EngineState(that, that._schema);
    }
    createErrors() {
        let that = this;
        that._errors = new EngineErrors(that, that._schema);
    }
    get carChangedHits() {
        return this._children.carChangedHits.value;
    }
    setCarChangedHits(value) {
        return this._children.carChangedHits.setValue(value);
    }
    get name() {
        return this.getPropertyByName('name');
    }
    setName(value) {
        return this.setPropertyByName('name', value);
    }
    get id() {
        return this._children.id.value;
    }
    get carId() {
        return this._children.carId.value;
    }
    car() {
        return this._children.car.getValue();
    }
    setCar(value) {
        return this._children.car.setValue(value);
    }
    get $states() {
        return this._states;
    }
    get $errors() {
        return this._errors;
    }
}
exports.Engine = Engine;
class EngineErrors extends index_1.InstanceErrors {
    get $() {
        return this._messages.$;
    }
    get carChangedHits() {
        return this._messages.carChangedHits;
    }
    get name() {
        return this._messages.name;
    }
    get id() {
        return this._messages.id;
    }
    get carId() {
        return this._messages.carId;
    }
    get car() {
        return this._messages.car;
    }
}
exports.EngineErrors = EngineErrors;
class EngineState extends index_1.InstanceState {
    get carChangedHits() {
        return this._states.carChangedHits;
    }
    get name() {
        return this._states.name;
    }
    get id() {
        return this._states.id;
    }
    get carId() {
        return this._states.carId;
    }
}
exports.EngineState = EngineState;
exports.ENGINE_SCHEMA = {
    "type": "object",
    "name": "engine",
    "nameSpace": "compositions",
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
        "carId": {
            "type": "integer",
            "isReadOnly": true,
            "format": "id"
        }
    },
    "relations": {
        "car": {
            "type": "belongsTo",
            "model": "car",
            "aggregationKind": "composite",
            "invRel": "engine",
            "nameSpace": "compositions",
            "title": "car",
            "invType": "hasOne",
            "localFields": [
                "carId"
            ],
            "foreignFields": [
                "id"
            ]
        }
    },
    "meta": {
        "parent": "car"
    }
};
