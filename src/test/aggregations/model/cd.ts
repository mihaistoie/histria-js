import {
    Instance, View, InstanceState, InstanceErrors, modelManager,
    HasManyComposition, HasManyAggregation,
    ErrorState, State, StringState, IdState, BooleanState, IntegerState, EnumState, NumberState, DateState, DateTimeState, RefArrayState, RefObjectState,
    NumberValue
} from '../../../index';
import { Song } from './song';


export class Cd extends Instance {
    protected init() {
        super.init();
        let that = this;
        that._schema = CD_SCHEMA;
    }
    protected createStates() {
        let that = this;
        that._states = new CdState(that, that._schema);
    }
    protected createErrors() {
        let that = this;
        that._errors = new CdErrors(that, that._schema);
    }
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
        return <CdState>this._states;
    }
    public get $errors(): CdErrors {
        return <CdErrors>this._errors;
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
    public get songs(): ErrorState {
        return this._messages.songs;
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
export const
    CD_SCHEMA = {
        type: 'object',
        name: 'cd',
        nameSpace: 'aggregations',
        properties: {
            duration: {
                type: 'integer',
                default: 0
            },
            id: {
                type: 'integer',
                generated: true,
                format: 'id'
            }
        },
        relations: {
            songs: {
                type: 'hasMany',
                model: 'song',
                aggregationKind: 'shared',
                invRel: 'cd',
                nameSpace: 'aggregations',
                title: 'songs',
                invType: 'belongsTo',
                localFields: [
                    'id'
                ],
                foreignFields: [
                    'cdId'
                ]
            }
        },
        meta: {}
    };