"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../../index");
class Cd extends index_1.Instance {
    get duration() {
        return this._children.duration.value;
    }
    setDuration(value) {
        return this._children.duration.setValue(value);
    }
    get id() {
        return this._children.id.value;
    }
    get songs() {
        return this._children.songs;
    }
    get $states() {
        return this._states;
    }
    get $errors() {
        return this._errors;
    }
    init() {
        super.init();
        this._schema = exports.CD_SCHEMA;
    }
    createStates() {
        this._states = new CdState(this, this._schema);
    }
    createErrors() {
        this._errors = new CdErrors(this, this._schema);
    }
}
Cd.isPersistent = true;
exports.Cd = Cd;
class CdErrors extends index_1.InstanceErrors {
    get $() {
        return this._messages.$;
    }
    get duration() {
        return this._messages.duration;
    }
    get id() {
        return this._messages.id;
    }
}
exports.CdErrors = CdErrors;
class CdState extends index_1.InstanceState {
    get duration() {
        return this._states.duration;
    }
    get id() {
        return this._states.id;
    }
}
exports.CdState = CdState;
/* tslint:disable:object-literal-key-quotes */
/* tslint:disable:quotemark */
exports.CD_SCHEMA = {
    "type": "object",
    "name": "cd",
    "nameSpace": "aggregations",
    "properties": {
        "duration": {
            "type": "integer",
            "default": 0
        },
        "id": {
            "type": "integer",
            "generated": true,
            "format": "id",
            "transient": true
        }
    },
    "relations": {
        "songs": {
            "type": "hasMany",
            "model": "song",
            "aggregationKind": "shared",
            "invRel": "cd",
            "nameSpace": "aggregations",
            "title": "songs",
            "invType": "belongsTo",
            "localFields": [
                "id"
            ],
            "foreignFields": [
                "cdId"
            ]
        }
    },
    "meta": {},
    "primaryKey": [
        "id"
    ]
};

//# sourceMappingURL=cd.js.map
