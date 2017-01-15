"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const role_1 = require("./role");
const schema_utils_1 = require("../schema/schema-utils");
const schema_consts_1 = require("../schema/schema-consts");
class HasOne extends role_1.Role {
    constructor(parent, propertyName, relation) {
        super(parent, propertyName, relation);
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
    _lazyLoad() {
        return __awaiter(this, void 0, void 0, function* () {
            this._value = null;
            return Promise.resolve();
        });
    }
    _updateParentRefs() {
        let that = this;
        let pmodel = that._parent.model();
        let nmodel = that._value ? that._value.model() : null;
        that._relation.localFields.forEach((field, index) => {
            let ff = that._relation.foreignFields[index];
            if (that._value)
                pmodel[field] = nmodel[ff];
            else
                delete pmodel[field];
        });
    }
}
exports.HasOne = HasOne;
class HasOneRef extends HasOne {
    constructor(parent, propertyName, relation) {
        super(parent, propertyName, relation);
    }
    _lazyLoad() {
        return __awaiter(this, void 0, void 0, function* () {
            let that = this;
            let lmodel = that._parent.model();
            let query = {}, valueIsNull = false;
            that._relation.foreignFields.forEach((field, index) => {
                let ff = that._relation.localFields[index];
                let value = lmodel[ff];
                if (value === null || value === '' || value === undefined)
                    valueIsNull = true;
                else
                    query[field] = value;
            });
            if (valueIsNull)
                that._value = null;
            else
                that._value = (yield that._parent.transaction.findOne(query, that._refClass)) || null;
        });
    }
    _setValue(value) {
        return __awaiter(this, void 0, void 0, function* () {
            let that = this;
            value = value || null;
            let oldValue = yield that._getValue();
            if (that._value === value)
                return that._value;
            yield that._parent.changeProperty(that._propertyName, oldValue, that._value, function () {
                that._value = value;
                let lmodel = that._parent.model();
                let fmodel = that._value ? that._value.model() : null;
                schema_utils_1.updateRoleRefs(that._relation, lmodel, fmodel, false);
            });
            return that._value;
        });
    }
}
exports.HasOneRef = HasOneRef;
class HasOneAC extends HasOne {
    _setValue(value) {
        return __awaiter(this, void 0, void 0, function* () {
            let that = this;
            value = value || null;
            let oldValue = yield that._getValue();
            if (that._value === value)
                return that._value;
            let newValue = value;
            yield that._parent.changeProperty(that._propertyName, oldValue, that._value, function () {
                that._value = value;
                if (that._relation.invRel) {
                    let fmodel = that._parent.model(), lmodel;
                    if (oldValue) {
                        lmodel = oldValue.model();
                        schema_utils_1.updateRoleRefs(that._relation, lmodel, null, true);
                    }
                    if (that._value) {
                        lmodel = that._value.model();
                        schema_utils_1.updateRoleRefs(that._relation, lmodel, fmodel, true);
                    }
                }
            });
            yield that._afterSetValue(newValue, oldValue);
            return that._value;
        });
    }
    _lazyLoad() {
        return __awaiter(this, void 0, void 0, function* () {
            let that = this;
            let lmodel = that._parent.model();
            let query = {}, valueIsNull = false;
            that._relation.localFields.forEach((field, index) => {
                let ff = that._relation.foreignFields[index];
                let value = lmodel[field];
                if (value === null || value === '' || value === undefined)
                    valueIsNull = true;
                else
                    query[ff] = value;
            });
            if (valueIsNull)
                that._value = null;
            else {
                that._value = yield that._parent.transaction.findOne(query, that._refClass);
                yield that._updateInvSideAfterLazyLoading(that._value);
            }
        });
    }
    _afterSetValue(newValue, oldValue) {
        return Promise.resolve();
    }
    _updateInvSideAfterLazyLoading(newValue) {
        return Promise.resolve();
    }
}
exports.HasOneAC = HasOneAC;
class HasOneComposition extends HasOneAC {
    _afterSetValue(newValue, oldValue) {
        return __awaiter(this, void 0, void 0, function* () {
            let that = this;
            if (newValue)
                yield newValue.changeParent(that._parent, that._relation.invRel || schema_consts_1.DEFAULT_PARENT_NAME, true);
            if (oldValue)
                yield oldValue.changeParent(null, that._relation.invRel || schema_consts_1.DEFAULT_PARENT_NAME, true);
        });
    }
    _updateInvSideAfterLazyLoading(newValue) {
        return __awaiter(this, void 0, void 0, function* () {
            let that = this;
            if (newValue) {
                yield newValue.changeParent(that._parent, that._relation.invRel || schema_consts_1.DEFAULT_PARENT_NAME, false);
            }
        });
    }
}
exports.HasOneComposition = HasOneComposition;
class HasOneAggregation extends HasOneAC {
    constructor(parent, propertyName, relation) {
        super(parent, propertyName, relation);
    }
    _setValue(value) {
        const _super = name => super[name];
        return __awaiter(this, void 0, void 0, function* () {
            let that = this;
            return _super("_setValue").call(this, value);
        });
    }
    _afterSetValue(newValue, oldValue) {
        return __awaiter(this, void 0, void 0, function* () {
            let that = this;
            that._value = newValue;
            if (oldValue) {
                let r = oldValue.getRoleByName(that._relation.invRel);
                if (r)
                    yield r.internalSetValueAndNotify(null, oldValue);
            }
            if (newValue) {
                let r = newValue.getRoleByName(that._relation.invRel);
                if (r)
                    yield r.internalSetValueAndNotify(that._parent, oldValue);
            }
        });
    }
    _updateInvSideAfterLazyLoading(newValue) {
        return __awaiter(this, void 0, void 0, function* () {
            //after lazy loading
            let that = this;
            if (newValue) {
                //roleInv is AggregationBelongsTo
                let roleInv = newValue.getRoleByName(that._relation.invRel);
                if (roleInv)
                    roleInv.internalSetValue(that._parent);
            }
        });
    }
}
exports.HasOneAggregation = HasOneAggregation;
