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
	public get age(): IntegerValue {
		return this._children.age;
	}
	firstName(value?: string): Promise<string> {
		return this.getOrSetProperty('firstName', value);
	}
	lastName(value?: string): Promise<string> {
		return this.getOrSetProperty('lastName', value);
	}
	fullName(value?: string): Promise<string> {
		return this.getOrSetProperty('fullName', value);
	}
	public get states(): UserState {
		return <UserState>this._states;
	}
}
new ModelManager().registerClass(User, USER_SCHEMA.nameSpace);