"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../../index");
class Driver extends index_1.Instance {
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
    get drivesId() {
        return this._children.drivesId.value;
    }
    drives() {
        return this._children.drives.getValue();
    }
    setDrives(value) {
        return this._children.drives.setValue(value);
    }
    get $states() {
        return this._states;
    }
    get $errors() {
        return this._errors;
    }
    init() {
        super.init();
        let that = this;
        that._schema = exports.DRIVER_SCHEMA;
    }
    createStates() {
        let that = this;
        that._states = new DriverState(that, that._schema);
    }
    createErrors() {
        let that = this;
        that._errors = new DriverErrors(that, that._schema);
    }
}
Driver.isPersistent = true;
exports.Driver = Driver;
class DriverErrors extends index_1.InstanceErrors {
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
    get drivesId() {
        return this._messages.drivesId;
    }
}
exports.DriverErrors = DriverErrors;
class DriverState extends index_1.InstanceState {
    get carChangedHits() {
        return this._states.carChangedHits;
    }
    get name() {
        return this._states.name;
    }
    get id() {
        return this._states.id;
    }
    get drivesId() {
        return this._states.drivesId;
    }
}
exports.DriverState = DriverState;
/* tslint:disable:quotemark */
exports.DRIVER_SCHEMA = {
    "type": "object",
    "name": "driver",
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
        "drivesId": {
            "type": "integer",
            "isReadOnly": true,
            "format": "id"
        }
    },
    "nameSpace": "aggregations",
    "relations": {
        "drives": {
            "type": "belongsTo",
            "model": "car",
            "aggregationKind": "shared",
            "invRel": "drivenBy",
            "nameSpace": "aggregations",
            "title": "drives",
            "invType": "hasOne",
            "localFields": [
                "drivesId"
            ],
            "foreignFields": [
                "id"
            ]
        }
    },
    "meta": {}
};

//# sourceMappingURL=driver.js.map
