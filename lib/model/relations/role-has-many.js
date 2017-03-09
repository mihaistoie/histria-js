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
const interfaces_1 = require("../interfaces");
const base_array_1 = require("./base-array");
const histria_utils_1 = require("histria-utils");
const histria_utils_2 = require("histria-utils");
class HasManyComposition extends base_array_1.ObjectArray {
    constructor(parent, propertyName, relation, model) {
        super(parent, propertyName, relation, model);
        let that = this;
        let isRestore = that._parent.status === interfaces_1.ObjectStatus.restoring;
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
    _removed(item, notifyRemove) {
        return __awaiter(this, void 0, void 0, function* () {
            let that = this;
            let lmodel = item.model();
            histria_utils_1.schemaUtils.updateRoleRefs(that._relation, lmodel, null, true);
            yield item.changeParent(null, that._propertyName, that._relation.invRel || histria_utils_2.DEFAULT_PARENT_NAME, true);
            if (notifyRemove)
                yield that._parent.notifyOperation(that._propertyName, interfaces_1.EventType.removeItem, item);
        });
    }
    _added(item, notifyAdd) {
        return __awaiter(this, void 0, void 0, function* () {
            let that = this;
            let lmodel = item.model();
            let rmodel = that._parent.model();
            histria_utils_1.schemaUtils.updateRoleRefs(that._relation, lmodel, rmodel, true);
            yield item.changeParent(that._parent, that._propertyName, that._relation.invRel || histria_utils_2.DEFAULT_PARENT_NAME, true);
            if (notifyAdd)
                yield that._parent.notifyOperation(that._propertyName, interfaces_1.EventType.addItem, item);
        });
    }
    _afterRemoveItem(item, ii) {
        return __awaiter(this, void 0, void 0, function* () {
            let that = this;
            that._model.splice(ii, 1);
            if (!that._model.length) {
                that._model = null;
                that._parent.model()[that._propertyName] = that._model;
            }
            if (item)
                yield that._removed(item, true);
            that._isNull = (that._model === null);
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
            if (item)
                yield that._added(item, true);
            return item;
        });
    }
    set(items) {
        return __awaiter(this, void 0, void 0, function* () {
            let that = this;
            yield that.lazyLoad();
            for (let item of that._items) {
                yield that._removed(item, false);
            }
            that._items = [];
            if (items && items.length) {
                that._model = [];
                for (let item of items) {
                    let imodel = item.model();
                    that._model.push(imodel);
                    that._items.push(item);
                    yield that._added(item, false);
                }
            }
            else {
                that._model = null;
            }
            that._isNull = (that._model === null);
            that._parent.model()[that._propertyName] = that._model;
            yield that._parent.notifyOperation(that._propertyName, interfaces_1.EventType.setItems, null);
        });
    }
    lazyLoad() {
        return __awaiter(this, void 0, void 0, function* () {
            let that = this;
            if (!that._parent)
                return;
            if (that._isUndefined) {
                let lmodel = that._parent.model();
                var query = histria_utils_1.schemaUtils.roleToQuery(that._relation, lmodel);
                if (query) {
                    let opts = { onlyInCache: that._parent.isNew };
                    let items = yield that._parent.transaction.find(that._refClass, query, opts);
                    if (items.length) {
                        that._model = new Array(items.length);
                        that._items = new Array(items.length);
                        for (let index = 0; index < items.length; index++) {
                            let item = items[index];
                            let model = item.model();
                            that._model[index] = model;
                            that._items[index] = item;
                            yield item.changeParent(that._parent, that._propertyName, that._relation.invRel || histria_utils_2.DEFAULT_PARENT_NAME, false);
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
        });
    }
    destroy() {
        let that = this;
        that._items && that._items.forEach(item => {
            item.destroy();
        });
        that._items = null;
        super.destroy();
    }
}
exports.HasManyComposition = HasManyComposition;
class HasManyAggregation extends base_array_1.BaseObjectArray {
    _afterRemoveItem(item, ii) {
        return __awaiter(this, void 0, void 0, function* () {
            let that = this;
            if (item) {
                let lmodel = item.model();
                histria_utils_1.schemaUtils.updateRoleRefs(that._relation, lmodel, null, true);
                let r = item.getRoleByName(that._relation.invRel);
                if (r)
                    yield r.internalSetValueAndNotify(null, item);
                yield that._parent.notifyOperation(that._propertyName, interfaces_1.EventType.removeItem, item);
            }
        });
    }
    _afterAddItem(item) {
        return __awaiter(this, void 0, void 0, function* () {
            let that = this;
            let lmodel = item.model();
            let rmodel = that._parent.model();
            let r = item.getRoleByName(that._relation.invRel);
            if (r)
                yield r.internalSetValueAndNotify(that._parent, item);
            yield that._parent.notifyOperation(that._propertyName, interfaces_1.EventType.addItem, item);
        });
    }
    lazyLoad() {
        return __awaiter(this, void 0, void 0, function* () {
            let that = this;
            if (!that._parent)
                return;
            if (!that._loaded) {
                that._loaded = true;
                let query = histria_utils_1.schemaUtils.roleToQuery(that._relation, that._parent.model());
                if (query) {
                    let opts = { onlyInCache: false };
                    let items = yield that._parent.transaction.find(that._refClass, query);
                    if (items.length) {
                        that._items = new Array(items.length);
                        for (let index = 0; index < items.length; index++) {
                            let item = items[index];
                            that._items[index] = item;
                            yield that._updateInvSideAfterLazyLoading(item);
                        }
                    }
                }
            }
        });
    }
    _updateInvSideAfterLazyLoading(newValue) {
        return __awaiter(this, void 0, void 0, function* () {
            //after lazy loading
            let that = this;
            if (newValue) {
                //roleInv is AggregationBelongsTo
                let roleInv = newValue.getRoleByName(that._relation.invRel);
                if (roleInv)
                    roleInv.internalSetValue(that._parent);
            }
        });
    }
}
exports.HasManyAggregation = HasManyAggregation;
