import {
    Instance, View, InstanceState, InstanceErrors, modelManager,
    HasManyComposition, HasManyAggregation, HasManyRefObject,
    ErrorState, State, StringState, IdState, BooleanState, IntegerState,
    EnumState, NumberState, DateState, DateTimeState, RefArrayState, RefObjectState,
    NumberValue
} from '../../../index';
import { Car } from './car';

export class Engine extends Instance {
    public static isPersistent: boolean = true;
    public get carChangedHits(): number {
        return this._children.carChangedHits.value;
    }
    public setCarChangedHits(value: number): Promise<number> {
        return this._children.carChangedHits.setValue(value);
    }
    public get name(): string {
        return this.getPropertyByName('name');
    }
    public setName(value: string): Promise<string> {
        return this.setPropertyByName('name', value);
    }
    public get id(): any {
        return this._children.id.value;
    }
    public get carId(): any {
        return this._children.carId.value;
    }
    public car(): Promise<Car> {
        return this._children.car.getValue();
    }
    public setCar(value: Car): Promise<Car> {
        return this._children.car.setValue(value);
    }
    public get $states(): EngineState {
        return this._states as EngineState;
    }
    public get $errors(): EngineErrors {
        return this._errors as EngineErrors;
    }
    protected init() {
        super.init();
        this._schema = ENGINE_SCHEMA;
    }
    protected createStates() {
        this._states = new EngineState(this, this._schema);
    }
    protected createErrors() {
        this._errors = new EngineErrors(this, this._schema);
    }
}

export class EngineErrors extends InstanceErrors {
    public get $(): ErrorState {
        return this._messages.$;
    }
    public get carChangedHits(): ErrorState {
        return this._messages.carChangedHits;
    }
    public get name(): ErrorState {
        return this._messages.name;
    }
    public get id(): ErrorState {
        return this._messages.id;
    }
    public get carId(): ErrorState {
        return this._messages.carId;
    }
}

export class EngineState extends InstanceState {
    public get carChangedHits(): IntegerState {
        return this._states.carChangedHits;
    }
    public get name(): StringState {
        return this._states.name;
    }
    public get id(): IdState {
        return this._states.id;
    }
    public get carId(): IdState {
        return this._states.carId;
    }
}
/* tslint:disable:object-literal-key-quotes */
/* tslint:disable:quotemark */
export const
    ENGINE_SCHEMA = {
        "type": "object",
        "name": "engine",
        "nameSpace": "compositions",
        "properties": {
            "carChangedHits": {
                "type": "integer",
                "default": 0
            },
            "name": {
                "type": "string"
            },
            "id": {
                "type": "integer",
                "generated": true,
                "format": "id",
                "transient": true
            },
            "carId": {
                "type": "integer",
                "isReadOnly": true,
                "format": "id"
            }
        },
        "relations": {
            "car": {
                "type": "belongsTo",
                "model": "car",
                "aggregationKind": "composite",
                "invRel": "engine",
                "nameSpace": "compositions",
                "title": "car",
                "invType": "hasOne",
                "localFields": [
                    "carId"
                ],
                "foreignFields": [
                    "id"
                ]
            }
        },
        "meta": {
            "parent": "car",
            "parentRelation": "car"
        },
        "primaryKey": [
            "id"
        ]
    };