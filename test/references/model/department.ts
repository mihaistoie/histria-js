import {
	Instance, InstanceState, InstanceErrors, modelManager,
	HasManyComposition, HasManyAggregation,
	ErrorState, State, StringState, IdState, BooleanState, IntegerState, EnumState, NumberState, DateState, DateTimeState, RefArrayState, RefObjectState,
	IntegerValue, NumberValue
} from '../../../src/index';


export class Department extends Instance {
	protected init() {
		super.init();
		let that = this;
		that._schema = DEPARTMENT_SCHEMA;
	}
	protected createStates() {
		let that = this;
		that._states = new DepartmentState(that, that._schema);
	}
	protected createErrors() {
		let that = this;
		that._errors = new DepartmentErrors(that, that._schema);
	}
	public get code(): string {
		return this.getPropertyByName('code');
	}
	public setCode(value: string): Promise<string> {
		return this.setPropertyByName('code', value);
	}
	public get title(): string {
		return this.getPropertyByName('title');
	}
	public setTitle(value: string): Promise<string> {
		return this.setPropertyByName('title', value);
	}
	public get id(): any {
		return this._children.id.value;
	}
	public get $states(): DepartmentState {
		return <DepartmentState>this._states;
	}
	public get $errors(): DepartmentErrors {
		return <DepartmentErrors>this._errors;
	}
}

export class DepartmentErrors extends InstanceErrors {
	public get $(): ErrorState {
		return this._messages.$;
	}
	public get code(): ErrorState {
		return this._messages.code;
	}
	public get title(): ErrorState {
		return this._messages.title;
	}
	public get id(): ErrorState {
		return this._messages.id;
	}
}

export class DepartmentState extends InstanceState {
	public get code(): StringState {
		return this._states.code;
	}
	public get title(): StringState {
		return this._states.title;
	}
	public get id(): IdState {
		return this._states.id;
	}
}
const
	DEPARTMENT_SCHEMA = {
		"type": "object",
		"nameSpace": "references",
		"name": "department",
		"primaryKey": [
			"code"
		],
		"properties": {
			"code": {
				"type": "string",
				"title": "Code"
			},
			"title": {
				"type": "string",
				"title": "Title"
			},
			"id": {
				"type": "integer",
				"generated": true,
				"format": "id"
			}
		},
		"meta": {}
	};
modelManager().registerClass(Department, DEPARTMENT_SCHEMA);