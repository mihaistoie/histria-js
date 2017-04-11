"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const model_manager_1 = require("../model-manager");
class BaseObjectArray {
    constructor(parent, propertyName, relation) {
        let that = this;
        that._parent = parent;
        that._propertyName = propertyName;
        that._relation = relation;
        that._items = [];
        that._refClass = model_manager_1.modelManager().classByName(that._relation.model, that._relation.nameSpace);
    }
    destroy() {
        let that = this;
        that._items = null;
        that._relation = null;
        that._parent = null;
        that._refClass = null;
    }
    async lazyLoad() {
        return Promise.resolve();
    }
    async toArray() {
        let that = this;
        await that.lazyLoad();
        return that._items.slice();
    }
    async indexOf(item) {
        let that = this;
        await that.lazyLoad();
        return (that._items || []).indexOf(item);
    }
    async remove(element) {
        let that = this;
        await that.lazyLoad();
        let ii, item;
        if (typeof element === 'number') {
            ii = element;
            if (ii >= 0 && ii < that._items.length) {
                item = that._items[ii];
            }
            else {
                ii = -1;
                item = null;
            }
        }
        else {
            item = element;
            ii = that._items.indexOf(item);
            if (ii < 0)
                item = null;
        }
        if (!item)
            return null;
        that._items.splice(ii, 1);
        await that._afterRemoveItem(item, ii);
        return item;
    }
    async add(item, index) {
        let that = this;
        if (!item)
            return null;
        await that.lazyLoad();
        if (that._items.indexOf(item) >= 0)
            return item;
        if (index === undefined || (index < 0 && index >= that._items.length))
            index = -1;
        if (index >= 0)
            that._items.splice(index, 0, item);
        else
            that._items.push(item);
        await that._afterAddItem(item);
        return item;
    }
    async _afterRemoveItem(item, ii) { }
    async _afterAddItem(item) { }
}
exports.BaseObjectArray = BaseObjectArray;
class ObjectArray extends BaseObjectArray {
    constructor(parent, propertyName, relation, model) {
        super(parent, propertyName, relation);
        let that = this;
        that.setValue(model);
    }
    getRoot() {
        return this._parent.getRoot();
    }
    destroy() {
        let that = this;
        that._model = null;
        that.destroyItems();
        super.destroy();
    }
    destroyItems() {
        let that = this;
        that._items = null;
    }
    setValue(value) {
        let that = this;
        that.destroyItems();
        that._items = [];
        that._isNull = value === null;
        that._isUndefined = value === undefined;
        that._model = value;
    }
    async add(item, index) {
        let that = this;
        if (!item)
            return null;
        await that.lazyLoad();
        if (that._items.indexOf(item) >= 0)
            return item;
        if (index === undefined || (index < 0 && index >= that._items.length))
            index = -1;
        if (!that._model) {
            that._model = [];
            that._isNull = false;
            that._parent.model()[that._propertyName] = that._model;
        }
        let imodel = item.model();
        if (index >= 0) {
            that._items.splice(index, 0, item);
            that._model.splice(index, 0, imodel);
        }
        else {
            that._items.push(item);
            that._model.push(imodel);
        }
        await that._afterAddItem(item);
        return item;
    }
}
exports.ObjectArray = ObjectArray;
