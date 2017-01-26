import { ObservableObject } from './interfaces';
export class State {
    protected _parent: ObservableObject;
    protected _propertyName: string;
    protected _stateModel: any;
    protected init() {
    }

    constructor(parent: ObservableObject, propertyName: string) {
        let that = this;
        that._propertyName = propertyName;
        that._parent = parent;
        that._stateModel = that._parent.modelState(propertyName);
        that.init();

    }
    public destroy() {
        let that = this;
        that._parent = null;
        that._stateModel = null;

    }
    public get isDisabled(): boolean {
        return this._stateModel.isDisabled || false;
    }
    public set isDisabled(value: boolean) {
        let that = this;
        let oldValue = that._stateModel.isDisabled || false;
        if (value !== oldValue) {
            that._parent.changeState(that._propertyName + '.isDisabled', value, that._stateModel.isDisabled);
            that._stateModel.isDisabled = value;
        }
    }
    public get isHidden(): boolean {
        return this._stateModel.isHidden || false;
    }
    public set isHidden(value: boolean) {
        let that = this;
        let oldValue = that._stateModel.isHidden || false;
        if (value !== oldValue) {
            that._parent.changeState(that._propertyName + '.isHidden', value, that._stateModel.isHidden);
            that._stateModel.isHidden = value;
        }
    }
    public get isMandatory(): boolean {
        return this._stateModel.isMandatory || false;
    }
    public set isMandatory(value: boolean) {
        let that = this;
        let oldValue = that._stateModel.isMandatory || false;
        if (value !== oldValue) {
            that._parent.changeState(that._propertyName + '.isMandatory', value, that._stateModel.isMandatory);
            that._stateModel.isMandatory = value;
        }
    }
    public get isReadOnly(): boolean {
        return this._stateModel.isReadOnly || false;
    }
    public set isReadOnly(value: boolean) {
        let that = this;
        let oldValue = that._stateModel.isReadOnly || false;
        if (value !== oldValue) {
            that._parent.changeState(that._propertyName + '.isReadOnly', value, that._stateModel.isReadOnly);
            that._stateModel.isReadOnly = value;
        }
    }

}


export class BooleanState extends State {

}
export class IdState extends State {

}

export class StringState extends State {
    public get maxLength(): number {
        return this._stateModel.maxLength || 0;
    }
    public set maxLength(value: number) {
        let that = this;
        let oldvalue = that._stateModel.maxLength || 0;
        if (value !== oldvalue) {
            that._parent.changeState(that._propertyName + '.maxLength', value, that._stateModel.maxLength)
            that._stateModel.maxLength = value;
        }
    }
    public get minLength(): number {
        return this._stateModel.minLength || 0;
    }
    public set minLength(value: number) {
        let that = this;
        let oldvalue = that._stateModel.minLength || 0;
        if (value !== oldvalue) {
            that._parent.changeState(that._propertyName + '.minLength', value, that._stateModel.minLength)
            that._stateModel.minLength = value;
        }
    }

}


export class NumberBaseState extends State {

    public get exclusiveMaximum(): boolean {
        return this._stateModel.exclusiveMaximum || false;
    }
    public set exclusiveMaximum(value: boolean) {
        let that = this;
        let oldValue = that._stateModel.exclusiveMaximum || false;
        if (value !== oldValue) {
            that._parent.changeState(that._propertyName + '.exclusiveMaximum', value, that._stateModel.exclusiveMaximum)
            that._stateModel.exclusiveMaximum = value;
        }
    }

    public get exclusiveMinimum(): boolean {
        return this._stateModel.exclusiveMinimum || false;
    }
    public set exclusiveMinimum(value: boolean) {
        let that = this;
        let oldValue = that._stateModel.exclusiveMinimum || false;
        if (value !== oldValue) {
            that._parent.changeState(that._propertyName + '.exclusiveMinimum', value, that._stateModel.exclusiveMinimum)
            that._stateModel.exclusiveMinimum = value;
        }
    }

    public get minimum(): number {
        return this._stateModel.minimum;
    }
    public set minimum(value: number) {
        let that = this;
        if (value !== that._stateModel.minimum) {
            that._parent.changeState(that._propertyName + '.minimum', value, that._stateModel.minimum)
            that._stateModel.minimum = value;
        }
    }

    public get maximum(): number {
        return this._stateModel.maximum;
    }
    public set maximum(value: number) {
        let that = this;
        if (value !== that._stateModel.maximum) {
            that._parent.changeState(that._propertyName + '.maximum', value, that._stateModel.maximum)
            that._stateModel.maximum = value;
        }
    }
}


export class NumberState extends NumberBaseState {
    public get decimals(): number {
        return this._stateModel.decimals || 0;
    }
    public set decimals(value: number) {
        let that = this;
        let oldValue = that._stateModel.decimals || 0;
        if (value !== oldValue) {
            that._parent.changeState(that._propertyName + '.decimals', value, that._stateModel.decimals)
            that._stateModel.decimals = value;
        }
    }
}

export class IntegerState extends NumberBaseState {
}

export class DateState extends State {
}

export class DateTimeState extends State {
}

export class EnumState extends State {
}

export class ArrayState extends State {
}

export class RefObjectState extends State {
}

export class RefArrayState extends State {
}