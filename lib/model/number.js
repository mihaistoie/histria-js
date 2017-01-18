"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const errors_1 = require("../utils/errors");
const messages_1 = require("../locale/messages");
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
            throw new errors_1.ApplicationError(messages_1.messages(that._parent.context.lang).numbers.notANumber);
        if (isNaN(value))
            throw new errors_1.ApplicationError(messages_1.messages(that._parent.context.lang).numbers.isNan);
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
    value(value) {
        return __awaiter(this, void 0, void 0, function* () {
            let that = this;
            if (value !== undefined) {
                value = that._round(value);
            }
            return that._parent.getOrSetProperty(that._propertyName, value);
        });
    }
    getValue() {
        let that = this;
        return that._parent.getPropertyByName(that._propertyName);
    }
    setValue(value) {
        let that = this;
        value = that._round(value);
        return that._parent.setPropertyByName(that._propertyName, value);
    }
    decimals(value) {
        return __awaiter(this, void 0, void 0, function* () {
            let that = this;
            if (value !== undefined) {
                if (that._decimals != value) {
                    that._decimals = value;
                }
            }
            return that._decimals;
        });
    }
}
exports.BaseNumberValue = BaseNumberValue;
class IntegerValue extends BaseNumberValue {
}
exports.IntegerValue = IntegerValue;
class NumberValue extends BaseNumberValue {
    decimals(value) {
        return __awaiter(this, void 0, void 0, function* () {
            let that = this;
            if (value !== undefined) {
                if (that._parent.$states[that._propertyName].decimals != value) {
                    that._parent.$states[that._propertyName].decimals = value;
                    let val = yield that.value();
                    yield that.value(val);
                }
            }
            return that._parent.$states[that._propertyName].decimals;
        });
    }
    _internalDecimals() {
        let that = this;
        return that._parent.$states[that._propertyName].decimals;
    }
}
exports.NumberValue = NumberValue;
