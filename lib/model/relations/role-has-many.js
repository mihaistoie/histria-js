"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const interfaces_1 = require("../interfaces");
const base_array_1 = require("./base-array");
const histria_utils_1 = require("histria-utils");
const histria_utils_2 = require("histria-utils");
class BaseHasMany extends base_array_1.ObjectArray {
    enumChildren(cb, recursive) {
        let that = this;
        that._items && that._items.forEach(item => {
            if (recursive)
                item.enumChildren(cb, true);
            cb(item);
        });
    }
}
exports.BaseHasMany = BaseHasMany;
class HasManyComposition extends BaseHasMany {
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
            if (!isRestore) {
                for (const item of that._items) {
                    parent.pushLoaded(() => that._notifyHooks(item, interfaces_1.EventType.addItem));
                }
            }
        }
    }
    async length() {
        const that = this;
        await that.lazyLoad();
        return that._items ? that._items.length : 0;
    }
    async _notifyHooks(value, eventType) {
        const that = this;
        const inst = that._parent;
        await inst.notifyHooks(that._propertyName, eventType, value);
    }
    async _removed(item, notifyRemove) {
        const that = this;
        const lmodel = item.model();
        histria_utils_1.schemaUtils.updateRoleRefs(that._relation, lmodel, null, true);
        await item.changeParent(null, that._propertyName, that._relation.invRel || histria_utils_2.DEFAULT_PARENT_NAME, true);
        if (notifyRemove) {
            await that._parent.notifyOperation(that._propertyName, interfaces_1.EventType.removeItem, item);
            await that._notifyHooks(item, interfaces_1.EventType.removeItem);
        }
    }
    async _added(item, notifyAdd) {
        const that = this;
        const lmodel = item.model();
        const rmodel = that._parent.model();
        histria_utils_1.schemaUtils.updateRoleRefs(that._relation, lmodel, rmodel, true);
        await item.changeParent(that._parent, that._propertyName, that._relation.invRel || histria_utils_2.DEFAULT_PARENT_NAME, true);
        if (notifyAdd) {
            await that._parent.notifyOperation(that._propertyName, interfaces_1.EventType.addItem, item);
            await that._notifyHooks(item, interfaces_1.EventType.addItem);
        }
    }
    async _afterItemRemoved(item, ii) {
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
    async _afterItemAdded(item) {
        const that = this;
        await that._added(item, true);
    }
    async set(items) {
        const that = this;
        await that.lazyLoad();
        for (const item of that._items) {
            await that._removed(item, false);
            await that._notifyHooks(item, interfaces_1.EventType.removeItem);
        }
        that._items = [];
        if (items && items.length) {
            that._model = [];
            for (let item of items) {
                let imodel = that._itemModel(item);
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
        for (let item of items) {
            await that._notifyHooks(item, interfaces_1.EventType.addItem);
        }
    }
    async lazyLoad() {
        const that = this;
        if (!that._parent)
            return;
        if (that._isUndefined) {
            const lmodel = that._parent.model();
            const query = histria_utils_1.schemaUtils.roleToQuery(that._relation, lmodel);
            if (query) {
                const opts = { onlyInCache: that._parent.isNew || that.refIsPersistent };
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
            for (let item of that._items) {
                await that._notifyHooks(item, interfaces_1.EventType.addItem);
            }
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
    async _afterItemRemoved(item, ii) {
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
    async _afterItemAdded(item) {
        const that = this;
        const lmodel = item.model();
        const rmodel = that._parent.model();
        const r = item.getRoleByName(that._relation.invRel);
        if (r)
            await r.internalSetValueAndNotify(that._parent, item);
        await that._parent.notifyOperation(that._propertyName, interfaces_1.EventType.addItem, item);
    }
    async set(items) {
        const that = this;
        await that.lazyLoad();
        while (that._items && that._items.length)
            await that.remove(0);
        if (items) {
            for (let item of items)
                await that.add(item);
        }
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
class HasManyRefObject extends BaseHasMany {
    async length() {
        const that = this;
        await that.lazyLoad();
        return that._items ? that._items.length : 0;
    }
    _subscribe(value) {
        const that = this;
        if (value)
            value.addListener(that, that._parent, that._propertyName);
    }
    async _notifyHooks(value, eventType) {
        const that = this;
        const inst = that._parent;
        await inst.notifyHooks(that._propertyName, eventType, value);
    }
    restoreFromCache() {
        const that = this;
        that._items = that._items || [];
        if (that._model && that._model.length && !that._items.length) {
            that._items = [];
            that._model.forEach((idItem) => {
                const item = that._parent.transaction.findOneInCache(that._refClass, { id: idItem }) || null;
                that._items.push(item);
                that._subscribe(item);
            });
        }
        if (that._model && !that._model.length) {
            that._model = null;
            that._isNull = (that._model === null);
        }
    }
    // Called by ObservableObject (that._items) on destroy
    unsubscribe(instance) {
        const that = this;
        if (that && that._items) {
            let ii = that._items.indexOf(instance);
            if (ii >= 0) {
                that._items.splice(ii, 1);
                // do not :
                // that._model.splice(ii, 1)
            }
        }
    }
    async _removed(item, notifyRemove) {
        const that = this;
        item.rmvListener(that);
        if (notifyRemove)
            await that._parent.notifyOperation(that._propertyName, interfaces_1.EventType.removeItem, item);
        await that._notifyHooks(item, interfaces_1.EventType.removeItem);
    }
    async _added(item, notifyAdd) {
        const that = this;
        that._subscribe(item);
        if (notifyAdd)
            await that._parent.notifyOperation(that._propertyName, interfaces_1.EventType.addItem, item);
        await that._notifyHooks(item, interfaces_1.EventType.addItem);
    }
    async _afterItemRemoved(item, ii) {
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
    async _afterItemAdded(item) {
        const that = this;
        await that._added(item, true);
    }
    async lazyLoad() {
        const that = this;
        that._items = that._items || [];
        if (that._model && that._model.length && !that._items.length) {
            let promises = [];
            that._model.forEach((idItem) => {
                promises.push(that._parent.transaction.findOne(that._refClass, { id: idItem }));
            });
            const res = await Promise.all(promises);
            let model = [];
            res.forEach((item, index) => {
                if (item) {
                    model.push(that._model[index]);
                    that._items.push(item);
                    that._subscribe(item);
                }
            });
            if (!model.length)
                model = null;
            that._model = model;
            that._parent.model()[that._propertyName] = that._model;
            for (let item of that._items)
                await that._notifyHooks(item, interfaces_1.EventType.addItem);
        }
    }
    _itemModel(item) {
        return item.uuid;
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
                const imodel = that._itemModel(item);
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
    destroy() {
        const that = this;
        that._items && that._items.forEach(item => {
            item.rmvListener(that);
        });
        super.destroy();
    }
}
exports.HasManyRefObject = HasManyRefObject;

//# sourceMappingURL=role-has-many.js.map
