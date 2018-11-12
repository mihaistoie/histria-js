"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const model_manager_1 = require("../model-manager");
class RoleBase {
    constructor(parent, propertyName, relation) {
        this._propertyName = propertyName;
        this._relation = relation;
        this._parent = parent;
        this._refClass = model_manager_1.modelManager().classByName(this._relation.model, this._relation.nameSpace);
    }
    destroy() {
        this._relation = null;
        this._parent = null;
        this._refClass = null;
    }
    get refIsPersistent() {
        return this._refClass.isPersistent;
    }
}
exports.RoleBase = RoleBase;
class Role extends RoleBase {
    internalSetValue(value) {
        this._value = value;
    }
    getValue() {
        return this._getValue();
    }
    setValue(value) {
        return this._setValue(value);
    }
    destroy() {
        this._value = null;
        super.destroy();
    }
    async _getValue() {
        return Promise.resolve(this._value);
    }
    async _setValue(value) {
        return Promise.resolve();
    }
    // tslint:disable-next-line:no-empty
    _checkValueBeforeSet(value) {
    }
}
exports.Role = Role;

//# sourceMappingURL=role.js.map
