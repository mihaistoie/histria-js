"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
    _getValue() {
        return __awaiter(this, void 0, void 0, function* () {
            let that = this;
            return Promise.resolve(that._value);
        });
    }
    _setValue(value) {
        return __awaiter(this, void 0, void 0, function* () {
            return Promise.resolve(null);
        });
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
