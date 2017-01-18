import { Instance } from './base-object';
import { ApplicationError } from '../utils/errors';
import { messages } from '../locale/messages';

export class BaseNumberValue {
    protected _parent: Instance;
    protected _decimals: number;
    protected _propertyName: string;
    constructor(parent: Instance, propertyName: string) {
        let that = this;
        that._parent = parent;

        that._propertyName = propertyName;
        that.init();
    }
    protected _internalDecimals(): number {
        return this._decimals;
    }
    private _round(value: number): number {
        let that = this;
        value = value || 0;
        if (typeof value !== 'number')
            throw new ApplicationError(messages(that._parent.context.lang).numbers.notANumber);
        if (isNaN(value))
            throw new ApplicationError(messages(that._parent.context.lang).numbers.isNan);
        return parseFloat(value.toFixed(that._internalDecimals()));
    }
    protected init() {
        let that = this;
        that._decimals = 0;
    }

    public destroy() {
        let that = this;
        that._parent = null;
    }
    public get value(): number {
        let that = this;
        return that._parent.getPropertyByName(that._propertyName);
    }
    public setValue(value: number): Promise<number> {
        let that = this;
        value = that._round(value);
        return that._parent.setPropertyByName(that._propertyName, value);
    }
    public get decimals(): number {
        let that = this;
        return that._decimals;
    }

    public setDecimals(value: number): Promise<number> {
        let that = this;
        if (that._decimals != value)
            that._decimals = value;
        return Promise.resolve(that._decimals);
    }

}

export class IntegerValue extends BaseNumberValue {
}

export class NumberValue extends BaseNumberValue {
    public get decimals(): number {
        let that = this;
        return that._parent.$states[that._propertyName].decimals;
    }

    public async setDecimals(value: number): Promise<number> {
        let that = this;
        if (that._parent.$states[that._propertyName].decimals != value) {
            that._parent.$states[that._propertyName].decimals = value;
            let val = that.value;
            await that.setValue(val)
        }
        return that._parent.$states[that._propertyName].decimals;
    }
    protected _internalDecimals(): number {
        let that = this;
        return that._parent.$states[that._propertyName].decimals;
    }
}