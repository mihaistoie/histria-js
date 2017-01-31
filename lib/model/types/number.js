"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const histria_utils_1 = require("histria-utils");
class BaseNumberValue {
    constructor(parent, propertyName) {
        let that = this;
        that._parent = parent;
        that._propertyName = propertyName;
        that.init();
    }
    _internalDecimals() {
        return this._decimals;
    }
    _round(value) {
        let that = this;
        value = value || 0;
        if (typeof value !== 'number')
            throw new histria_utils_1.ApplicationError(histria_utils_1.messages(that._parent.context.lang).numbers.notANumber);
        if (isNaN(value))
            throw new histria_utils_1.ApplicationError(histria_utils_1.messages(that._parent.context.lang).numbers.isNan);
        return parseFloat(value.toFixed(that._internalDecimals()));
    }
    init() {
        let that = this;
        that._decimals = 0;
    }
    destroy() {
        let that = this;
        that._parent = null;
    }
    get value() {
        let that = this;
        return that._parent.getPropertyByName(that._propertyName);
    }
    setValue(value) {
        let that = this;
        value = that._round(value);
        return that._parent.setPropertyByName(that._propertyName, value);
    }
    get decimals() {
        let that = this;
        return that._decimals;
    }
    setDecimals(value) {
        let that = this;
        if (that._decimals != value)
            that._decimals = value;
        return Promise.resolve(that._decimals);
    }
}
exports.BaseNumberValue = BaseNumberValue;
class IntegerValue extends BaseNumberValue {
}
exports.IntegerValue = IntegerValue;
class NumberValue extends BaseNumberValue {
    _state() {
        let that = this;
        let parentStates = that._parent.$states;
        return parentStates[that._propertyName];
    }
    get decimals() {
        let state = this._state();
        return state.decimals;
    }
    setDecimals(value) {
        return __awaiter(this, void 0, void 0, function* () {
            let that = this;
            let state = that._state();
            if (state.decimals != value) {
                state.decimals = value;
                let val = that.value;
                yield that.setValue(val);
            }
            return state.decimals;
        });
    }
    _internalDecimals() {
        let state = this._state();
        return state.decimals;
    }
}
exports.NumberValue = NumberValue;
