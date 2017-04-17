"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const model_manager_1 = require("../model-manager");
class Role {
    constructor(parent, propertyName, relation) {
        let that = this;
        that._propertyName = propertyName;
        that._relation = relation;
        that._parent = parent;
        that._refClass = model_manager_1.modelManager().classByName(that._relation.model, that._relation.nameSpace);
    }
    internalSetValue(value) {
        this._value = value;
    }
    getValue() {
        return this._getValue();
    }
    setValue(value) {
        return this._setValue(value);
    }
    async _getValue() {
        let that = this;
        return Promise.resolve(that._value);
    }
    async _setValue(value) {
        return Promise.resolve(null);
    }
    _checkValueBeforeSet(value) {
    }
    destroy() {
        let that = this;
        that._relation = null;
        that._parent = null;
        that._refClass = null;
        that._value = null;
    }
}
exports.Role = Role;
