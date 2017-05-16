"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const interfaces_1 = require("../interfaces");
const role_1 = require("./role");
const histria_utils_1 = require("histria-utils");
class HasOne extends role_1.Role {
    constructor(parent, propertyName, relation) {
        super(parent, propertyName, relation);
    }
    async _getValue() {
        const that = this;
        if (that._value !== undefined)
            return that._value;
        await that._lazyLoad();
        return that._value;
    }
    async _lazyLoad() {
        this._value = null;
        return Promise.resolve();
    }
}
exports.HasOne = HasOne;
class HasOneRef extends HasOne {
    constructor(parent, propertyName, relation) {
        super(parent, propertyName, relation);
    }
    async _lazyLoad() {
        const that = this;
        const query = histria_utils_1.schemaUtils.roleToQueryInv(that._relation, that._parent.model());
        if (query) {
            let opts = { onlyInCache: false };
            that._value = await that._parent.transaction.findOne(that._refClass, query, opts) || null;
        }
        else
            that._value = null;
    }
    async _setValue(value) {
        const that = this;
        value = value || null;
        let oldValue = await that._getValue();
        if (that._value === value)
            return;
        await that._parent.changeProperty(that._propertyName, oldValue, value, () => {
            that._value = value;
            let lmodel = that._parent.model();
            let fmodel = that._value ? that._value.model() : null;
            histria_utils_1.schemaUtils.updateRoleRefs(that._relation, lmodel, fmodel, false);
        }, { isLazyLoading: false });
    }
}
exports.HasOneRef = HasOneRef;
class HasOneAC extends HasOne {
    async _setValue(value) {
        const that = this;
        value = value || null;
        that._checkValueBeforeSet(value);
        let oldValue = await that._getValue();
        if (that._value === value)
            return;
        const newValue = value;
        await that._parent.changeProperty(that._propertyName, oldValue, value, () => {
            that._value = value;
            if (that._relation.invRel) {
                let fmodel = that._parent.model(), lmodel;
                const useInv = (that.refIsPersistent || that._parent.isPersistent);
                if (oldValue && useInv) {
                    lmodel = oldValue.model();
                    histria_utils_1.schemaUtils.updateRoleRefs(that._relation, lmodel, null, true);
                }
                if (that._value) {
                    lmodel = that._value.model();
                    if (useInv)
                        histria_utils_1.schemaUtils.updateRoleRefs(that._relation, lmodel, fmodel, useInv);
                    else
                        histria_utils_1.schemaUtils.updateRoleRefs(that._relation, fmodel, lmodel, useInv);
                }
            }
        }, { isLazyLoading: false });
        await that._afterSetValue(newValue, oldValue);
    }
    async remove(instance) {
        const that = this;
        const oldValue = await that.getValue();
        if (oldValue === instance)
            await that.setValue(null);
    }
    async _lazyLoad() {
        const that = this;
        const query = histria_utils_1.schemaUtils.roleToQuery(that._relation, that._parent.model());
        if (query) {
            that._value = null;
            const opts = { onlyInCache: false };
            that._value = await that._parent.transaction.findOne(that._refClass, query, opts);
            await that._updateInvSideAfterLazyLoading(that._value);
        }
        else
            that._value = null;
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
    constructor(parent, propertyName, relation) {
        super(parent, propertyName, relation);
        const that = this;
        const isRestore = that._parent.status === interfaces_1.ObjectStatus.restoring;
        const pmodel = that._parent.model();
        const childModel = pmodel[propertyName];
        if (childModel === null)
            that._value = null;
        else if (childModel) {
            that._value = that._parent.transaction.createInstance(that._refClass, that._parent, that._propertyName, childModel, isRestore);
            if (!isRestore) {
                const useInv = (that.refIsPersistent || that._parent.isPersistent);
                if (useInv)
                    histria_utils_1.schemaUtils.updateRoleRefs(that._relation, childModel, pmodel, true);
                else {
                    // xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
                    histria_utils_1.schemaUtils.updateRoleRefs(that._relation, pmodel, childModel, false);
                }
            }
        }
    }
    enumChildren(cb, recursive) {
        const that = this;
        if (that._value) {
            if (recursive)
                that._value.enumChildren(cb, true);
            cb(that._value);
        }
    }
    async _afterSetValue(newValue, oldValue) {
        const that = this;
        if (newValue) {
            await newValue.changeParent(that._parent, that._propertyName, that._relation.invRel || histria_utils_1.DEFAULT_PARENT_NAME, true);
            that._parent.model()[that._propertyName] = newValue.model();
        }
        if (oldValue) {
            await oldValue.changeParent(null, that._propertyName, that._relation.invRel || histria_utils_1.DEFAULT_PARENT_NAME, true);
        }
        if (!newValue) {
            that._parent.model()[that._propertyName] = null;
        }
    }
    async _updateInvSideAfterLazyLoading(newValue) {
        const that = this;
        if (newValue)
            await newValue.changeParent(that._parent, that._propertyName, that._relation.invRel || histria_utils_1.DEFAULT_PARENT_NAME, false);
    }
    destroy() {
        const that = this;
        if (that._value) {
            that._value.destroy();
            that._value = null;
        }
        super.destroy();
    }
}
exports.HasOneComposition = HasOneComposition;
class HasOneAggregation extends HasOneAC {
    constructor(parent, propertyName, relation) {
        super(parent, propertyName, relation);
    }
    async _afterSetValue(newValue, oldValue) {
        const that = this;
        that._value = newValue;
        if (oldValue) {
            const r = oldValue.getRoleByName(that._relation.invRel);
            if (r)
                await r.internalSetValueAndNotify(null, oldValue);
        }
        if (newValue) {
            const r = newValue.getRoleByName(that._relation.invRel);
            if (r)
                await r.internalSetValueAndNotify(that._parent, newValue);
        }
    }
    async _updateInvSideAfterLazyLoading(newValue) {
        // After lazy loading
        const that = this;
        if (newValue) {
            // roleInv is AggregationBelongsTo
            const roleInv = newValue.getRoleByName(that._relation.invRel);
            if (roleInv)
                roleInv.internalSetValue(that._parent);
        }
    }
}
exports.HasOneAggregation = HasOneAggregation;
class HasOneRefObject extends HasOne {
    constructor(parent, propertyName, relation) {
        super(parent, propertyName, relation);
    }
    _subscribe() {
        const that = this;
        if (that._value && that._relation.aggregationKind === histria_utils_1.AGGREGATION_KIND.composite) {
            that._value.addListener(that, that._parent, that._propertyName);
        }
    }
    // Called by ObservableObject (that._value) on destroy
    unsubscribe(instance) {
        const that = this;
        if (that._relation.aggregationKind === histria_utils_1.AGGREGATION_KIND.composite) {
            that._value = undefined;
        }
    }
    enumChildren(cb, recursive) {
        const that = this;
        const parentIsPersistent = that._parent.isPersistent;
        if (that._relation.aggregationKind === histria_utils_1.AGGREGATION_KIND.composite && that._value) {
            if (parentIsPersistent && !that._value.isPersistent) {
                if (recursive)
                    that._value.enumChildren(cb, true);
                cb(that._value);
            }
        }
    }
    get syncValue() {
        return this._value;
    }
    restoreFromCache() {
        const that = this;
        const query = histria_utils_1.schemaUtils.roleToQueryInv(that._relation, that._parent.model());
        let value = that._parent.transaction.findOneInCache(that._refClass, query) || null;
        if (value) {
            that._value = value;
            that._subscribe();
        }
    }
    destroy() {
        const that = this;
        if (that._value && that._relation.aggregationKind === histria_utils_1.AGGREGATION_KIND.composite) {
            that._value.rmvListener(that);
            that._value = null;
        }
        super.destroy();
    }
    async _setValue(value) {
        const that = this;
        that._checkValueBeforeSet(value);
        value = value || null;
        let oldValue = await that._getValue();
        if (that._value === value)
            return;
        await that._parent.changeProperty(that._propertyName, oldValue, value, () => {
            if (oldValue && that._relation.aggregationKind === histria_utils_1.AGGREGATION_KIND.composite)
                oldValue.rmvListener(that);
            that._value = value;
            that._subscribe();
            let lmodel = that._parent.model();
            let fmodel = that._value ? that._value.model() : null;
            histria_utils_1.schemaUtils.updateRoleRefs(that._relation, lmodel, fmodel, false);
        }, { isLazyLoading: false });
    }
    async _lazyLoad() {
        const that = this;
        const query = histria_utils_1.schemaUtils.roleToQueryInv(that._relation, that._parent.model());
        if (query) {
            const opts = { onlyInCache: false };
            that._value = await that._parent.transaction.findOne(that._refClass, query, opts) || null;
            if (that._relation.aggregationKind === histria_utils_1.AGGREGATION_KIND.composite)
                await that._parent.changeProperty(that._propertyName, undefined, that._value, () => { }, { isLazyLoading: true });
            that._subscribe();
        }
        else
            that._value = null;
    }
    async remove(instance) {
        const that = this;
        const oldValue = await that.getValue();
        if (oldValue === instance)
            await that.setValue(null);
    }
}
exports.HasOneRefObject = HasOneRefObject;
