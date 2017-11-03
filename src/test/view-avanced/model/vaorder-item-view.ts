import {
    Instance, View, InstanceState, InstanceErrors, modelManager,
    HasManyComposition, HasManyAggregation, HasManyRefObject,
    ErrorState, State, StringState, IdState, BooleanState, IntegerState,
    EnumState, NumberState, DateState, DateTimeState, RefArrayState, RefObjectState,
    NumberValue
} from '../../../index';
import { VAOrderItem } from './vaorder-item';


export class VAOrderItemView extends View {
    public static isPersistent: boolean = false;
    public get id(): any {
        return this._children.id.value;
    }
    public get orderitemId(): any {
        return this._children.orderitemId.value;
    }
    public orderitem(): Promise<VAOrderItem> {
        return this._children.orderitem.getValue();
    }
    public setOrderitem(value: VAOrderItem): Promise<VAOrderItem> {
        return this._children.orderitem.setValue(value);
    }
    public get $states(): VAOrderItemViewState {
        return <VAOrderItemViewState>this._states;
    }
    public get $errors(): VAOrderItemViewErrors {
        return <VAOrderItemViewErrors>this._errors;
    }
    protected init() {
        super.init();
        let that = this;
        that._schema = VAORDERITEMVIEW_SCHEMA;
    }
    protected createStates() {
        let that = this;
        that._states = new VAOrderItemViewState(that, that._schema);
    }
    protected createErrors() {
        let that = this;
        that._errors = new VAOrderItemViewErrors(that, that._schema);
    }
}

export class VAOrderItemViewErrors extends InstanceErrors {
    public get $(): ErrorState {
        return this._messages.$;
    }
    public get id(): ErrorState {
        return this._messages.id;
    }
    public get orderitemId(): ErrorState {
        return this._messages.orderitemId;
    }
}

export class VAOrderItemViewState extends InstanceState {
    public get id(): IdState {
        return this._states.id;
    }
    public get orderitemId(): IdState {
        return this._states.orderitemId;
    }
}
export const
    VAORDERITEMVIEW_SCHEMA = {
        name: 'VAOrderItemView',
        type: 'object',
        view: true,
        nameSpace: 'view-avanced',
        properties: {
            id: {
                type: 'integer',
                generated: true,
                format: 'id'
            },
            orderitemId: {
                type: 'integer',
                isReadOnly: true,
                format: 'id'
            }
        },
        relations: {
            orderitem: {
                type: 'hasOne',
                model: 'VAOrderItem',
                aggregationKind: 'composite',
                nameSpace: 'view-avanced',
                title: 'orderitem',
                localFields: [
                    'orderitemId'
                ],
                foreignFields: [
                    'id'
                ]
            }
        },
        meta: {}
    };