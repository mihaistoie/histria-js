"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const uuid = require("uuid");
const model_manager_1 = require("../model/model-manager");
const validation_1 = require("../model/validation");
const mongo_filter_1 = require("../db/mongo-filter");
const user_context_1 = require("./user-context");
const interfaces_1 = require("../model/interfaces");
class Transaction {
    constructor(ctx) {
        let that = this;
        that._id = uuid.v1();
        that._ctx = ctx || new user_context_1.TranContext();
        that._subscribers = new Map();
        that.subscribe(interfaces_1.EventType.propChanged, model_manager_1.propagationRules);
        that.subscribe(interfaces_1.EventType.addItem, model_manager_1.addItemRules);
        that.subscribe(interfaces_1.EventType.removeItem, model_manager_1.rmvItemRules);
        that.subscribe(interfaces_1.EventType.setItems, model_manager_1.setItemsRules);
        that.subscribe(interfaces_1.EventType.propValidate, validation_1.validateAfterPropChanged);
        that.subscribe(interfaces_1.EventType.propValidate, model_manager_1.propValidateRules);
        that.subscribe(interfaces_1.EventType.objValidate, model_manager_1.objValidateRules);
        that.subscribe(interfaces_1.EventType.init, model_manager_1.initRules);
    }
    get context() {
        return this._ctx;
    }
    emitInstanceEvent(eventType, eventInfo, instance, ...args) {
        return __awaiter(this, void 0, void 0, function* () {
            let that = this;
            let ci = instance;
            args = args || [];
            let nIstances = [ci];
            let propagate = [interfaces_1.EventType.propChanged, interfaces_1.EventType.removeItem, interfaces_1.EventType.addItem, interfaces_1.EventType.setItems].indexOf(eventType) >= 0;
            let pi = propagate && args && args.length ? 0 : -1;
            let list = that._subscribers.get(eventType);
            if (list) {
                while (ci) {
                    for (let item of list)
                        yield item(eventInfo, ci.constructor, nIstances, args);
                    if (!propagate)
                        break;
                    //XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
                    //TODO code review
                    args[pi] = ci.propertyName + '.' + args[pi];
                    ci = ci.parent;
                    //XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
                    nIstances.unshift(ci);
                }
            }
        });
    }
    subscribe(eventType, handler) {
        let that = this;
        let list = that._subscribers.get(eventType);
        if (!list) {
            list = [];
            that._subscribers.set(eventType, list);
        }
        list.push(handler);
    }
    create(classOfInstance) {
        return __awaiter(this, void 0, void 0, function* () {
            let that = this;
            let mm = new model_manager_1.ModelManager();
            let instance = mm.createInstance(classOfInstance, this, null, '', { $isNew: true }, { isRestore: true });
            that._addInstance(instance, classOfInstance);
            yield instance.afterCreated();
            return instance;
        });
    }
    restore(classOfInstance, data) {
        return __awaiter(this, void 0, void 0, function* () {
            let mm = new model_manager_1.ModelManager();
            let that = this;
            data = data || {};
            let instance = mm.createInstance(classOfInstance, this, null, '', data, { isRestore: true });
            that._addInstance(instance, classOfInstance);
            yield instance.afterCreated();
            return instance;
        });
    }
    load(classOfInstance, data) {
        return __awaiter(this, void 0, void 0, function* () {
            let mm = new model_manager_1.ModelManager();
            let that = this;
            let instance = mm.createInstance(classOfInstance, this, null, '', data, { isRestore: false });
            that._addInstance(instance, classOfInstance);
            yield instance.afterCreated();
            return instance;
        });
    }
    createInstance(classOfInstance, parent, propertyName, data, isRestore) {
        let mm = new model_manager_1.ModelManager();
        let that = this;
        let instance = mm.createInstance(classOfInstance, this, parent, propertyName, data, { isRestore: isRestore });
        that._addInstance(instance, classOfInstance);
        return instance;
    }
    destroy() {
        let that = this;
        that._subscribers = null;
        that._ctx = null;
    }
    _addInstance(instance, classOfInstance) {
        let that = this;
        that._instances = that._instances || new Map();
        let instances = that._instances.get(classOfInstance);
        if (!instances) {
            instances = new Map();
            that._instances.set(classOfInstance, instances);
        }
        instances.set(instance.uuid, instance);
    }
    find(classOfInstance, filter) {
        return __awaiter(this, void 0, void 0, function* () {
            let that = this;
            let res = that._find(filter, classOfInstance);
            if (res)
                return res;
            //TODO use persistence
            return [];
        });
    }
    findOne(classOfInstance, filter) {
        return __awaiter(this, void 0, void 0, function* () {
            let that = this;
            let res = yield that._findOne(filter, classOfInstance);
            if (res)
                return res;
            //TODO use persistence
            return null;
        });
    }
    _getInstances(classOfInstance) {
        let that = this;
        if (!that._instances)
            return null;
        return that._instances.get(classOfInstance);
    }
    _findById(id, classOfInstance) {
        let that = this;
        let instances = that._getInstances(classOfInstance);
        return instances ? instances.get(id + '') : null;
    }
    _findOne(query, classOfInstance) {
        let that = this;
        if (query.id && typeof query.id !== 'object')
            return that._findById(query.id, classOfInstance);
        let instances = that._getInstances(classOfInstance);
        if (!instances)
            return null;
        return mongo_filter_1.findInMap(query, instances, { findFirst: true, transform: (item) => { return item.model(); } });
    }
    _find(filter, classOfInstance) {
        return __awaiter(this, void 0, void 0, function* () {
            let that = this;
            let instances = that._getInstances(classOfInstance);
            if (!instances)
                return [];
            return mongo_filter_1.findInMap(filter, instances, { findFirst: false, transform: (item) => { return item.model(); } });
        });
    }
}
exports.Transaction = Transaction;
