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

    public async value(value?: number): Promise<number> {
        let that = this;
        if (value !== undefined) {
            value = that._round(value);
        }
        return that._parent.getOrSetProperty(that._propertyName, value);
    }
    public getValue(): number {
        let that = this;
        return that._parent.getPropertyByName(that._propertyName);
    }
    public setValue(value: number): Promise<number> {
        let that = this;
        value = that._round(value);
        return that._parent.setPropertyByName(that._propertyName, value);
    }

    public async decimals(value: number): Promise<number> {
        let that = this;
        if (value !== undefined) {
            if (that._decimals != value) {
                that._decimals = value;
            }
        }
        return that._decimals;
    }

}

export class IntegerValue extends BaseNumberValue {
}

export class NumberValue extends BaseNumberValue {
    public async decimals(value: number): Promise<number> {
        let that = this;
        if (value !== undefined) {
            if (that._parent.$states[that._propertyName].decimals != value) {
                that._parent.$states[that._propertyName].decimals = value;
                let val = await that.value();
                await that.value(val)
            }
        }
        return that._parent.$states[that._propertyName].decimals;
    }
    protected _internalDecimals(): number {
        let that = this;
        return that._parent.$states[that._propertyName].decimals;
    }
}
