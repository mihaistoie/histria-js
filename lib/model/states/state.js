"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const histria_utils_1 = require("histria-utils");
class State {
    constructor(parent, propertyName) {
        this._propertyName = propertyName;
        this._parent = parent;
        this._stateModel = this._parent.modelState(propertyName);
        this.init();
    }
    // tslint:disable-next-line:no-empty
    serialize() {
        if (!Object.keys(this._stateModel).length)
            return null;
        return histria_utils_1.helper.clone(this._stateModel);
    }
    destroy() {
        this._parent = null;
        this._stateModel = null;
    }
    get isDisabled() {
        return this._stateModel.isDisabled || false;
    }
    set isDisabled(value) {
        const oldValue = this._stateModel.isDisabled || false;
        if (value !== oldValue) {
            this._parent.changeState(this._propertyName + '.isDisabled', value, this._stateModel.isDisabled);
            this._stateModel.isDisabled = value;
        }
    }
    get isHidden() {
        return this._stateModel.isHidden || false;
    }
    set isHidden(value) {
        const oldValue = this._stateModel.isHidden || false;
        if (value !== oldValue) {
            this._parent.changeState(this._propertyName + '.isHidden', value, this._stateModel.isHidden);
            this._stateModel.isHidden = value;
        }
    }
    get isMandatory() {
        return this._stateModel.isMandatory || false;
    }
    set isMandatory(value) {
        const oldValue = this._stateModel.isMandatory || false;
        if (value !== oldValue) {
            this._parent.changeState(this._propertyName + '.isMandatory', value, this._stateModel.isMandatory);
            this._stateModel.isMandatory = value;
        }
    }
    get isReadOnly() {
        return this._stateModel.isReadOnly || false;
    }
    set isReadOnly(value) {
        const oldValue = this._stateModel.isReadOnly || false;
        if (value !== oldValue) {
            this._parent.changeState(this._propertyName + '.isReadOnly', value, this._stateModel.isReadOnly);
            this._stateModel.isReadOnly = value;
        }
    }
    // tslint:disable-next-line:no-empty
    init() { }
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
        const oldvalue = this._stateModel.maxLength || 0;
        if (value !== oldvalue) {
            this._parent.changeState(this._propertyName + '.maxLength', value, this._stateModel.maxLength);
            this._stateModel.maxLength = value;
        }
    }
    get minLength() {
        return this._stateModel.minLength || 0;
    }
    set minLength(value) {
        const oldvalue = this._stateModel.minLength || 0;
        if (value !== oldvalue) {
            this._parent.changeState(this._propertyName + '.minLength', value, this._stateModel.minLength);
            this._stateModel.minLength = value;
        }
    }
}
exports.StringState = StringState;
class NumberBaseState extends State {
    get exclusiveMaximum() {
        return this._stateModel.exclusiveMaximum || false;
    }
    set exclusiveMaximum(value) {
        const oldValue = this._stateModel.exclusiveMaximum || false;
        if (value !== oldValue) {
            this._parent.changeState(this._propertyName + '.exclusiveMaximum', value, this._stateModel.exclusiveMaximum);
            this._stateModel.exclusiveMaximum = value;
        }
    }
    get exclusiveMinimum() {
        return this._stateModel.exclusiveMinimum || false;
    }
    set exclusiveMinimum(value) {
        const oldValue = this._stateModel.exclusiveMinimum || false;
        if (value !== oldValue) {
            this._parent.changeState(this._propertyName + '.exclusiveMinimum', value, this._stateModel.exclusiveMinimum);
            this._stateModel.exclusiveMinimum = value;
        }
    }
    get minimum() {
        return this._stateModel.minimum;
    }
    set minimum(value) {
        if (value !== this._stateModel.minimum) {
            this._parent.changeState(this._propertyName + '.minimum', value, this._stateModel.minimum);
            this._stateModel.minimum = value;
        }
    }
    get maximum() {
        return this._stateModel.maximum;
    }
    set maximum(value) {
        if (value !== this._stateModel.maximum) {
            this._parent.changeState(this._propertyName + '.maximum', value, this._stateModel.maximum);
            this._stateModel.maximum = value;
        }
    }
}
exports.NumberBaseState = NumberBaseState;
class NumberState extends NumberBaseState {
    get decimals() {
        return this._stateModel.decimals || 0;
    }
    set decimals(value) {
        const oldValue = this._stateModel.decimals || 0;
        if (value !== oldValue) {
            this._parent.changeState(this._propertyName + '.decimals', value, this._stateModel.decimals);
            this._stateModel.decimals = value;
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

//# sourceMappingURL=state.js.map
