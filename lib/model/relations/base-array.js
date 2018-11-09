"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const role_1 = require("./role");
class BaseObjectArray extends role_1.RoleBase {
    constructor(parent, propertyName, relation) {
        super(parent, propertyName, relation);
        this._items = [];
    }
    destroy() {
        this._items = null;
        super.destroy();
    }
    async toArray() {
        await this.lazyLoad();
        return this._items.slice();
    }
    async indexOf(item) {
        await this.lazyLoad();
        return (this._items || []).indexOf(item);
    }
    async remove(element) {
        await this.lazyLoad();
        let ii;
        let item;
        if (typeof element === 'number') {
            ii = element;
            if (ii >= 0 && ii < this._items.length) {
                item = this._items[ii];
            }
            else {
                ii = -1;
                item = null;
            }
        }
        else {
            item = element;
            ii = this._items.indexOf(item);
            if (ii < 0)
                item = null;
        }
        if (!item)
            return null;
        this._items.splice(ii, 1);
        await this._afterItemRemoved(item, ii);
        return item;
    }
    async add(item, index) {
        if (!item)
            return null;
        await this.lazyLoad();
        if (this._items.indexOf(item) >= 0)
            return item;
        if (index === undefined || (index < 0 && index >= this._items.length))
            index = -1;
        if (index >= 0)
            this._items.splice(index, 0, item);
        else
            this._items.push(item);
        await this._afterItemAdded(item);
        return item;
    }
    // tslint:disable-next-line:no-empty
    _checkValueBeforeAdd(value) { }
    async lazyLoad() {
        return Promise.resolve();
    }
    // tslint:disable-next-line:no-empty
    async _afterItemRemoved(item, ii) { }
    // tslint:disable-next-line:no-empty
    async _afterItemAdded(item) { }
}
exports.BaseObjectArray = BaseObjectArray;
// tslint:disable-next-line:max-classes-per-file
class ObjectArray extends BaseObjectArray {
    constructor(parent, propertyName, relation, model) {
        super(parent, propertyName, relation);
        this.setValue(model);
    }
    getRoot() {
        return this._parent.getRoot();
    }
    async add(item, index) {
        this._checkValueBeforeAdd(item);
        if (!item)
            return null;
        await this.lazyLoad();
        if (this._items.indexOf(item) >= 0)
            return item;
        if (index === undefined || (index < 0 && index >= this._items.length))
            index = -1;
        if (!this._model) {
            this._model = [];
            this._isNull = false;
            this._parent.model()[this._propertyName] = this._model;
        }
        const imodel = this._itemModel(item);
        if (index >= 0) {
            this._items.splice(index, 0, item);
            this._model.splice(index, 0, imodel);
        }
        else {
            this._items.push(item);
            this._model.push(imodel);
        }
        await this._afterItemAdded(item);
        return item;
    }
    destroy() {
        this._model = null;
        this.destroyItems();
        super.destroy();
    }
    destroyItems() {
        this._items = null;
    }
    setValue(value) {
        this.destroyItems();
        this._items = [];
        this._isNull = value === null;
        this._isUndefined = value === undefined;
        this._model = value;
    }
    _itemModel(item) {
        return item.model();
    }
}
exports.ObjectArray = ObjectArray;

//# sourceMappingURL=base-array.js.map
