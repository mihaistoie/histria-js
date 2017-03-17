import {
	Instance, View, InstanceState, InstanceErrors, modelManager,
	HasManyComposition, HasManyAggregation,
	ErrorState, State, StringState, IdState, BooleanState, IntegerState, EnumState, NumberState, DateState, DateTimeState, RefArrayState, RefObjectState,
	NumberValue
} from '../../index';
import { User } from './user';


export class UserDetail extends View {
	protected init() {
		super.init();
		let that = this;
		that._schema = USERDETAIL_SCHEMA;
	}
	protected createStates() {
		let that = this;
		that._states = new UserDetailState(that, that._schema);
	}
	protected createErrors() {
		let that = this;
		that._errors = new UserDetailErrors(that, that._schema);
	}
	public get fullName(): string {
		return this.getPropertyByName('fullName');
	}
	public setFullName(value: string): Promise<string> {
		return this.setPropertyByName('fullName', value);
	}
	public get id(): any {
		return this._children.id.value;
	}
	public get masterId(): any {
		return this._children.masterId.value;
	}
	public master(): Promise<User> {
		return this._children.master.getValue();
	}
	public setMaster(value: User): Promise<User> {
		return this._children.master.setValue(value);
	}
	public get $states(): UserDetailState {
		return <UserDetailState>this._states;
	}
	public get $errors(): UserDetailErrors {
		return <UserDetailErrors>this._errors;
	}
}

export class UserDetailErrors extends InstanceErrors {
	public get $(): ErrorState {
		return this._messages.$;
	}
	public get fullName(): ErrorState {
		return this._messages.fullName;
	}
	public get id(): ErrorState {
		return this._messages.id;
	}
	public get masterId(): ErrorState {
		return this._messages.masterId;
	}
	public get master(): ErrorState {
		return this._messages.master;
	}
}

export class UserDetailState extends InstanceState {
	public get fullName(): StringState {
		return this._states.fullName;
	}
	public get id(): IdState {
		return this._states.id;
	}
	public get masterId(): IdState {
		return this._states.masterId;
	}
}
export const
	USERDETAIL_SCHEMA = {
		"name": "UserDetail",
		"type": "object",
		"view": true,
		"nameSpace": "view-one",
		"properties": {
			"fullName": {
				"title": "FullName Name",
				"type": "string"
			},
			"id": {
				"type": "integer",
				"generated": true,
				"format": "id"
			},
			"masterId": {
				"type": "integer",
				"isReadOnly": true,
				"format": "id"
			}
		},
		"relations": {
			"master": {
				"type": "hasOne",
				"model": "user",
				"aggregationKind": "composite",
				"nameSpace": "view-one",
				"title": "master",
				"localFields": [
					"masterId"
				],
				"foreignFields": [
					"id"
				]
			}
		},
		"states": {
			"fullName": {
				"isReadOnly": true
			}
		},
		"meta": {}
	};