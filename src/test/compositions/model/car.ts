import {
    Instance, View, InstanceState, InstanceErrors, modelManager,
    HasManyComposition, HasManyAggregation, HasManyRefObject,
    ErrorState, State, StringState, IdState, BooleanState, IntegerState,
    EnumState, NumberState, DateState, DateTimeState, RefArrayState, RefObjectState,
    NumberValue
} from '../../../index';
import { Engine } from './engine';

export class Car extends Instance {
    public static isPersistent: boolean = true;
    public get engineChangedHits(): number {
        return this._children.engineChangedHits.value;
    }
    public setEngineChangedHits(value: number): Promise<number> {
        return this._children.engineChangedHits.setValue(value);
    }
    public get engineName(): string {
        return this.getPropertyByName('engineName');
    }
    public setEngineName(value: string): Promise<string> {
        return this.setPropertyByName('engineName', value);
    }
    public get id(): any {
        return this._children.id.value;
    }
    public engine(): Promise<Engine> {
        return this._children.engine.getValue();
    }
    public setEngine(value: Engine): Promise<Engine> {
        return this._children.engine.setValue(value);
    }
    public get $states(): CarState {
        return this._states as CarState;
    }
    public get $errors(): CarErrors {
        return this._errors as CarErrors;
    }
    protected init() {
        super.init();
        this._schema = CAR_SCHEMA;
    }
    protected createStates() {
        this._states = new CarState(this, this._schema);
    }
    protected createErrors() {
        this._errors = new CarErrors(this, this._schema);
    }
}

export class CarErrors extends InstanceErrors {
    public get $(): ErrorState {
        return this._messages.$;
    }
    public get engineChangedHits(): ErrorState {
        return this._messages.engineChangedHits;
    }
    public get engineName(): ErrorState {
        return this._messages.engineName;
    }
    public get id(): ErrorState {
        return this._messages.id;
    }
}

export class CarState extends InstanceState {
    public get engineChangedHits(): IntegerState {
        return this._states.engineChangedHits;
    }
    public get engineName(): StringState {
        return this._states.engineName;
    }
    public get id(): IdState {
        return this._states.id;
    }
}
/* tslint:disable:object-literal-key-quotes */
/* tslint:disable:quotemark */
export const
    CAR_SCHEMA = {
        "type": "object",
        "name": "car",
        "nameSpace": "compositions",
        "properties": {
            "engineChangedHits": {
                "type": "integer",
                "default": 0
            },
            "engineName": {
                "type": "string"
            },
            "id": {
                "type": "integer",
                "generated": true,
                "format": "id",
                "transient": true
            }
        },
        "relations": {
            "engine": {
                "type": "hasOne",
                "model": "engine",
                "aggregationKind": "composite",
                "invRel": "car",
                "nameSpace": "compositions",
                "title": "engine",
                "invType": "belongsTo",
                "localFields": [
                    "id"
                ],
                "foreignFields": [
                    "carId"
                ]
            }
        },
        "meta": {},
        "primaryKey": [
            "id"
        ]
    };