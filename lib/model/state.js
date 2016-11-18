"use strict";
class State {
    constructor(parent, propertyName) {
        let that = this;
        that._propertyName = propertyName;
        that._parent = parent;
        that._stateModel = that._parent.modelState(propertyName);
        that.init();
    }
    init() {
        let that = this;
        that._stateModel.isDisabled = that._stateModel.isDisabled || false;
        that._stateModel.isHidden = that._stateModel.isHidden || false;
        that._stateModel.isMandatory = that._stateModel.isMandatory || false;
        that._stateModel.isReadOnly = that._stateModel.isReadOnly || false;
    }
    destroy() {
        let that = this;
        that._parent = null;
        that._stateModel = null;
    }
    get isDisabled() {
        return this._stateModel.isDisabled;
    }
    set isDisabled(value) {
        let that = this;
        if (value !== that._stateModel.isDisabled) {
            that._parent.stateChanged(that._propertyName + '.isDisabled', value, that._stateModel.isDisabled);
            that._stateModel.isDisabled = value;
        }
    }
    get isHidden() {
        return this._stateModel.isHidden;
    }
    set isHidden(value) {
        let that = this;
        if (value !== that._stateModel.isHidden) {
            that._parent.stateChanged(that._propertyName + '.isHidden', value, that._stateModel.isHidden);
            that._stateModel.isHidden = value;
        }
    }
    get isMandatory() {
        return this._stateModel.isMandatory;
    }
    set isMandatory(value) {
        let that = this;
        if (value !== that._stateModel.isMandatory) {
            that._parent.stateChanged(that._propertyName + '.isMandatory', value, that._stateModel.isMandatory);
            that._stateModel.isMandatory = value;
        }
    }
    get isReadOnly() {
        return this._stateModel.isReadOnly;
    }
    set isReadOnly(value) {
        let that = this;
        if (value !== that._stateModel.isReadOnly) {
            that._parent.stateChanged(that._propertyName + '.isReadOnly', value, that._stateModel.isReadOnly);
            that._stateModel.isReadOnly = value;
        }
    }
}
exports.State = State;
class StringState extends State {
}
exports.StringState = StringState;
class NumberState extends State {
    init() {
        super.init();
        let that = this;
        that._stateModel.decimals = that._stateModel.decimals || 0;
    }
    get decimals() {
        return this._stateModel.decimals;
    }
    set decimals(value) {
        let that = this;
        if (value !== that._stateModel.decimals) {
            that._parent.stateChanged(that._propertyName + '.decimals', value, that._stateModel.decimals);
            that._stateModel.decimals = value;
        }
    }
}
exports.NumberState = NumberState;
class IntegerState extends State {
}
exports.IntegerState = IntegerState;
class DateState extends State {
}
exports.DateState = DateState;
class DateTimeState extends State {
}
exports.DateTimeState = DateTimeState;
class EnumState extends State {
}
exports.EnumState = EnumState;
class ArrayState extends State {
}
exports.ArrayState = ArrayState;
class RefObjectState extends State {
}
exports.RefObjectState = RefObjectState;
class RefArrayState extends State {
}
exports.RefArrayState = RefArrayState;
