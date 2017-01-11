"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const role_1 = require("./role");
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
                res = yield that._parent.transaction.findOne(query, that._refClass);
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
    _setValue(value) {
        return __awaiter(this, void 0, void 0, function* () {
            let that = this;
            let oldValue = that._value;
            let newValue = value;
            if (oldValue === newValue)
                return oldValue;
            that._value = newValue;
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
                yield p.changeParent(res, that._propertyName, false);
                let refRole = that.invRole(res);
                if (refRole)
                    refRole.internalSetValue(that._parent);
            }
            return res;
        });
    }
    internalSetValue(value) {
        if (value) {
        }
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
                if (oldParent && oldParent.removeChild) {
                    changeParentCalled = true;
                    yield oldParent.removeChild(that._relation.invRel, that._parent);
                }
                if (newParent && newParent.addChild) {
                    changeParentCalled = true;
                    yield newParent.addChild(that._relation.invRel, that._parent);
                }
            }
            if (!changeParentCalled) {
                let p = that._parent;
                schema_utils_1.updateRoleRefs(that._relation, that._parent.model(), newParent ? newParent.model() : null, false);
                yield p.changeParent(newParent, that._propertyName, true);
            }
            let res = that._parent.parent;
            return res;
        });
    }
}
exports.CompositionBelongsTo = CompositionBelongsTo;
