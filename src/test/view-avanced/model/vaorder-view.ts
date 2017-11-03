import {
    Instance, View, InstanceState, InstanceErrors, modelManager,
    HasManyComposition, HasManyAggregation, HasManyRefObject,
    ErrorState, State, StringState, IdState, BooleanState, IntegerState,
    EnumState, NumberState, DateState, DateTimeState, RefArrayState, RefObjectState,
    NumberValue
} from '../../../index';
import { VAOrder } from './vaorder';


export class VAOrderView extends View {
    public static isPersistent: boolean = false;
    public get id(): any {
        return this._children.id.value;
    }
    public get orderId(): any {
        return this._children.orderId.value;
    }
    public order(): Promise<VAOrder> {
        return this._children.order.getValue();
    }
    public setOrder(value: VAOrder): Promise<VAOrder> {
        return this._children.order.setValue(value);
    }
    public get $states(): VAOrderViewState {
        return <VAOrderViewState>this._states;
    }
    public get $errors(): VAOrderViewErrors {
        return <VAOrderViewErrors>this._errors;
    }
    protected init() {
        super.init();
        let that = this;
        that._schema = VAORDERVIEW_SCHEMA;
    }
    protected createStates() {
        let that = this;
        that._states = new VAOrderViewState(that, that._schema);
    }
    protected createErrors() {
        let that = this;
        that._errors = new VAOrderViewErrors(that, that._schema);
    }
}

export class VAOrderViewErrors extends InstanceErrors {
    public get $(): ErrorState {
        return this._messages.$;
    }
    public get id(): ErrorState {
        return this._messages.id;
    }
    public get orderId(): ErrorState {
        return this._messages.orderId;
    }
}

export class VAOrderViewState extends InstanceState {
    public get id(): IdState {
        return this._states.id;
    }
    public get orderId(): IdState {
        return this._states.orderId;
    }
}
export const
    VAORDERVIEW_SCHEMA = {
        name: 'VAOrderView',
        type: 'object',
        view: true,
        nameSpace: 'view-avanced',
        properties: {
            id: {
                type: 'integer',
                generated: true,
                format: 'id'
            },
            orderId: {
                type: 'integer',
                isReadOnly: true,
                format: 'id'
            }
        },
        relations: {
            order: {
                type: 'hasOne',
                model: 'VAOrder',
                aggregationKind: 'composite',
                nameSpace: 'view-avanced',
                title: 'order',
                localFields: [
                    'orderId'
                ],
                foreignFields: [
                    'id'
                ]
            }
        },
        meta: {}
    };