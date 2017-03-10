"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
    lazyLoad() {
        return __awaiter(this, void 0, void 0, function* () {
            return Promise.resolve();
        });
    }
    toArray() {
        return __awaiter(this, void 0, void 0, function* () {
            let that = this;
            yield that.lazyLoad();
            return that._items.slice();
        });
    }
    indexOf(item) {
        return __awaiter(this, void 0, void 0, function* () {
            let that = this;
            yield that.lazyLoad();
            return (that._items || []).indexOf(item);
        });
    }
    remove(element) {
        return __awaiter(this, void 0, void 0, function* () {
            let that = this;
            yield that.lazyLoad();
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
            yield that._afterRemoveItem(item, ii);
            return item;
        });
    }
    add(item, index) {
        return __awaiter(this, void 0, void 0, function* () {
            let that = this;
            if (!item)
                return null;
            yield that.lazyLoad();
            if (that._items.indexOf(item) >= 0)
                return item;
            if (index === undefined || (index < 0 && index >= that._items.length))
                index = -1;
            if (index >= 0)
                that._items.splice(index, 0, item);
            else
                that._items.push(item);
            yield that._afterAddItem(item);
            return item;
        });
    }
    _afterRemoveItem(item, ii) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    _afterAddItem(item) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
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
    add(item, index) {
        return __awaiter(this, void 0, void 0, function* () {
            let that = this;
            if (!item)
                return null;
            yield that.lazyLoad();
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
                that._model.push(that._model);
            }
            yield that._afterAddItem(item);
            return item;
        });
    }
}
exports.ObjectArray = ObjectArray;
