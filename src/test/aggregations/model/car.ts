import {
    Instance, View, InstanceState, InstanceErrors, modelManager,
    HasManyComposition, HasManyAggregation,
    ErrorState, State, StringState, IdState, BooleanState, IntegerState, EnumState, NumberState, DateState, DateTimeState, RefArrayState, RefObjectState,
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
        return <CarState>this._states;
    }
    public get $errors(): CarErrors {
        return <CarErrors>this._errors;
    }
    protected init() {
        super.init();
        let that = this;
        that._schema = CAR_SCHEMA;
    }
    protected createStates() {
        let that = this;
        that._states = new CarState(that, that._schema);
    }
    protected createErrors() {
        let that = this;
        that._errors = new CarErrors(that, that._schema);
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
export const
    CAR_SCHEMA = {
        type: 'object',
        name: 'car',
        nameSpace: 'aggregations',
        properties: {
            driverName: {
                type: 'string'
            },
            id: {
                type: 'integer',
                generated: true,
                format: 'id'
            }
        },
        relations: {
            drivenBy: {
                type: 'hasOne',
                model: 'driver',
                aggregationKind: 'shared',
                invRel: 'drives',
                nameSpace: 'aggregations',
                title: 'drivenBy',
                invType: 'belongsTo',
                localFields: [
                    'id'
                ],
                foreignFields: [
                    'drivesId'
                ]
            }
        },
        meta: {}
    };