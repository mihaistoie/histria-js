import {
    Instance, View, InstanceState, InstanceErrors, modelManager,
    HasManyComposition, HasManyAggregation, HasManyRefObject,
    ErrorState, State, StringState, IdState, BooleanState, IntegerState,
    EnumState, NumberState, DateState, DateTimeState, RefArrayState, RefObjectState,
    NumberValue
} from '../../../index';

export class Department extends Instance {
    public static isPersistent: boolean = true;
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
        return this._states as DepartmentState;
    }
    public get $errors(): DepartmentErrors {
        return this._errors as DepartmentErrors;
    }
    protected init() {
        super.init();
        this._schema = DEPARTMENT_SCHEMA;
    }
    protected createStates() {
        this._states = new DepartmentState(this, this._schema);
    }
    protected createErrors() {
        this._errors = new DepartmentErrors(this, this._schema);
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
/* tslint:disable:object-literal-key-quotes */
/* tslint:disable:quotemark */
export const
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