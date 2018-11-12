import {
    Instance, View, InstanceState, InstanceErrors, modelManager,
    HasManyComposition, HasManyAggregation, HasManyRefObject,
    ErrorState, State, StringState, IdState, BooleanState, IntegerState,
    EnumState, NumberState, DateState, DateTimeState, RefArrayState, RefObjectState,
    NumberValue
} from '../../../index';
import { Song } from './song';

export class Cd extends Instance {
    public static isPersistent: boolean = true;
    public get duration(): number {
        return this._children.duration.value;
    }
    public setDuration(value: number): Promise<number> {
        return this._children.duration.setValue(value);
    }
    public get id(): any {
        return this._children.id.value;
    }
    get songs(): HasManyAggregation<Song> {
        return this._children.songs;
    }
    public get $states(): CdState {
        return this._states as CdState;
    }
    public get $errors(): CdErrors {
        return this._errors as CdErrors;
    }
    protected init() {
        super.init();
        this._schema = CD_SCHEMA;
    }
    protected createStates() {
        this._states = new CdState(this, this._schema);
    }
    protected createErrors() {
        this._errors = new CdErrors(this, this._schema);
    }
}

export class CdErrors extends InstanceErrors {
    public get $(): ErrorState {
        return this._messages.$;
    }
    public get duration(): ErrorState {
        return this._messages.duration;
    }
    public get id(): ErrorState {
        return this._messages.id;
    }
}

export class CdState extends InstanceState {
    public get duration(): IntegerState {
        return this._states.duration;
    }
    public get id(): IdState {
        return this._states.id;
    }
}
/* tslint:disable:object-literal-key-quotes */
/* tslint:disable:quotemark */
export const
    CD_SCHEMA = {
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