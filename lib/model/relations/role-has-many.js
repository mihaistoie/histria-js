"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const interfaces_1 = require("../interfaces");
const base_array_1 = require("./base-array");
const histria_utils_1 = require("histria-utils");
class BaseHasMany extends base_array_1.ObjectArray {
    enumChildren(cb, recursive) {
        if (this._items)
            this._items.forEach(item => {
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
        const isRestore = this._parent.status === interfaces_1.ObjectStatus.restoring;
        if (!this._isNull && !this._isUndefined) {
            const pmodel = this._parent.model();
            this._items = new Array(model.length);
            this._model.forEach((itemModel, index) => {
                const item = this._parent.transaction.createInstance(this._refClass, this._parent, this._propertyName, itemModel, isRestore);
                this._items[index] = item;
                if (!isRestore)
                    histria_utils_1.schemaUtils.updateRoleRefs(this._relation, itemModel, pmodel, true);
            });
            if (!isRestore) {
                for (const item of this._items) {
                    parent.pushLoaded(() => this._notifyHooks(item, interfaces_1.EventType.addItem));
                }
            }
        }
    }
    async length() {
        await this.lazyLoad();
        return this._items ? this._items.length : 0;
    }
    async set(items) {
        await this.lazyLoad();
        for (const item of this._items) {
            await this._removed(item, false);
            await this._notifyHooks(item, interfaces_1.EventType.removeItem);
        }
        this._items = [];
        if (items && items.length) {
            this._model = [];
            for (const item of items) {
                const imodel = this._itemModel(item);
                this._model.push(imodel);
                this._items.push(item);
                await this._added(item, false);
            }
        }
        else {
            this._model = null;
        }
        this._isNull = (this._model === null);
        this._parent.model()[this._propertyName] = this._model;
        await this._parent.notifyOperation(this._propertyName, interfaces_1.EventType.setItems, null);
        for (const item of items) {
            await this._notifyHooks(item, interfaces_1.EventType.addItem);
        }
    }
    destroy() {
        if (this._items)
            this._items.forEach(item => {
                item.destroy();
            });
        this._items = null;
        super.destroy();
    }
    async _afterItemRemoved(item, ii) {
        this._model.splice(ii, 1);
        if (!this._model.length) {
            this._model = null;
            this._parent.model()[this._propertyName] = this._model;
        }
        if (item)
            await this._removed(item, true);
        this._isNull = (this._model === null);
    }
    async _afterItemAdded(item) {
        await this._added(item, true);
    }
    async lazyLoad() {
        if (!this._parent)
            return;
        if (this._isUndefined) {
            const lmodel = this._parent.model();
            const query = histria_utils_1.schemaUtils.roleToQuery(this._relation, lmodel);
            if (query) {
                const opts = { onlyInCache: this._parent.isNew || this.refIsPersistent };
                const items = await this._parent.transaction.find(this._refClass, query, opts);
                if (items.length) {
                    this._model = new Array(items.length);
                    this._items = new Array(items.length);
                    for (let index = 0; index < items.length; index++) {
                        const item = items[index];
                        const model = item.model();
                        this._model[index] = model;
                        this._items[index] = item;
                        await item.changeParent(this._parent, this._propertyName, this._relation.invRel || histria_utils_1.DEFAULT_PARENT_NAME, false);
                    }
                }
                else
                    this._model = null;
            }
            else
                this._model = null;
            this._isUndefined = false;
            this._isNull = this._model === null;
            lmodel[this._propertyName] = this._model;
            for (const item of this._items) {
                await this._notifyHooks(item, interfaces_1.EventType.addItem);
            }
        }
    }
    async _notifyHooks(value, eventType) {
        const inst = this._parent;
        await inst.notifyHooks(this._propertyName, eventType, value);
    }
    async _removed(item, notifyRemove) {
        const lmodel = item.model();
        histria_utils_1.schemaUtils.updateRoleRefs(this._relation, lmodel, null, true);
        await item.changeParent(null, this._propertyName, this._relation.invRel || histria_utils_1.DEFAULT_PARENT_NAME, true);
        if (notifyRemove) {
            await this._parent.notifyOperation(this._propertyName, interfaces_1.EventType.removeItem, item);
            await this._notifyHooks(item, interfaces_1.EventType.removeItem);
        }
    }
    async _added(item, notifyAdd) {
        const lmodel = item.model();
        const rmodel = this._parent.model();
        histria_utils_1.schemaUtils.updateRoleRefs(this._relation, lmodel, rmodel, true);
        await item.changeParent(this._parent, this._propertyName, this._relation.invRel || histria_utils_1.DEFAULT_PARENT_NAME, true);
        if (notifyAdd) {
            await this._parent.notifyOperation(this._propertyName, interfaces_1.EventType.addItem, item);
            await this._notifyHooks(item, interfaces_1.EventType.addItem);
        }
    }
}
exports.HasManyComposition = HasManyComposition;
class HasManyAggregation extends base_array_1.BaseObjectArray {
    async set(items) {
        await this.lazyLoad();
        while (this._items && this._items.length)
            await this.remove(0);
        if (items) {
            for (const item of items)
                await this.add(item);
        }
    }
    async _afterItemRemoved(item, ii) {
        if (item) {
            const lmodel = item.model();
            histria_utils_1.schemaUtils.updateRoleRefs(this._relation, lmodel, null, true);
            const r = item.getRoleByName(this._relation.invRel);
            if (r)
                await r.internalSetValueAndNotify(null, item);
            await this._parent.notifyOperation(this._propertyName, interfaces_1.EventType.removeItem, item);
        }
    }
    async _afterItemAdded(item) {
        const r = item.getRoleByName(this._relation.invRel);
        if (r)
            await r.internalSetValueAndNotify(this._parent, item);
        await this._parent.notifyOperation(this._propertyName, interfaces_1.EventType.addItem, item);
    }
    async lazyLoad() {
        if (!this._parent)
            return;
        if (!this._loaded) {
            this._loaded = true;
            const query = histria_utils_1.schemaUtils.roleToQuery(this._relation, this._parent.model());
            if (query) {
                const opts = { onlyInCache: false };
                const items = await this._parent.transaction.find(this._refClass, query);
                if (items.length) {
                    this._items = new Array(items.length);
                    for (let index = 0; index < items.length; index++) {
                        const item = items[index];
                        this._items[index] = item;
                        await this._updateInvSideAfterLazyLoading(item);
                    }
                }
            }
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
exports.HasManyAggregation = HasManyAggregation;
class HasManyRefObject extends BaseHasMany {
    async length() {
        await this.lazyLoad();
        return this._items ? this._items.length : 0;
    }
    restoreFromCache() {
        this._items = this._items || [];
        if (this._model && this._model.length && !this._items.length) {
            this._items = [];
            this._model.forEach((idItem) => {
                const item = this._parent.transaction.findOneInCache(this._refClass, { id: idItem }) || null;
                this._items.push(item);
                this._subscribe(item);
            });
        }
        if (this._model && !this._model.length) {
            this._model = null;
            this._isNull = (this._model === null);
        }
    }
    // Called by ObservableObject (this._items) on destroy
    unsubscribe(instance) {
        if (this && this._items) {
            const ii = this._items.indexOf(instance);
            if (ii >= 0) {
                this._items.splice(ii, 1);
                // do not :
                // this._model.splice(ii, 1)
            }
        }
    }
    async set(items) {
        await this.lazyLoad();
        for (const item of this._items) {
            await this._removed(item, false);
        }
        this._items = [];
        if (items && items.length) {
            this._model = [];
            for (const item of items) {
                const imodel = this._itemModel(item);
                this._model.push(imodel);
                this._items.push(item);
                await this._added(item, false);
            }
        }
        else {
            this._model = null;
        }
        this._isNull = (this._model === null);
        this._parent.model()[this._propertyName] = this._model;
        await this._parent.notifyOperation(this._propertyName, interfaces_1.EventType.setItems, null);
    }
    destroy() {
        if (this._items)
            this._items.forEach(item => {
                item.rmvListener(this);
            });
        super.destroy();
    }
    async _afterItemRemoved(item, ii) {
        this._model.splice(ii, 1);
        if (!this._model.length) {
            this._model = null;
            this._parent.model()[this._propertyName] = this._model;
        }
        if (item)
            await this._removed(item, true);
        this._isNull = (this._model === null);
    }
    async _afterItemAdded(item) {
        await this._added(item, true);
    }
    async lazyLoad() {
        this._items = this._items || [];
        if (this._model && this._model.length && !this._items.length) {
            const promises = [];
            this._model.forEach((idItem) => {
                promises.push(this._parent.transaction.findOne(this._refClass, { id: idItem }));
            });
            const res = await Promise.all(promises);
            let model = [];
            res.forEach((item, index) => {
                if (item) {
                    model.push(this._model[index]);
                    this._items.push(item);
                    this._subscribe(item);
                }
            });
            if (!model.length)
                model = null;
            this._model = model;
            this._parent.model()[this._propertyName] = this._model;
            for (const item of this._items)
                await this._notifyHooks(item, interfaces_1.EventType.addItem);
        }
    }
    _itemModel(item) {
        return item.uuid;
    }
    _subscribe(value) {
        if (value)
            value.addListener(this, this._parent, this._propertyName);
    }
    async _notifyHooks(value, eventType) {
        const inst = this._parent;
        await inst.notifyHooks(this._propertyName, eventType, value);
    }
    async _removed(item, notifyRemove) {
        item.rmvListener(this);
        if (notifyRemove)
            await this._parent.notifyOperation(this._propertyName, interfaces_1.EventType.removeItem, item);
        await this._notifyHooks(item, interfaces_1.EventType.removeItem);
    }
    async _added(item, notifyAdd) {
        this._subscribe(item);
        if (notifyAdd)
            await this._parent.notifyOperation(this._propertyName, interfaces_1.EventType.addItem, item);
        await this._notifyHooks(item, interfaces_1.EventType.addItem);
    }
}
exports.HasManyRefObject = HasManyRefObject;

//# sourceMappingURL=role-has-many.js.map
