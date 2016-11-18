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
    private _round(value: number): number {
        let that = this;
        value = value || 0;
        if (typeof value !== 'number')
            throw new ApplicationError(messages.numbers.notANumber);
        if (isNaN(value))
            throw new ApplicationError(messages.numbers.isNan);
        return parseFloat(value.toFixed(that.decimals));
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
    public get decimals(): number {
        let that = this;
        return that._decimals;
    }
    public set decimals(value: number) {
        let that = this;
        that._decimals = value;
    }

}

export class IntegerValue extends BaseNumberValue {
}

export class NumberValue extends BaseNumberValue {
    public get decimals(): number {
        let that = this;
        return that._parent.states[that._propertyName].decimals;
    }
    public set decimals(value: number) {
        let that = this;
        that._parent.states[that._propertyName].decimals = value;
    }

}
