import {
    Instance, View, InstanceState, InstanceErrors, modelManager,
    HasManyComposition, HasManyAggregation, HasManyRefObject,
    ErrorState, State, StringState, IdState, BooleanState, IntegerState,
    EnumState, NumberState, DateState, DateTimeState, RefArrayState, RefObjectState,
    NumberValue
} from '../../../index';
import { Cd } from './cd';

export class Song extends Instance {
    public static isPersistent: boolean = true;
    public get duration(): number {
        return this._children.duration.value;
    }
    public setDuration(value: number): Promise<number> {
        return this._children.duration.setValue(value);
    }
    public get cdChangedHits(): number {
        return this._children.cdChangedHits.value;
    }
    public setCdChangedHits(value: number): Promise<number> {
        return this._children.cdChangedHits.setValue(value);
    }
    public get id(): any {
        return this._children.id.value;
    }
    public get cdId(): any {
        return this._children.cdId.value;
    }
    public cd(): Promise<Cd> {
        return this._children.cd.getValue();
    }
    public setCd(value: Cd): Promise<Cd> {
        return this._children.cd.setValue(value);
    }
    public get $states(): SongState {
        return this._states as SongState;
    }
    public get $errors(): SongErrors {
        return this._errors as SongErrors;
    }
    protected init() {
        super.init();
        this._schema = SONG_SCHEMA;
    }
    protected createStates() {
        this._states = new SongState(this, this._schema);
    }
    protected createErrors() {
        this._errors = new SongErrors(this, this._schema);
    }
}

export class SongErrors extends InstanceErrors {
    public get $(): ErrorState {
        return this._messages.$;
    }
    public get duration(): ErrorState {
        return this._messages.duration;
    }
    public get cdChangedHits(): ErrorState {
        return this._messages.cdChangedHits;
    }
    public get id(): ErrorState {
        return this._messages.id;
    }
    public get cdId(): ErrorState {
        return this._messages.cdId;
    }
}

export class SongState extends InstanceState {
    public get duration(): IntegerState {
        return this._states.duration;
    }
    public get cdChangedHits(): IntegerState {
        return this._states.cdChangedHits;
    }
    public get id(): IdState {
        return this._states.id;
    }
    public get cdId(): IdState {
        return this._states.cdId;
    }
}
/* tslint:disable:object-literal-key-quotes */
/* tslint:disable:quotemark */
export const
    SONG_SCHEMA = {
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