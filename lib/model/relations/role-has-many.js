"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const interfaces_1 = require("../interfaces");
const base_array_1 = require("./base-array");
const histria_utils_1 = require("histria-utils");
const histria_utils_2 = require("histria-utils");
class HasManyComposition extends base_array_1.ObjectArray {
    constructor(parent, propertyName, relation, model) {
        super(parent, propertyName, relation, model);
        const that = this;
        const isRestore = that._parent.status === interfaces_1.ObjectStatus.restoring;
        if (!that._isNull && !that._isUndefined) {
            let pmodel = that._parent.model();
            that._items = new Array(model.length);
            that._model.forEach((itemModel, index) => {
                let item = that._parent.transaction.createInstance(that._refClass, that._parent, that._propertyName, itemModel, isRestore);
                that._items[index] = item;
                if (!isRestore)
                    histria_utils_1.schemaUtils.updateRoleRefs(that._relation, itemModel, pmodel, true);
            });
        }
    }
    enumChildren(cb) {
        let that = this;
        that._items && that._items.forEach(item => {
            item.enumChildren(cb);
            cb(item);
        });
    }
    async _removed(item, notifyRemove) {
        const that = this;
        const lmodel = item.model();
        histria_utils_1.schemaUtils.updateRoleRefs(that._relation, lmodel, null, true);
        await item.changeParent(null, that._propertyName, that._relation.invRel || histria_utils_2.DEFAULT_PARENT_NAME, true);
        if (notifyRemove)
            await that._parent.notifyOperation(that._propertyName, interfaces_1.EventType.removeItem, item);
    }
    async _added(item, notifyAdd) {
        const that = this;
        const lmodel = item.model();
        const rmodel = that._parent.model();
        histria_utils_1.schemaUtils.updateRoleRefs(that._relation, lmodel, rmodel, true);
        await item.changeParent(that._parent, that._propertyName, that._relation.invRel || histria_utils_2.DEFAULT_PARENT_NAME, true);
        if (notifyAdd)
            await that._parent.notifyOperation(that._propertyName, interfaces_1.EventType.addItem, item);
    }
    async _afterRemoveItem(item, ii) {
        const that = this;
        that._model.splice(ii, 1);
        if (!that._model.length) {
            that._model = null;
            that._parent.model()[that._propertyName] = that._model;
        }
        if (item)
            await that._removed(item, true);
        that._isNull = (that._model === null);
    }
    async _afterAddItem(item) {
        const that = this;
        await that._added(item, true);
    }
    async set(items) {
        const that = this;
        await that.lazyLoad();
        for (const item of that._items) {
            await that._removed(item, false);
        }
        that._items = [];
        if (items && items.length) {
            that._model = [];
            for (let item of items) {
                let imodel = item.model();
                that._model.push(imodel);
                that._items.push(item);
                await that._added(item, false);
            }
        }
        else {
            that._model = null;
        }
        that._isNull = (that._model === null);
        that._parent.model()[that._propertyName] = that._model;
        await that._parent.notifyOperation(that._propertyName, interfaces_1.EventType.setItems, null);
    }
    async lazyLoad() {
        const that = this;
        if (!that._parent)
            return;
        if (that._isUndefined) {
            const lmodel = that._parent.model();
            const query = histria_utils_1.schemaUtils.roleToQuery(that._relation, lmodel);
            if (query) {
                const opts = { onlyInCache: that._parent.isNew };
                const items = await that._parent.transaction.find(that._refClass, query, opts);
                if (items.length) {
                    that._model = new Array(items.length);
                    that._items = new Array(items.length);
                    for (let index = 0; index < items.length; index++) {
                        let item = items[index];
                        let model = item.model();
                        that._model[index] = model;
                        that._items[index] = item;
                        await item.changeParent(that._parent, that._propertyName, that._relation.invRel || histria_utils_2.DEFAULT_PARENT_NAME, false);
                    }
                }
                else
                    that._model = null;
            }
            else
                that._model = null;
            that._isUndefined = false;
            that._isNull = that._model === null;
            lmodel[that._propertyName] = that._model;
        }
    }
    destroy() {
        const that = this;
        that._items && that._items.forEach(item => {
            item.destroy();
        });
        that._items = null;
        super.destroy();
    }
}
exports.HasManyComposition = HasManyComposition;
class HasManyAggregation extends base_array_1.BaseObjectArray {
    async _afterRemoveItem(item, ii) {
        const that = this;
        if (item) {
            const lmodel = item.model();
            histria_utils_1.schemaUtils.updateRoleRefs(that._relation, lmodel, null, true);
            let r = item.getRoleByName(that._relation.invRel);
            if (r)
                await r.internalSetValueAndNotify(null, item);
            await that._parent.notifyOperation(that._propertyName, interfaces_1.EventType.removeItem, item);
        }
    }
    async _afterAddItem(item) {
        const that = this;
        const lmodel = item.model();
        const rmodel = that._parent.model();
        const r = item.getRoleByName(that._relation.invRel);
        if (r)
            await r.internalSetValueAndNotify(that._parent, item);
        await that._parent.notifyOperation(that._propertyName, interfaces_1.EventType.addItem, item);
    }
    async lazyLoad() {
        const that = this;
        if (!that._parent)
            return;
        if (!that._loaded) {
            that._loaded = true;
            const query = histria_utils_1.schemaUtils.roleToQuery(that._relation, that._parent.model());
            if (query) {
                const opts = { onlyInCache: false };
                const items = await that._parent.transaction.find(that._refClass, query);
                if (items.length) {
                    that._items = new Array(items.length);
                    for (let index = 0; index < items.length; index++) {
                        let item = items[index];
                        that._items[index] = item;
                        await that._updateInvSideAfterLazyLoading(item);
                    }
                }
            }
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
exports.HasManyAggregation = HasManyAggregation;
