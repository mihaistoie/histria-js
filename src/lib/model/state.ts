import { ObservableObject } from './instance';
export class State {
    protected _parent: ObservableObject;
    protected _propertyName: string;
    protected _stateModel: any;
    protected init() {
        let that = this;
        that._stateModel.isDisabled = that._stateModel.isDisabled || false;
        that._stateModel.isHidden = that._stateModel.isHidden || false;
        that._stateModel.isMandatory = that._stateModel.isMandatory || false;
        that._stateModel.isReadOnly = that._stateModel.isReadOnly || false;
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
        return this._stateModel.isDisabled;
    }
    public set isDisabled(value: boolean) {
        let that = this;
        if (value !== that._stateModel.isDisabled) {
            that._parent.stateChanged(that._propertyName + '.isDisabled', value, that._stateModel.isDisabled);
            that._stateModel.isDisabled = value;
        }
    }
    public get isHidden(): boolean {
        return this._stateModel.isHidden;
    }
    public set isHidden(value: boolean) {
        let that = this;
        if (value !== that._stateModel.isHidden) {
            that._parent.stateChanged(that._propertyName + '.isHidden', value, that._stateModel.isHidden);
            that._stateModel.isHidden = value;
        }
    }
    public get isMandatory(): boolean {
        return this._stateModel.isMandatory;
    }
    public set isMandatory(value: boolean) {
        let that = this;
        if (value !== that._stateModel.isMandatory) {
            that._parent.stateChanged(that._propertyName + '.isMandatory', value, that._stateModel.isMandatory);
            that._stateModel.isMandatory = value;
        }
    }
    public get isReadOnly(): boolean {
        return this._stateModel.isReadOnly;
    }
    public set isReadOnly(value: boolean) {
        let that = this;
        if (value !== that._stateModel.isReadOnly) {
            that._parent.stateChanged(that._propertyName + '.isReadOnly', value, that._stateModel.isReadOnly);
            that._stateModel.isReadOnly = value;
        }
    }

}

export class StringState extends State {
    protected init() {
        super.init();
        let that = this;
        that._stateModel.maxLength = that._stateModel.maxLength || 0;
        that._stateModel.minLength = that._stateModel.minLength || 0;

    }
    public get maxLength(): number {
        return this._stateModel.maxLength;
    }
    public set maxLength(value: number) {
        let that = this;
        if (value !== that._stateModel.maxLength) {
            that._parent.stateChanged(that._propertyName + '.maxLength', value, that._stateModel.maxLength)
            that._stateModel.maxLength = value;
        }
    }
    public get minLength(): number {
        return this._stateModel.minLength;
    }
    public set minLength(value: number) {
        let that = this;
        if (value !== that._stateModel.minLength) {
            that._parent.stateChanged(that._propertyName + '.minLength', value, that._stateModel.minLength)
            that._stateModel.minLength = value;
        }
    }

}


export class NumberBaseState extends State {
    protected init() {
        super.init();
        let that = this;
        that._stateModel.exclusiveMaximum = that._stateModel.exclusiveMaximum;
        that._stateModel.exclusiveMinimum = that._stateModel.exclusiveMinimum;
        that._stateModel.minimum = that._stateModel.minimum;
        that._stateModel.maximum = that._stateModel.maximum;
    }

    public get exclusiveMaximum(): boolean {
        return this._stateModel.exclusiveMaximum;
    }
    public set exclusiveMaximum(value: boolean) {
        let that = this;
        if (value !== that._stateModel.exclusiveMaximum) {
            that._parent.stateChanged(that._propertyName + '.exclusiveMaximum', value, that._stateModel.exclusiveMaximum)
            that._stateModel.exclusiveMaximum = value;
        }
    }

    public get exclusiveMinimum(): boolean {
        return this._stateModel.exclusiveMinimum;
    }
    public set exclusiveMinimum(value: boolean) {
        let that = this;
        if (value !== that._stateModel.exclusiveMinimum) {
            that._parent.stateChanged(that._propertyName + '.exclusiveMinimum', value, that._stateModel.exclusiveMinimum)
            that._stateModel.exclusiveMinimum = value;
        }
    }

    public get minimum(): number {
        return this._stateModel.minimum;
    }
    public set minimum(value: number) {
        let that = this;
        if (value !== that._stateModel.minimum) {
            that._parent.stateChanged(that._propertyName + '.minimum', value, that._stateModel.minimum)
            that._stateModel.minimum = value;
        }
    }
    
    public get maximum(): number {
        return this._stateModel.maximum;
    }
    public set maximum(value: number) {
        let that = this;
        if (value !== that._stateModel.maximum) {
            that._parent.stateChanged(that._propertyName + '.maximum', value, that._stateModel.maximum)
            that._stateModel.maximum = value;
        }
    }
}


export class NumberState extends NumberBaseState {
    protected init() {
        super.init();
        let that = this;
        that._stateModel.decimals = that._stateModel.decimals || 0;
    }
    public get decimals(): number {
        return this._stateModel.decimals;
    }
    public set decimals(value: number) {
        let that = this;
        if (value !== that._stateModel.decimals) {
            that._parent.stateChanged(that._propertyName + '.decimals', value, that._stateModel.decimals)
            that._stateModel.decimals = value;
        }
    }
}

export class IntegerState extends NumberBaseState {
    protected init() {
        super.init();
        let that = this;
        that._stateModel.decimals = that._stateModel.decimals || 0;
    }
    
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