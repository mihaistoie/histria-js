import {
    Instance, View, InstanceState, InstanceErrors, modelManager,
    HasManyComposition, HasManyAggregation, HasManyRefObject,
    ErrorState, State, StringState, IdState, BooleanState, IntegerState,
    EnumState, NumberState, DateState, DateTimeState, RefArrayState, RefObjectState,
    NumberValue
} from '../../../index';
import { Driver } from './driver';

export class Car extends Instance {
    public static isPersistent: boolean = true;
    public get driverName(): string {
        return this.getPropertyByName('driverName');
    }
    public setDriverName(value: string): Promise<string> {
        return this.setPropertyByName('driverName', value);
    }
    public get id(): any {
        return this._children.id.value;
    }
    public drivenBy(): Promise<Driver> {
        return this._children.drivenBy.getValue();
    }
    public setDrivenBy(value: Driver): Promise<Driver> {
        return this._children.drivenBy.setValue(value);
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
    public get driverName(): ErrorState {
        return this._messages.driverName;
    }
    public get id(): ErrorState {
        return this._messages.id;
    }
    public get drivenBy(): ErrorState {
        return this._messages.drivenBy;
    }
}

export class CarState extends InstanceState {
    public get driverName(): StringState {
        return this._states.driverName;
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
        "nameSpace": "aggregations",
        "properties": {
            "driverName": {
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
            "drivenBy": {
                "type": "hasOne",
                "model": "driver",
                "aggregationKind": "shared",
                "invRel": "drives",
                "nameSpace": "aggregations",
                "title": "drivenBy",
                "invType": "belongsTo",
                "localFields": [
                    "id"
                ],
                "foreignFields": [
                    "drivesId"
                ]
            }
        },
        "meta": {},
        "primaryKey": [
            "id"
        ]
    };