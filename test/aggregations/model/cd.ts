import {
	Instance, InstanceState, InstanceErrors, ModelManager,
	HasManyComposition, HasManyAggregation,
	ErrorState, State, StringState, IdState, IntegerState, EnumState, NumberState, DateState, DateTimeState, RefArrayState, RefObjectState,
	IntegerValue, NumberValue
} from '../../../src/index';
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
	public get duration(): IntegerValue {
		return this._children.duration;
	}
	public get id(): Promise<any> {
		return this._children.id.value();
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
const
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
				"format": "id"
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
		}
	};
new ModelManager().registerClass(Cd, CD_SCHEMA.name, CD_SCHEMA.nameSpace);