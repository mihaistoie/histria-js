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
        let that = this;
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
        let that = this;
        let query = histria_utils_1.schemaUtils.roleToQueryInv(that._relation, that._parent.model());
        if (query) {
            let opts = { onlyInCache: false };
            that._value = await that._parent.transaction.findOne(that._refClass, query, opts) || null;
        }
        else
            that._value = null;
    }
    async _setValue(value) {
        let that = this;
        value = value || null;
        let oldValue = await that._getValue();
        if (that._value === value)
            return that._value;
        await that._parent.changeProperty(that._propertyName, oldValue, that._value, function () {
            that._value = value;
            let lmodel = that._parent.model();
            let fmodel = that._value ? that._value.model() : null;
            histria_utils_1.schemaUtils.updateRoleRefs(that._relation, lmodel, fmodel, false);
        });
        return that._value;
    }
}
exports.HasOneRef = HasOneRef;
class HasOneAC extends HasOne {
    async _setValue(value) {
        let that = this;
        value = value || null;
        let oldValue = await that._getValue();
        if (that._value === value)
            return that._value;
        let newValue = value;
        await that._parent.changeProperty(that._propertyName, oldValue, that._value, function () {
            that._value = value;
            if (that._relation.invRel) {
                let fmodel = that._parent.model(), lmodel;
                if (oldValue) {
                    lmodel = oldValue.model();
                    histria_utils_1.schemaUtils.updateRoleRefs(that._relation, lmodel, null, true);
                }
                if (that._value) {
                    lmodel = that._value.model();
                    histria_utils_1.schemaUtils.updateRoleRefs(that._relation, lmodel, fmodel, true);
                }
            }
        });
        await that._afterSetValue(newValue, oldValue);
        return that._value;
    }
    async _lazyLoad() {
        let that = this;
        let query = histria_utils_1.schemaUtils.roleToQuery(that._relation, that._parent.model());
        if (query) {
            that._value = null;
            let opts = { onlyInCache: false };
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
        let that = this;
        let isRestore = that._parent.status === interfaces_1.ObjectStatus.restoring;
        let pmodel = that._parent.model();
        let childModel = pmodel[propertyName];
        if (childModel === null)
            that._value = null;
        else if (childModel) {
            that._value = that._parent.transaction.createInstance(that._refClass, that._parent, that._propertyName, childModel, isRestore);
            if (!isRestore)
                histria_utils_1.schemaUtils.updateRoleRefs(that._relation, childModel, pmodel, true);
        }
    }
    enumChildren(cb) {
        let that = this;
        if (that._value) {
            that._value.enumChildren(cb);
            cb(that._value);
        }
    }
    async _afterSetValue(newValue, oldValue) {
        let that = this;
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
        let that = this;
        if (newValue)
            await newValue.changeParent(that._parent, that._propertyName, that._relation.invRel || histria_utils_1.DEFAULT_PARENT_NAME, false);
    }
    destroy() {
        let that = this;
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
        let that = this;
        that._value = newValue;
        if (oldValue) {
            let r = oldValue.getRoleByName(that._relation.invRel);
            if (r)
                await r.internalSetValueAndNotify(null, oldValue);
        }
        if (newValue) {
            let r = newValue.getRoleByName(that._relation.invRel);
            if (r)
                await r.internalSetValueAndNotify(that._parent, newValue);
        }
    }
    async _updateInvSideAfterLazyLoading(newValue) {
        // After lazy loading
        let that = this;
        if (newValue) {
            // roleInv is AggregationBelongsTo
            let roleInv = newValue.getRoleByName(that._relation.invRel);
            if (roleInv)
                roleInv.internalSetValue(that._parent);
        }
    }
}
exports.HasOneAggregation = HasOneAggregation;
