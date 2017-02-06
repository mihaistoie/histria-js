"use strict";
class State {
    init() {
    }
    constructor(parent, propertyName) {
        let that = this;
        that._propertyName = propertyName;
        that._parent = parent;
        that._stateModel = that._parent.modelState(propertyName);
        that.init();
    }
    destroy() {
        let that = this;
        that._parent = null;
        that._stateModel = null;
    }
    get isDisabled() {
        return this._stateModel.isDisabled || false;
    }
    set isDisabled(value) {
        let that = this;
        let oldValue = that._stateModel.isDisabled || false;
        if (value !== oldValue) {
            that._parent.changeState(that._propertyName + '.isDisabled', value, that._stateModel.isDisabled);
            that._stateModel.isDisabled = value;
        }
    }
    get isHidden() {
        return this._stateModel.isHidden || false;
    }
    set isHidden(value) {
        let that = this;
        let oldValue = that._stateModel.isHidden || false;
        if (value !== oldValue) {
            that._parent.changeState(that._propertyName + '.isHidden', value, that._stateModel.isHidden);
            that._stateModel.isHidden = value;
        }
    }
    get isMandatory() {
        return this._stateModel.isMandatory || false;
    }
    set isMandatory(value) {
        let that = this;
        let oldValue = that._stateModel.isMandatory || false;
        if (value !== oldValue) {
            that._parent.changeState(that._propertyName + '.isMandatory', value, that._stateModel.isMandatory);
            that._stateModel.isMandatory = value;
        }
    }
    get isReadOnly() {
        return this._stateModel.isReadOnly || false;
    }
    set isReadOnly(value) {
        let that = this;
        let oldValue = that._stateModel.isReadOnly || false;
        if (value !== oldValue) {
            that._parent.changeState(that._propertyName + '.isReadOnly', value, that._stateModel.isReadOnly);
            that._stateModel.isReadOnly = value;
        }
    }
}
exports.State = State;
class BooleanState extends State {
}
exports.BooleanState = BooleanState;
class IdState extends State {
}
exports.IdState = IdState;
class StringState extends State {
    get maxLength() {
        return this._stateModel.maxLength || 0;
    }
    set maxLength(value) {
        let that = this;
        let oldvalue = that._stateModel.maxLength || 0;
        if (value !== oldvalue) {
            that._parent.changeState(that._propertyName + '.maxLength', value, that._stateModel.maxLength);
            that._stateModel.maxLength = value;
        }
    }
    get minLength() {
        return this._stateModel.minLength || 0;
    }
    set minLength(value) {
        let that = this;
        let oldvalue = that._stateModel.minLength || 0;
        if (value !== oldvalue) {
            that._parent.changeState(that._propertyName + '.minLength', value, that._stateModel.minLength);
            that._stateModel.minLength = value;
        }
    }
}
exports.StringState = StringState;
class NumberBaseState extends State {
    get exclusiveMaximum() {
        return this._stateModel.exclusiveMaximum || false;
    }
    set exclusiveMaximum(value) {
        let that = this;
        let oldValue = that._stateModel.exclusiveMaximum || false;
        if (value !== oldValue) {
            that._parent.changeState(that._propertyName + '.exclusiveMaximum', value, that._stateModel.exclusiveMaximum);
            that._stateModel.exclusiveMaximum = value;
        }
    }
    get exclusiveMinimum() {
        return this._stateModel.exclusiveMinimum || false;
    }
    set exclusiveMinimum(value) {
        let that = this;
        let oldValue = that._stateModel.exclusiveMinimum || false;
        if (value !== oldValue) {
            that._parent.changeState(that._propertyName + '.exclusiveMinimum', value, that._stateModel.exclusiveMinimum);
            that._stateModel.exclusiveMinimum = value;
        }
    }
    get minimum() {
        return this._stateModel.minimum;
    }
    set minimum(value) {
        let that = this;
        if (value !== that._stateModel.minimum) {
            that._parent.changeState(that._propertyName + '.minimum', value, that._stateModel.minimum);
            that._stateModel.minimum = value;
        }
    }
    get maximum() {
        return this._stateModel.maximum;
    }
    set maximum(value) {
        let that = this;
        if (value !== that._stateModel.maximum) {
            that._parent.changeState(that._propertyName + '.maximum', value, that._stateModel.maximum);
            that._stateModel.maximum = value;
        }
    }
}
exports.NumberBaseState = NumberBaseState;
class NumberState extends NumberBaseState {
    get decimals() {
        return this._stateModel.decimals || 0;
    }
    set decimals(value) {
        let that = this;
        let oldValue = that._stateModel.decimals || 0;
        if (value !== oldValue) {
            that._parent.changeState(that._propertyName + '.decimals', value, that._stateModel.decimals);
            that._stateModel.decimals = value;
        }
    }
}
exports.NumberState = NumberState;
class IntegerState extends NumberBaseState {
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