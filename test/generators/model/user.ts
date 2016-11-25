import {
	Instance, InstanceState, InstanceErrors, ModelManager,
	ErrorState, State, StringState, IntegerState, EnumState, NumberState, DateState, DateTimeState, RefArrayState, RefObjectState,
	IntegerValue, NumberValue
} from '../../../src/index';

const
	USER_SCHEMA = {
		"type": "object",
		"nameSpace": "users",
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
}

export class UserErrors extends InstanceErrors {
	public get $(): ErrorState {
		return this._messages.$;
	}
	public get age(): Error {
		return this._messages.age;
	}
	public get firstName(): Error {
		return this._messages.firstName;
	}
	public get lastName(): Error {
		return this._messages.lastName;
	}
	public get fullName(): Error {
		return this._messages.fullName;
	}
}

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
	public get $states(): UserState {
		return <UserState>this._states;
	}
	public get $errors(): UserErrors {
		return <UserErrors>this._errors;
	}
}
new ModelManager().registerClass(User, USER_SCHEMA.nameSpace);