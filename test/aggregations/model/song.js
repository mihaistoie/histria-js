"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../../index");
class Song extends index_1.Instance {
    get duration() {
        return this._children.duration.value;
    }
    setDuration(value) {
        return this._children.duration.setValue(value);
    }
    get cdChangedHits() {
        return this._children.cdChangedHits.value;
    }
    setCdChangedHits(value) {
        return this._children.cdChangedHits.setValue(value);
    }
    get id() {
        return this._children.id.value;
    }
    get cdId() {
        return this._children.cdId.value;
    }
    cd() {
        return this._children.cd.getValue();
    }
    setCd(value) {
        return this._children.cd.setValue(value);
    }
    get $states() {
        return this._states;
    }
    get $errors() {
        return this._errors;
    }
    init() {
        super.init();
        this._schema = exports.SONG_SCHEMA;
    }
    createStates() {
        this._states = new SongState(this, this._schema);
    }
    createErrors() {
        this._errors = new SongErrors(this, this._schema);
    }
}
Song.isPersistent = true;
exports.Song = Song;
class SongErrors extends index_1.InstanceErrors {
    get $() {
        return this._messages.$;
    }
    get duration() {
        return this._messages.duration;
    }
    get cdChangedHits() {
        return this._messages.cdChangedHits;
    }
    get id() {
        return this._messages.id;
    }
    get cdId() {
        return this._messages.cdId;
    }
}
exports.SongErrors = SongErrors;
class SongState extends index_1.InstanceState {
    get duration() {
        return this._states.duration;
    }
    get cdChangedHits() {
        return this._states.cdChangedHits;
    }
    get id() {
        return this._states.id;
    }
    get cdId() {
        return this._states.cdId;
    }
}
exports.SongState = SongState;
/* tslint:disable:object-literal-key-quotes */
/* tslint:disable:quotemark */
exports.SONG_SCHEMA = {
    "type": "object",
    "name": "song",
    "nameSpace": "aggregations",
    "properties": {
        "duration": {
            "type": "integer",
            "default": 0
        },
        "cdChangedHits": {
            "type": "integer",
            "default": 0
        },
        "id": {
            "type": "integer",
            "generated": true,
            "format": "id",
            "transient": true
        },
        "cdId": {
            "type": "integer",
            "isReadOnly": true,
            "format": "id"
        }
    },
    "relations": {
        "cd": {
            "type": "belongsTo",
            "model": "cd",
            "aggregationKind": "shared",
            "invRel": "songs",
            "nameSpace": "aggregations",
            "title": "cd",
            "invType": "hasMany",
            "localFields": [
                "cdId"
            ],
            "foreignFields": [
                "id"
            ]
        }
    },
    "meta": {},
    "primaryKey": [
        "id"
    ]
};

//# sourceMappingURL=song.js.map
