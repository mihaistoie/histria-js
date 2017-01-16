import {
	Instance, InstanceState, InstanceErrors, ModelManager,
	HasManyComposition, HasManyAggregation,
	ErrorState, State, StringState, IdState, IntegerState, EnumState, NumberState, DateState, DateTimeState, RefArrayState, RefObjectState,
	IntegerValue, NumberValue
} from '../../../src/index';


export class User extends Instance {
	protected init() {
		super.init();
		let that = this;
		that._schema = USER_SCHEMA;
	}
	protected createStates() {
		let that = this;
		that._states = new UserState(that, that._schema);
	}
	protected createErrors() {
		let that = this;
		that._errors = new UserErrors(that, that._schema);
	}
	public get age(): IntegerValue {
		return this._children.age;
	}
	public firstName(value?: string): Promise<string> {
		return this.getOrSetProperty('firstName', value);
	}
	public lastName(value?: string): Promise<string> {
		return this.getOrSetProperty('lastName', value);
	}
	public fullName(value?: string): Promise<string> {
		return this.getOrSetProperty('fullName', value);
	}
	public get id(): Promise<any> {
		return this._children.id.value();
	}
	public get $states(): UserState {
		return <UserState>this._states;
	}
	public get $errors(): UserErrors {
		return <UserErrors>this._errors;
	}
}

export class UserErrors extends InstanceErrors {
	public get $(): ErrorState {
		return this._messages.$;
	}
	public get age(): ErrorState {
		return this._messages.age;
	}
	public get firstName(): ErrorState {
		return this._messages.firstName;
	}
	public get lastName(): ErrorState {
		return this._messages.lastName;
	}
	public get fullName(): ErrorState {
		return this._messages.fullName;
	}
	public get id(): ErrorState {
		return this._messages.id;
	}
}

export class UserState extends InstanceState {
	public get age(): IntegerState {
		return this._states.age;
	}
	public get firstName(): StringState {
		return this._states.firstName;
	}
	public get lastName(): StringState {
		return this._states.lastName;
	}
	public get fullName(): StringState {
		return this._states.fullName;
	}
	public get id(): IdState {
		return this._states.id;
	}
}
const
	USER_SCHEMA = {
		"name": "user",
		"type": "object",
		"nameSpace": "salesorder",
		"properties": {
			"age": {
				"title": "Age",
				"type": "integer"
			},
			"firstName": {
				"title": "First Name",
				"type": "string"
			},
			"lastName": {
				"title": "Last Name",
				"type": "string"
			},
			"fullName": {
				"title": "Full Name",
				"type": "string"
			},
			"id": {
				"type": "integer",
				"generated": true,
				"format": "id"
			}
		},
		"states": {
			"firstName": {
				"isMandatory": true
			},
			"fullName": {
				"isReadOnly": true
			}
		}
	};
new ModelManager().registerClass(User, USER_SCHEMA.name, USER_SCHEMA.nameSpace);