"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const interfaces_1 = require("../interfaces");
class ErrorState {
    constructor(parent, propertyName) {
        let that = this;
        that._propertyName = propertyName;
        that._parent = parent;
        that._errorModel = that._parent.modelErrors(propertyName);
    }
    _getLastMessage(severity) {
        // return last error
        let that = this;
        for (let i = that._errorModel.length - 1; i >= 0; i--) {
            let item = that._errorModel[i];
            if (item.severity === severity) {
                return item.message;
            }
        }
        return '';
    }
    _hasMessages(severity) {
        // return last error
        let that = this;
        for (let i = that._errorModel.length - 1; i >= 0; i--) {
            if (that._errorModel[i].severity === severity) {
                return true;
            }
        }
        return false;
    }
    _setMessage(severity, value) {
        let that = this;
        if (value)
            // add
            that._errorModel.push({ message: value, severity: severity });
        else
            // clear
            that._errorModel = that._errorModel.filter(item => item.severity !== severity);
    }
    get error() {
        return this._getLastMessage(interfaces_1.MessageServerity.error);
    }
    set error(value) {
        this._setMessage(interfaces_1.MessageServerity.error, value);
    }
    hasErrors() {
        return this._hasMessages(interfaces_1.MessageServerity.error);
    }
    addException(e) {
        this.error = e.message;
    }
    destroy() {
        let that = this;
        that._parent = null;
        that._errorModel = null;
    }
}
exports.ErrorState = ErrorState;
