"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const interfaces_1 = require("../interfaces");
class ErrorState {
    get error() {
        return this._getLastMessage(interfaces_1.MessageServerity.error);
    }
    set error(value) {
        this._setMessage(interfaces_1.MessageServerity.error, value);
    }
    constructor(parent, propertyName) {
        this._propertyName = propertyName;
        this._parent = parent;
        this._errorModel = this._parent.modelErrors(propertyName);
    }
    hasErrors() {
        return this._hasMessages(interfaces_1.MessageServerity.error);
    }
    addException(e) {
        this.error = e.message;
    }
    destroy() {
        this._parent = null;
        this._errorModel = null;
    }
    _getLastMessage(severity) {
        // return last error
        for (let i = this._errorModel.length - 1; i >= 0; i--) {
            const item = this._errorModel[i];
            if (item.severity === severity) {
                return item.message;
            }
        }
        return '';
    }
    _hasMessages(severity) {
        for (let i = this._errorModel.length - 1; i >= 0; i--) {
            if (this._errorModel[i].severity === severity) {
                return true;
            }
        }
        return false;
    }
    _setMessage(severity, value) {
        if (value)
            // add
            this._errorModel.push({ message: value, severity: severity });
        else
            // clear
            this._errorModel = this._errorModel.filter(item => item.severity !== severity);
    }
}
exports.ErrorState = ErrorState;

//# sourceMappingURL=error-state.js.map
