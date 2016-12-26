"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
class BaseHasOne {
    constructor(parent, propertyName, relation) {
        let that = this;
        that._propertyName = propertyName;
        that._relation = relation;
        that._parent = parent;
    }
    _lazyLoad() {
        return __awaiter(this, void 0, void 0, function* () {
            let that = this;
            that._value = null;
        });
    }
    _updateParentRefs() {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    getValue() {
        return __awaiter(this, void 0, void 0, function* () {
            let that = this;
            if (that._value !== undefined)
                return that._value;
            yield that._lazyLoad();
            return that._value;
        });
    }
    setValue(value) {
        return __awaiter(this, void 0, void 0, function* () {
            let that = this;
            let oldValue = that.getValue();
            if (that._value === value)
                return;
            if (that._value) {
            }
            that._parent.changeProperty(that._propertyName, oldValue, that._value, function () {
                that._value = value;
                that._updateParentRefs();
            });
        });
    }
    destroy() {
        let that = this;
        that._relation = null;
        that._parent = null;
    }
}
