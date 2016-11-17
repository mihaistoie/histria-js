import { Instance } from './base-object';

export class BaseNumberValue {
    private _parent: Instance;
    private _decimals: number;
    private _propertyName: string;
    constructor(parent: Instance, propertyName: string) {
        let that = this;
        that._parent = parent;
        that._propertyName = propertyName;
        that.init();
    }
    protected init() {
        let that = this;
        that._decimals = 0;
    }

    public destroy() {
        let that = this;
        that._parent = null;
    }

    public value(value: number): Promise<number> {
        let that = this;
        if (value !== undefined) {
            //
        }
        return that._parent.getOrSetProperty(that._propertyName, value);
    }

}

export class IntegerValue extends BaseNumberValue {
}

export class NumberValue extends BaseNumberValue {
}
