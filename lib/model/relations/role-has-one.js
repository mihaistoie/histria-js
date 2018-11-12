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
        if (this._value !== undefined)
            return this._value;
        await this._lazyLoad();
        return this._value;
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
        const query = histria_utils_1.schemaUtils.roleToQueryInv(this._relation, this._parent.model());
        if (query) {
            const opts = { onlyInCache: false };
            this._value = await this._parent.transaction.findOne(this._refClass, query, opts) || null;
        }
        else
            this._value = null;
    }
    async _setValue(value) {
        value = value || null;
        const oldValue = await this._getValue();
        if (this._value === value)
            return;
        await this._parent.changeProperty(this._propertyName, oldValue, value, () => {
            this._value = value;
            const lmodel = this._parent.model();
            const fmodel = this._value ? this._value.model() : null;
            histria_utils_1.schemaUtils.updateRoleRefs(this._relation, lmodel, fmodel, false);
        }, { isLazyLoading: false });
    }
}
exports.HasOneRef = HasOneRef;
class HasOneAC extends HasOne {
    async remove(instance) {
        const oldValue = await this.getValue();
        if (oldValue === instance)
            await this.setValue(null);
    }
    async _notifyHooks(value, eventType) {
        const inst = this._parent;
        await inst.notifyHooks(this._propertyName, eventType, value);
    }
    async _setValue(value) {
        value = value || null;
        this._checkValueBeforeSet(value);
        const oldValue = await this._getValue();
        if (this._value === value)
            return;
        const newValue = value;
        await this._parent.changeProperty(this._propertyName, oldValue, value, () => {
            this._value = value;
            if (this._relation.invRel) {
                const useInv = (this.refIsPersistent || this._parent.isPersistent);
                const fmodel = this._parent.model();
                let lmodel;
                if (oldValue && useInv) {
                    lmodel = oldValue.model();
                    histria_utils_1.schemaUtils.updateRoleRefs(this._relation, lmodel, null, true);
                }
                if (this._value) {
                    lmodel = this._value.model();
                    if (useInv)
                        histria_utils_1.schemaUtils.updateRoleRefs(this._relation, lmodel, fmodel, useInv);
                    else
                        histria_utils_1.schemaUtils.updateRoleRefs(this._relation, fmodel, lmodel, useInv);
                }
                else {
                    if (!useInv) {
                        histria_utils_1.schemaUtils.updateRoleRefs(this._relation, fmodel, null, useInv);
                    }
                }
            }
        }, { isLazyLoading: false });
        await this._afterSetValue(newValue, oldValue);
    }
    async _lazyLoad() {
        const query = histria_utils_1.schemaUtils.roleToQuery(this._relation, this._parent.model());
        if (query) {
            this._value = null;
            const opts = { onlyInCache: this.refIsPersistent };
            this._value = await this._parent.transaction.findOne(this._refClass, query, opts);
            await this._updateInvSideAfterLazyLoading(this._value);
        }
        else
            this._value = null;
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
        const isRestore = this._parent.status === interfaces_1.ObjectStatus.restoring;
        const pmodel = this._parent.model();
        const childModel = pmodel[propertyName];
        if (childModel === null)
            this._value = null;
        else if (childModel) {
            this._value = this._parent.transaction.createInstance(this._refClass, this._parent, this._propertyName, childModel, isRestore);
            if (!isRestore) {
                const useInv = (this.refIsPersistent || this._parent.isPersistent);
                if (useInv)
                    histria_utils_1.schemaUtils.updateRoleRefs(this._relation, childModel, pmodel, useInv);
                else
                    histria_utils_1.schemaUtils.updateRoleRefs(this._relation, pmodel, childModel, useInv);
            }
            if (!isRestore && this._value) {
                parent.pushLoaded(() => this._notifyHooks(this._value, interfaces_1.EventType.addItem));
            }
        }
    }
    enumChildren(cb, recursive) {
        if (this._value) {
            if (recursive)
                this._value.enumChildren(cb, true);
            cb(this._value);
        }
    }
    destroy() {
        if (this._value) {
            this._value.destroy();
            this._value = null;
        }
        super.destroy();
    }
    async _afterSetValue(newValue, oldValue) {
        if (newValue) {
            await newValue.changeParent(this._parent, this._propertyName, this._relation.invRel || histria_utils_1.DEFAULT_PARENT_NAME, true);
            this._parent.model()[this._propertyName] = newValue.model();
        }
        if (oldValue) {
            await oldValue.changeParent(null, this._propertyName, this._relation.invRel || histria_utils_1.DEFAULT_PARENT_NAME, true);
        }
        if (!newValue) {
            this._parent.model()[this._propertyName] = null;
        }
        if (oldValue)
            await this._notifyHooks(oldValue, interfaces_1.EventType.removeItem);
        if (newValue)
            await this._notifyHooks(newValue, interfaces_1.EventType.addItem);
    }
    async _updateInvSideAfterLazyLoading(newValue) {
        if (newValue)
            await newValue.changeParent(this._parent, this._propertyName, this._relation.invRel || histria_utils_1.DEFAULT_PARENT_NAME, false);
    }
}
exports.HasOneComposition = HasOneComposition;
class HasOneAggregation extends HasOneAC {
    constructor(parent, propertyName, relation) {
        super(parent, propertyName, relation);
    }
    async _afterSetValue(newValue, oldValue) {
        this._value = newValue;
        if (oldValue) {
            const r = oldValue.getRoleByName(this._relation.invRel);
            if (r)
                await r.internalSetValueAndNotify(null, oldValue);
        }
        if (newValue) {
            const r = newValue.getRoleByName(this._relation.invRel);
            if (r)
                await r.internalSetValueAndNotify(this._parent, newValue);
        }
    }
    async _updateInvSideAfterLazyLoading(newValue) {
        // After lazy loading
        if (newValue) {
            // roleInv is AggregationBelongsTo
            const roleInv = newValue.getRoleByName(this._relation.invRel);
            if (roleInv)
                roleInv.internalSetValue(this._parent);
        }
    }
}
exports.HasOneAggregation = HasOneAggregation;
class HasOneRefObject extends HasOne {
    constructor(parent, propertyName, relation) {
        super(parent, propertyName, relation);
    }
    get syncValue() {
        return this._value;
    }
    // Called by ObservableObject (this._value) on destroy
    unsubscribe(instance) {
        if (this._relation.aggregationKind === histria_utils_1.AGGREGATION_KIND.composite) {
            this._value = undefined;
        }
    }
    enumChildren(cb, recursive) {
        const parentIsPersistent = this._parent.isPersistent;
        if (this._relation.aggregationKind === histria_utils_1.AGGREGATION_KIND.composite && this._value) {
            if (parentIsPersistent && !this._value.isPersistent) {
                if (recursive)
                    this._value.enumChildren(cb, true);
                cb(this._value);
            }
        }
    }
    restoreFromCache() {
        const query = histria_utils_1.schemaUtils.roleToQueryInv(this._relation, this._parent.model());
        const value = this._parent.transaction.findOneInCache(this._refClass, query) || null;
        if (value) {
            this._value = value;
            this._subscribe();
        }
    }
    destroy() {
        if (this._value && this._relation.aggregationKind === histria_utils_1.AGGREGATION_KIND.composite) {
            this._value.rmvListener(this);
            this._value = null;
        }
        super.destroy();
    }
    async remove(instance) {
        const oldValue = await this.getValue();
        if (oldValue === instance)
            await this.setValue(null);
    }
    async _setValue(value) {
        this._checkValueBeforeSet(value);
        value = value || null;
        const oldValue = await this._getValue();
        if (this._value === value)
            return;
        await this._parent.changeProperty(this._propertyName, oldValue, value, () => {
            if (oldValue && this._relation.aggregationKind === histria_utils_1.AGGREGATION_KIND.composite)
                oldValue.rmvListener(this);
            this._value = value;
            this._subscribe();
            const lmodel = this._parent.model();
            const fmodel = this._value ? this._value.model() : null;
            histria_utils_1.schemaUtils.updateRoleRefs(this._relation, lmodel, fmodel, false);
        }, { isLazyLoading: false });
        if (this._relation.aggregationKind === histria_utils_1.AGGREGATION_KIND.composite) {
            if (oldValue)
                await this._notifyHooks(oldValue, interfaces_1.EventType.removeItem);
            if (this._value)
                await this._notifyHooks(this._value, interfaces_1.EventType.addItem);
        }
    }
    async _lazyLoad() {
        const query = histria_utils_1.schemaUtils.roleToQueryInv(this._relation, this._parent.model());
        if (query) {
            const opts = { onlyInCache: false };
            this._value = await this._parent.transaction.findOne(this._refClass, query, opts) || null;
            if (this._relation.aggregationKind === histria_utils_1.AGGREGATION_KIND.composite)
                // tslint:disable-next-line:no-empty
                await this._parent.changeProperty(this._propertyName, undefined, this._value, () => { }, { isLazyLoading: true });
            this._subscribe();
        }
        else
            this._value = null;
        if (this._value && this._relation.aggregationKind === histria_utils_1.AGGREGATION_KIND.composite) {
            await this._notifyHooks(this._value, interfaces_1.EventType.addItem);
        }
    }
    async _notifyHooks(value, eventType) {
        const inst = this._parent;
        await inst.notifyHooks(this._propertyName, eventType, value);
    }
    _subscribe() {
        if (this._value && this._relation.aggregationKind === histria_utils_1.AGGREGATION_KIND.composite) {
            this._value.addListener(this, this._parent, this._propertyName);
        }
    }
}
exports.HasOneRefObject = HasOneRefObject;

//# sourceMappingURL=role-has-one.js.map
