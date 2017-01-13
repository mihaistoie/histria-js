"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
class ObjectArray {
    constructor(parent, propertyName, relation, model) {
        let that = this;
        that._parent = parent;
        that._propertyName = propertyName;
        that._relation = relation;
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
        that._relation = null;
        that._parent = null;
        that._rootCache = null;
    }
    destroyItems() {
        let that = this;
        that._items && that._items.forEach(item => {
            //TODO: remove item from cache
            //item.destroy();
        });
        that._items = [];
    }
    setValue(value) {
        let that = this;
        that.destroyItems();
        that._isNull = value === null;
        that._isUndefined = value === undefined;
        that._model = value;
    }
    lazyLoad() {
        return __awaiter(this, void 0, void 0, function* () {
            return Promise.resolve();
        });
    }
}
exports.ObjectArray = ObjectArray;
