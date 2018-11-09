"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const histria_utils_1 = require("histria-utils");
class BaseNumberValue {
    constructor(parent, propertyName) {
        this._parent = parent;
        this._propertyName = propertyName;
        this.init();
    }
    destroy() {
        this._parent = null;
    }
    get value() {
        return this._parent.getPropertyByName(this._propertyName);
    }
    setValue(value) {
        value = this._round(value);
        return this._parent.setPropertyByName(this._propertyName, value);
    }
    get decimals() {
        return this._decimals;
    }
    setDecimals(value) {
        if (this._decimals !== value)
            this._decimals = value;
        return Promise.resolve(this._decimals);
    }
    init() {
        this._decimals = 0;
    }
    _internalDecimals() {
        return this._decimals;
    }
    _round(value) {
        value = value || 0;
        if (typeof value !== 'number')
            throw new histria_utils_1.ApplicationError(histria_utils_1.messages(this._parent.context.lang).numbers.notANumber);
        if (isNaN(value))
            throw new histria_utils_1.ApplicationError(histria_utils_1.messages(this._parent.context.lang).numbers.isNan);
        return parseFloat(value.toFixed(this._internalDecimals()));
    }
}
exports.BaseNumberValue = BaseNumberValue;
class IntegerValue extends BaseNumberValue {
}
exports.IntegerValue = IntegerValue;
class NumberValue extends BaseNumberValue {
    get decimals() {
        const state = this._state();
        return state.decimals;
    }
    async setDecimals(value) {
        const state = this._state();
        if (state.decimals !== value) {
            state.decimals = value;
            const val = this.value;
            await this.setValue(val);
        }
        return state.decimals;
    }
    _internalDecimals() {
        const state = this._state();
        return state.decimals;
    }
    _state() {
        const parentStates = this._parent.$states;
        return parentStates[this._propertyName];
    }
}
exports.NumberValue = NumberValue;

//# sourceMappingURL=number.js.map
