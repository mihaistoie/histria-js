"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const role_1 = require("./role");
const histria_utils_1 = require("histria-utils");
class BaseBelongsTo extends role_1.Role {
    async _lazyLoad() {
        const query = histria_utils_1.schemaUtils.roleToQueryInv(this._relation, this._parent.model());
        if (query) {
            const opts = { onlyInCache: !this.refIsPersistent };
            return this._parent.transaction.findOne(this._refClass, query, opts);
        }
        return null;
    }
}
exports.BaseBelongsTo = BaseBelongsTo;
class AggregationBelongsTo extends BaseBelongsTo {
    internalSetValue(value) {
        this._value = value;
    }
    async internalSetValueAndNotify(newValue, oldValue) {
        await this._parent.changeProperty(this._propertyName, oldValue, newValue, () => {
            this.internalSetValue(newValue);
            histria_utils_1.schemaUtils.updateRoleRefs(this._relation, this._parent.model(), newValue ? newValue.model() : null, false);
        }, { isLazyLoading: false });
    }
    async _getValue() {
        let res = this._value;
        if (res === undefined) {
            res = await this._lazyLoad() || null;
            this._value = res;
            // TODO: update side
            // this._updateInvSide()
        }
        return res;
    }
    async _setValue(value) {
        this._checkValueBeforeSet(value);
        const oldValue = this._value;
        const newValue = value;
        if (oldValue === newValue)
            return;
        let notified = false;
        if (oldValue) {
            notified = true;
            await oldValue.rmvObjectFromRole(this._relation.invRel, this._parent);
        }
        if (newValue) {
            notified = true;
            await newValue.addObjectToRole(this._relation.invRel, this._parent);
        }
        if (!notified) {
            await this.internalSetValueAndNotify(newValue, oldValue);
        }
    }
}
exports.AggregationBelongsTo = AggregationBelongsTo;
class CompositionBelongsTo extends BaseBelongsTo {
    // tslint:disable-next-line:no-empty
    internalSetValue(value) { }
    async _getValue() {
        let res = this._parent.owner;
        if (res === undefined) {
            res = await this._lazyLoad() || null;
            const p = this._parent;
            // parent of p is res
            await p.changeParent(res, this._relation.invRel, this._propertyName || histria_utils_1.DEFAULT_PARENT_NAME, false);
        }
        return res;
    }
    async _setValue(value) {
        const oldParent = await this._getValue();
        const newParent = value;
        if (oldParent === newParent)
            return;
        let changeParentCalled = false;
        if (this._relation.invRel) {
            if (oldParent) {
                changeParentCalled = true;
                await oldParent.rmvObjectFromRole(this._relation.invRel, this._parent);
            }
            if (newParent) {
                changeParentCalled = true;
                await newParent.addObjectToRole(this._relation.invRel, this._parent);
            }
        }
        if (!changeParentCalled) {
            const p = this._parent;
            histria_utils_1.schemaUtils.updateRoleRefs(this._relation, this._parent.model(), newParent ? newParent.model() : null, false);
            // parent of p is newParent
            await p.changeParent(newParent, this._relation.invRel, this._propertyName || histria_utils_1.DEFAULT_PARENT_NAME, true);
        }
    }
}
exports.CompositionBelongsTo = CompositionBelongsTo;

//# sourceMappingURL=role-belongs-to.js.map
