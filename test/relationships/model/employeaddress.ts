import {
	Instance, InstanceState, InstanceErrors, ModelManager,
	ErrorState, State, StringState, IntegerState, EnumState, NumberState, DateState, DateTimeState, RefArrayState, RefObjectState,
	IntegerValue, NumberValue
} from '../../../src/index';

const
	EMPLOYEADDRESS_SCHEMA = {
	"type": "object",
	"name": "employeAddress",
	"properties": {
		"street": {
			"title": "Street",
			"type": "string"
		},
		"city": {
			"title": "City",
			"type": "string"
		},
		"province": {
			"title": "Province",
			"type": "string"
		},
		"postalCode": {
			"title": "Postal Code",
			"type": "string"
		},
		"country": {
			"title": "Country",
			"type": "string"
		},
		"id": {
			"type": "integer",
			"generated": true
		}
	},
	"nameSpace": "EmployeAddress"
};

export class EmployeAddressState extends InstanceState {
	public get street(): StringState {
		return this._states.street;
	}
	public get city(): StringState {
		return this._states.city;
	}
	public get province(): StringState {
		return this._states.province;
	}
	public get postalCode(): StringState {
		return this._states.postalCode;
	}
	public get country(): StringState {
		return this._states.country;
	}
	public get id(): IntegerState {
		return this._states.id;
	}
}

export class EmployeAddressErrors extends InstanceErrors {
	public get $(): ErrorState {
		return this._messages.$;
	}
	public get street(): ErrorState {
		return this._messages.street;
	}
	public get city(): ErrorState {
		return this._messages.city;
	}
	public get province(): ErrorState {
		return this._messages.province;
	}
	public get postalCode(): ErrorState {
		return this._messages.postalCode;
	}
	public get country(): ErrorState {
		return this._messages.country;
	}
	public get id(): ErrorState {
		return this._messages.id;
	}
}

export class EmployeAddress extends Instance {
	protected init() {
		super.init();
		let that = this;
		that._schema = EMPLOYEADDRESS_SCHEMA;
	}
	protected createStates() {
		let that = this;
		that._states = new EmployeAddressState(that, that._schema);
	}
	protected createErrors() {
		let that = this;
		that._errors = new EmployeAddressErrors(that, that._schema);
	}
	public street(value?: string): Promise<string> {
		return this.getOrSetProperty('street', value);
	}
	public city(value?: string): Promise<string> {
		return this.getOrSetProperty('city', value);
	}
	public province(value?: string): Promise<string> {
		return this.getOrSetProperty('province', value);
	}
	public postalCode(value?: string): Promise<string> {
		return this.getOrSetProperty('postalCode', value);
	}
	public country(value?: string): Promise<string> {
		return this.getOrSetProperty('country', value);
	}
	public get id(): IntegerValue {
		return this._children.id;
	}
	public get $states(): EmployeAddressState {
		return <EmployeAddressState>this._states;
	}
	public get $errors(): EmployeAddressErrors {
		return <EmployeAddressErrors>this._errors;
	}
}
new ModelManager().registerClass(EmployeAddress, EMPLOYEADDRESS_SCHEMA.nameSpace);