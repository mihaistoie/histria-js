import {
	Instance, InstanceState, InstanceErrors, ModelManager,
	ErrorState, State, StringState, IntegerState, EnumState, NumberState, DateState, DateTimeState, RefArrayState, RefObjectState,
	IntegerValue, NumberValue
} from '../../../src/index';
import { Cd } from './cd';


export class Song extends Instance {
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
	public get id(): IntegerValue {
		return this._children.id;
	}
	public get cdId(): IntegerValue {
		return this._children.cdId;
	}
	public cd(value?: Cd): Promise<Cd> {
		return this._children.cd.value(value);
	}
	public get $states(): SongState {
		return <SongState>this._states;
	}
	public get $errors(): SongErrors {
		return <SongErrors>this._errors;
	}
}

export class SongErrors extends InstanceErrors {
	public get $(): ErrorState {
		return this._messages.$;
	}
	public get id(): ErrorState {
		return this._messages.id;
	}
	public get cdId(): ErrorState {
		return this._messages.cdId;
	}
	public get cd(): ErrorState {
		return this._messages.cd;
	}
}

export class SongState extends InstanceState {
	public get id(): IntegerState {
		return this._states.id;
	}
	public get cdId(): IntegerState {
		return this._states.cdId;
	}
}
const
	SONG_SCHEMA = {
		"type": "object",
		"name": "song",
		"properties": {
			"id": {
				"type": "integer",
				"generated": true
			},
			"cdId": {
				"type": "integer",
				"isReadOnly": true
			}
		},
		"relations": {
			"cd": {
				"type": "belongsTo",
				"model": "cd",
				"aggregationKind": "shared",
				"invRel": "songs",
				"title": "cd",
				"localFields": [
					"cdId"
				],
				"foreignFields": [
					"id"
				]
			}
		},
		"nameSpace": "Song"
	};
new ModelManager().registerClass(Song, SONG_SCHEMA.name, SONG_SCHEMA.nameSpace);