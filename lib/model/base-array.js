"use strict";
class ObjectArray {
    constructor(parent, propertyName, model) {
        let that = this;
        that._model = [];
        that._items = [];
        that.setValue(model);
    }
    getRoot() {
        let that = this;
        if (!that._rootCache)
            that._rootCache = that._parent ? that._parent.getRoot() : null;
        return that._rootCache;
    }
    getPath(item) {
        let that = this;
        return that._parent ? that._parent.getPath(that._propertyName) : that._propertyName;
    }
    propertyChanged(propName, value, oldValue, eventInfo) {
    }
    stateChanged(propName, value, oldValue, eventInfo) {
    }
    destroy() {
        let that = this;
        that.destroyItems();
        that._model = null;
        that._items = null;
        that._rootCache = null;
    }
    destroyItems() {
        let that = this;
        that._items && that._items.forEach(item => {
            item.destroy();
        });
        that._items = [];
    }
    setValue(value) {
        let that = this;
        that.destroyItems();
        that.isNull = value === null;
        that.isUndefined = value === undefined;
        that._model = value;
    }
}
