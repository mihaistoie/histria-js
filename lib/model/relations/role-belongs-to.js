"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const role_1 = require("./role");
const histria_utils_1 = require("histria-utils");
const histria_utils_2 = require("histria-utils");
class BaseBelongsTo extends role_1.Role {
    async _lazyLoad() {
        const that = this;
        const query = histria_utils_2.schemaUtils.roleToQueryInv(that._relation, that._parent.model());
        if (query) {
            let opts = { onlyInCache: false };
            return await that._parent.transaction.findOne(that._refClass, query, opts);
        }
        return null;
    }
}
exports.BaseBelongsTo = BaseBelongsTo;
class AggregationBelongsTo extends BaseBelongsTo {
    async _getValue() {
        const that = this;
        let res = that._value;
        if (res === undefined) {
            res = await that._lazyLoad() || null;
            that._value = res;
            // TODO: update side
            // that._updateInvSide()
        }
        return res;
    }
    internalSetValue(value) {
        this._value = value;
    }
    async internalSetValueAndNotify(newValue, oldValue) {
        const that = this;
        await that._parent.changeProperty(that._propertyName, oldValue, newValue, () => {
            that.internalSetValue(newValue);
            histria_utils_2.schemaUtils.updateRoleRefs(that._relation, that._parent.model(), newValue ? newValue.model() : null, false);
        }, { isLazyLoading: false });
    }
    async _setValue(value) {
        const that = this;
        that._checkValueBeforeSet(value);
        const oldValue = that._value;
        const newValue = value;
        if (oldValue === newValue)
            return;
        let notified = false;
        if (oldValue) {
            notified = true;
            await oldValue.rmvObjectFromRole(that._relation.invRel, that._parent);
        }
        if (newValue) {
            notified = true;
            await newValue.addObjectToRole(that._relation.invRel, that._parent);
        }
        if (!notified) {
            await that.internalSetValueAndNotify(newValue, oldValue);
        }
    }
}
exports.AggregationBelongsTo = AggregationBelongsTo;
class CompositionBelongsTo extends BaseBelongsTo {
    async _getValue() {
        const that = this;
        let res = that._parent.owner;
        if (res === undefined) {
            res = await that._lazyLoad() || null;
            let p = that._parent;
            // parent of p is res
            await p.changeParent(res, that._relation.invRel, that._propertyName || histria_utils_1.DEFAULT_PARENT_NAME, false);
        }
        return res;
    }
    internalSetValue(value) {
    }
    async _setValue(value) {
        const that = this;
        const oldParent = await that._getValue();
        const newParent = value;
        if (oldParent === newParent)
            return;
        let changeParentCalled = false;
        if (that._relation.invRel) {
            if (oldParent) {
                changeParentCalled = true;
                await oldParent.rmvObjectFromRole(that._relation.invRel, that._parent);
            }
            if (newParent) {
                changeParentCalled = true;
                await newParent.addObjectToRole(that._relation.invRel, that._parent);
            }
        }
        if (!changeParentCalled) {
            let p = that._parent;
            histria_utils_2.schemaUtils.updateRoleRefs(that._relation, that._parent.model(), newParent ? newParent.model() : null, false);
            // parent of p is newParent
            await p.changeParent(newParent, that._relation.invRel, that._propertyName || histria_utils_1.DEFAULT_PARENT_NAME, true);
        }
    }
}
exports.CompositionBelongsTo = CompositionBelongsTo;
