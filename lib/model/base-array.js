"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const model_manager_1 = require("./model-manager");
class BaseObjectArray {
    constructor(parent, propertyName, relation) {
        let that = this;
        that._parent = parent;
        that._propertyName = propertyName;
        that._relation = relation;
        that._items = [];
        that._refClass = new model_manager_1.ModelManager().classByName(that._relation.model, that._relation.nameSpace);
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
        that._model = null;
        that.destroyItems();
        super.destroy();
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
}
exports.ObjectArray = ObjectArray;
