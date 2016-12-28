"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
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
    value(value) {
        return __awaiter(this, void 0, void 0, function* () {
            let that = this;
            if (value === undefined)
                return that._getValue();
            else
                return that._setValue(value);
        });
    }
    destroy() {
        let that = this;
        that._relation = null;
        that._parent = null;
    }
    _getValue() {
        return __awaiter(this, void 0, void 0, function* () {
            let that = this;
            if (that._value !== undefined)
                return that._value;
            yield that._lazyLoad();
            return that._value;
        });
    }
    _setValue(value) {
        return __awaiter(this, void 0, void 0, function* () {
            let that = this;
            value = value || null;
            let oldValue = that._getValue();
            if (that._value === value)
                return that._value;
            if (that._value) {
            }
            console.log(that._parent.changeProperty);
            that._parent.changeProperty(that._propertyName, oldValue, that._value, function () {
                that._value = value;
                that._updateParentRefs();
            });
            return that._value;
        });
    }
    _lazyLoad() {
        return __awaiter(this, void 0, void 0, function* () {
            let that = this;
            //Todo load from db        
            that._value = null;
        });
    }
    _updateParentRefs() {
        let that = this;
        let model = that._parent.model();
        that._relation.localFields(field => {
            if (that._value)
                model[field] = that._value[field];
            else
                delete model[field];
        });
    }
}
exports.BaseHasOne = BaseHasOne;
class HasOneRef extends BaseHasOne {
    constructor(parent, propertyName, relation) {
        super(parent, propertyName, relation);
    }
}
exports.HasOneRef = HasOneRef;
