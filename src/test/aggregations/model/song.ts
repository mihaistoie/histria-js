import {
    Instance, View, InstanceState, InstanceErrors, modelManager,
    HasManyComposition, HasManyAggregation,
    ErrorState, State, StringState, IdState, BooleanState, IntegerState, EnumState, NumberState, DateState, DateTimeState, RefArrayState, RefObjectState,
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
        return <SongState>this._states;
    }
    public get $errors(): SongErrors {
        return <SongErrors>this._errors;
    }
    protected init() {
        super.init();
        let that = this;
        that._schema = SONG_SCHEMA;
    }
    protected createStates() {
        let that = this;
        that._states = new SongState(that, that._schema);
    }
    protected createErrors() {
        let that = this;
        that._errors = new SongErrors(that, that._schema);
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
export const
    SONG_SCHEMA = {
        type: 'object',
        name: 'song',
        nameSpace: 'aggregations',
        properties: {
            duration: {
                type: 'integer',
                default: 0
            },
            cdChangedHits: {
                type: 'integer',
                default: 0
            },
            id: {
                type: 'integer',
                generated: true,
                format: 'id'
            },
            cdId: {
                type: 'integer',
                isReadOnly: true,
                format: 'id'
            }
        },
        relations: {
            cd: {
                type: 'belongsTo',
                model: 'cd',
                aggregationKind: 'shared',
                invRel: 'songs',
                nameSpace: 'aggregations',
                title: 'cd',
                invType: 'hasMany',
                localFields: [
                    'cdId'
                ],
                foreignFields: [
                    'id'
                ]
            }
        },
        meta: {}
    };