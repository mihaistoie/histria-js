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
const schema_consts_1 = require("../schema/schema-consts");
const schema_utils_1 = require("../schema/schema-utils");
class BaseBelongsTo extends role_1.Role {
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
            let res = null;
            if (!valueIsNull)
                res = yield that._parent.transaction.findOne(that._refClass, query);
            return res || null;
        });
    }
    destroy() {
        let that = this;
        that._value = null;
        super.destroy();
    }
}
exports.BaseBelongsTo = BaseBelongsTo;
class AggregationBelongsTo extends BaseBelongsTo {
    _getValue() {
        return __awaiter(this, void 0, void 0, function* () {
            let that = this;
            let res = that._value;
            if (res === undefined) {
                res = (yield that._lazyLoad()) || null;
                that._value = res;
            }
            return res;
        });
    }
    internalSetValue(value) {
        let that = this;
        that._value = value;
    }
    internalSetValueAndNotify(newValue, oldValue) {
        return __awaiter(this, void 0, void 0, function* () {
            let that = this;
            yield that._parent.changeProperty(that._propertyName, oldValue, newValue, () => {
                that.internalSetValue(newValue);
                schema_utils_1.updateRoleRefs(that._relation, that._parent.model(), newValue ? newValue.model() : null, false);
            });
        });
    }
    _setValue(value) {
        return __awaiter(this, void 0, void 0, function* () {
            let that = this;
            let oldValue = that._value;
            let newValue = value;
            if (oldValue === newValue)
                return oldValue;
            let notified = false;
            if (oldValue) {
                notified = true;
                yield oldValue.rmvObjectFromRole(that._relation.invRel, that._parent);
            }
            if (newValue) {
                notified = true;
                yield newValue.addObjectToRole(that._relation.invRel, that._parent);
            }
            if (!notified) {
                yield that.internalSetValueAndNotify(newValue, oldValue);
            }
            return that._value;
        });
    }
}
exports.AggregationBelongsTo = AggregationBelongsTo;
class CompositionBelongsTo extends BaseBelongsTo {
    _getValue() {
        return __awaiter(this, void 0, void 0, function* () {
            let that = this;
            let res = that._parent.parent;
            if (res === undefined) {
                res = (yield that._lazyLoad()) || null;
                let p = that._parent;
                // parent of p is res
                yield p.changeParent(res, that._relation.invRel, that._propertyName || schema_consts_1.DEFAULT_PARENT_NAME, false);
            }
            return res;
        });
    }
    internalSetValue(value) {
    }
    _setValue(value) {
        return __awaiter(this, void 0, void 0, function* () {
            let that = this;
            let oldParent = yield that._getValue();
            let newParent = value;
            if (oldParent === newParent)
                return oldParent;
            let changeParentCalled = false;
            if (that._relation.invRel) {
                if (oldParent) {
                    changeParentCalled = true;
                    yield oldParent.rmvObjectFromRole(that._relation.invRel, that._parent);
                }
                if (newParent) {
                    changeParentCalled = true;
                    yield newParent.addObjectToRole(that._relation.invRel, that._parent);
                }
            }
            if (!changeParentCalled) {
                let p = that._parent;
                schema_utils_1.updateRoleRefs(that._relation, that._parent.model(), newParent ? newParent.model() : null, false);
                // parent of p is newParent
                yield p.changeParent(newParent, that._relation.invRel, that._propertyName || schema_consts_1.DEFAULT_PARENT_NAME, true);
            }
            let res = that._parent.parent;
            return res;
        });
    }
}
exports.CompositionBelongsTo = CompositionBelongsTo;
