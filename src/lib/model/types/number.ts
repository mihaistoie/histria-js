import { ModelObject } from '../model-object';
import { NumberState } from '../states/state';
import { ApplicationError, messages } from 'histria-utils';

export class BaseNumberValue {
    protected _parent: ModelObject;
    protected _decimals: number;
    protected _propertyName: string;
    constructor(parent: ModelObject, propertyName: string) {
        this._parent = parent;
        this._propertyName = propertyName;
        this.init();
    }
    public destroy() {
        this._parent = null;
    }
    public get value(): number {
        return this._parent.getPropertyByName(this._propertyName);
    }
    public setValue(value: number): Promise<number> {
        value = this._round(value);
        return this._parent.setPropertyByName(this._propertyName, value);
    }
    public get decimals(): number {
        return this._decimals;
    }

    public setDecimals(value: number): Promise<number> {
        if (this._decimals !== value)
            this._decimals = value;
        return Promise.resolve(this._decimals);
    }
    protected init() {
        this._decimals = 0;
    }
    protected _internalDecimals(): number {
        return this._decimals;
    }
    private _round(value: number): number {
        value = value || 0;
        if (typeof value !== 'number')
            throw new ApplicationError(messages(this._parent.context.lang).numbers.notANumber);
        if (isNaN(value))
            throw new ApplicationError(messages(this._parent.context.lang).numbers.isNan);
        return parseFloat(value.toFixed(this._internalDecimals()));
    }

}

export class IntegerValue extends BaseNumberValue {
}

export class NumberValue extends BaseNumberValue {
    public get decimals(): number {
        const state = this._state();
        return state.decimals;
    }
    public async setDecimals(value: number): Promise<number> {
        const state = this._state();
        if (state.decimals !== value) {
            state.decimals = value;
            const val = this.value;
            await this.setValue(val);
        }
        return state.decimals;
    }
    protected _internalDecimals(): number {
        const state = this._state();
        return state.decimals;
    }
    private _state(): NumberState {
        const parentStates: any = this._parent.$states;
        return parentStates[this._propertyName] as NumberState;
    }
}