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
    get isDisabled() {
        return this._stateModel.isDisabled;
    }
    set isDisabled(value: boolean) {
        let that = this;
        if (value !== that._stateModel.isDisabled) {
            that._parent.stateChanged(that._propertyName + '.isDisabled', value, that._stateModel.isDisabled)
            that._stateModel.isDisabled = value;
        }
    }
    get isHidden() {
        return this._stateModel.isHidden;
    }
    set isHidden(value: boolean) {
        let that = this;
        if (value !== that._stateModel.isHidden) {
            that._parent.stateChanged(that._propertyName + '.isHidden', value, that._stateModel.isHidden)
            that._stateModel.isHidden = value;
        }
    }
    get isMandatory() {
        return this._stateModel.isMandatory;
    }
    set isMandatory(value: boolean) {
        let that = this;
        if (value !== that._stateModel.isMandatory) {
            that._parent.stateChanged(that._propertyName + '.isMandatory', value, that._stateModel.isMandatory)
            that._stateModel.isMandatory = value;
        }
    }
    get isReadOnly() {
        return this._stateModel.isReadOnly;
    }
    set isReadOnly(value: boolean) {
        let that = this;
        if (value !== that._stateModel.isReadOnly) {
            that._parent.stateChanged(that._propertyName + '.isReadOnly', value, that._stateModel.isReadOnly)
            that._stateModel.isReadOnly = value;
        }
    }

}

export class StringState extends State {
}

export class NumberState extends State {
}

export class IntegerState extends State {
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