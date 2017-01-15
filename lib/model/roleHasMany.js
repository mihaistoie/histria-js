"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const model_manager_1 = require('./model-manager');
const base_array_1 = require('./base-array');
const schema_utils_1 = require('../schema/schema-utils');
const schema_consts_1 = require('../schema/schema-consts');
class HasManyComposition extends base_array_1.ObjectArray {
    constructor(parent, propertyName, relation, model) {
        super(parent, propertyName, relation, model);
        let that = this;
        that._refClass = new model_manager_1.ModelManager().classByName(that._relation.model, that._relation.nameSpace);
    }
    destroy() {
        let that = this;
        that._refClass = null;
        super.destroy();
    }
    toArray() {
        return __awaiter(this, void 0, void 0, function* () {
            let that = this;
            yield that.lazyLoad();
            return that._items.slice();
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
            that._model.splice(ii, 1);
            if (!that._model.length) {
                that._model = null;
                that._parent.model()[that._propertyName] = that._model;
            }
            if (item) {
                let lmodel = item.model();
                schema_utils_1.updateRoleRefs(that._relation, lmodel, null, true);
                yield item.changeParent(null, that._relation.invRel || schema_consts_1.DEFAULT_PARENT_NAME, true);
            }
            that._isNull = (that._model === null);
            return null;
        });
    }
    add(item, index) {
        return __awaiter(this, void 0, void 0, function* () {
            let that = this;
            if (!item)
                return;
            yield that.lazyLoad();
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
            if (item) {
                let lmodel = item.model();
                let rmodel = that._parent.model();
                schema_utils_1.updateRoleRefs(that._relation, lmodel, rmodel, true);
                yield item.changeParent(that._parent, that._relation.invRel || schema_consts_1.DEFAULT_PARENT_NAME, true);
            }
            return item;
        });
    }
    indexOf(item) {
        return __awaiter(this, void 0, void 0, function* () {
            let that = this;
            yield that.lazyLoad();
            return (that._items || []).indexOf(item);
        });
    }
    lazyLoad() {
        return __awaiter(this, void 0, void 0, function* () {
            let that = this;
            if (!that._parent)
                return;
            if (that._isUndefined) {
                let lmodel = that._parent.model();
                let query = {}, valueIsNull = false;
                that._relation.localFields.forEach((field, index) => {
                    let ff = that._relation.foreignFields[index];
                    let value = lmodel[field];
                    if (value === null || value === '' || value === undefined)
                        valueIsNull = true;
                    else
                        query[ff] = value;
                });
                if (valueIsNull) {
                    that._model = [];
                }
                else {
                    let items = yield that._parent.transaction.find(query, that._refClass);
                    if (items.length) {
                        that._model = new Array(items.length);
                        that._items = new Array(items.length);
                        for (let index = 0; index < items.length; index++) {
                            let item = items[index];
                            let model = item.model();
                            that._model[index] = model;
                            that._items[index] = item;
                            yield item.changeParent(that._parent, that._relation.invRel || schema_consts_1.DEFAULT_PARENT_NAME, false);
                        }
                    }
                    else
                        that._model = null;
                }
                that._isUndefined = false;
                that._isNull = that._model === null;
                lmodel[that._propertyName] = that._model;
            }
        });
    }
}
exports.HasManyComposition = HasManyComposition;
