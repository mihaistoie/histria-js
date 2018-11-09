"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util = require("util");
const uuid = require("uuid");
const model_manager_1 = require("../model/model-manager");
const validation_1 = require("./validation");
const histria_utils_1 = require("histria-utils");
const user_context_1 = require("./user-context");
const interfaces_1 = require("../model/interfaces");
const event_stack_1 = require("./divers/event-stack");
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
        that.subscribe(interfaces_1.EventType.saving, model_manager_1.savingRules);
        that.subscribe(interfaces_1.EventType.saved, model_manager_1.savedRules);
        that.subscribe(interfaces_1.EventType.editing, model_manager_1.editingRules);
        that.subscribe(interfaces_1.EventType.edited, model_manager_1.editedRules);
        that.subscribe(interfaces_1.EventType.removing, model_manager_1.removingRules);
        that.subscribe(interfaces_1.EventType.removed, model_manager_1.removedRules);
    }
    get context() {
        return this._ctx;
    }
    log(module, message, debugLevel) {
        if (debugLevel === undefined)
            debugLevel = interfaces_1.DebugLevel.message;
        console.log(message);
    }
    get eventInfo() {
        let that = this;
        if (!that._eventInfo)
            that._eventInfo = new event_stack_1.EventInfoStack();
        return this._eventInfo;
    }
    saveToJson() {
        const that = this;
        const res = { instances: [], removed: [] };
        const mm = model_manager_1.modelManager();
        if (that._removedInstances) {
            // Classname must be saved
            res.removed = [];
            for (let item of that._removedInstances) {
                for (let instance of item[1]) {
                    res.removed.push(histria_utils_1.helper.clone(instance[1].model()));
                }
            }
        }
        if (that._instances) {
            let mm = model_manager_1.modelManager();
            mm.enumClasses(item => {
                let instances = that._instances.get(item.classOfInstance);
                if (instances) {
                    for (let ii of instances) {
                        const instance = ii[1];
                        if (!instance.owner)
                            res.instances.push({ className: item.className, data: histria_utils_1.helper.clone(instance.model()) });
                    }
                }
            });
        }
        return res;
    }
    async loadFromJson(data, reload) {
        const that = this;
        const mm = model_manager_1.modelManager();
        const restoreList = [];
        const npList = [];
        data && data.instances.forEach((item) => {
            const cn = item.className.split('.');
            const factory = mm.classByName(cn[1], cn[0]);
            if (!factory)
                throw util.format('Class not found "%s".', item.className);
            if (factory.isPersistent)
                restoreList.push(that.restore(factory, item.data, reload));
            else
                npList.push({ factory: factory, data: item.data });
        });
        const instances = await Promise.all(restoreList);
        for (const view of npList)
            instances.push(await that.restore(view.factory, view.data, reload));
        instances.forEach(instance => {
            instance.restored();
        });
    }
    async _propagateEvent(list, eventInfo, instance, nInstances, args, argIndex) {
        const that = this;
        let res = true;
        for (let item of list) {
            if (!await item(eventInfo, instance.constructor, nInstances, args))
                res = false;
        }
        const listeners = instance.getListeners(eventInfo.isLazyLoading);
        for (let listener of listeners) {
            let children = nInstances.slice();
            let newArgs = args.slice();
            newArgs[argIndex] = listener.propertyName + '.' + newArgs[argIndex];
            children.unshift(listener.instance);
            if (!await that._propagateEvent(list, eventInfo, listener.instance, children, newArgs, argIndex))
                res = false;
        }
        return res;
    }
    async emitInstanceEvent(eventType, eventInfo, instance, ...args) {
        let that = this;
        args = args || [];
        let propagate = [interfaces_1.EventType.propChanged, interfaces_1.EventType.removeItem, interfaces_1.EventType.addItem, interfaces_1.EventType.setItems, interfaces_1.EventType.editing, interfaces_1.EventType.removing].indexOf(eventType) >= 0;
        const pi = propagate && args && args.length ? 0 : -1;
        const list = that._subscribers.get(eventType);
        if (!list)
            return true;
        let res = true;
        if (propagate)
            res = await that._propagateEvent(list, eventInfo, instance, [instance], args, pi);
        else {
            for (let item of list)
                if (!await item(eventInfo, instance.constructor, [instance], args))
                    res = false;
        }
        return res;
    }
    async notifyHooks(eventType, instance, source, propertyName) {
        const that = this;
        await that._execHooks(eventType, instance, source, [instance], propertyName);
    }
    async _execHooks(eventType, instance, source, nInstances, propertyName) {
        const that = this;
        const inst = instance;
        await inst.execHooks(propertyName, eventType, source);
        const listeners = instance.getListeners(false);
        for (let listener of listeners) {
            let children = nInstances.slice();
            const pn = listener.propertyName + '.' + propertyName;
            children.unshift(listener.instance);
            await that._execHooks(eventType, listener.instance, source, children, pn);
        }
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
    async save() {
        return Promise.resolve();
    }
    async cancel() {
        return Promise.resolve();
    }
    async create(classOfInstance, options) {
        let that = this;
        let mm = model_manager_1.modelManager();
        let instance = mm.createInstance(classOfInstance, this, null, '', { _isNew: true }, { isRestore: false });
        that._addInstance(instance, classOfInstance);
        let instances = [];
        instance.enumChildren((child) => {
            instances.push(child);
        }, true);
        instances.push(instance);
        for (let inst of instances) {
            await inst.afterCreated();
        }
        if (options) {
            const inst = instance;
            inst.setInstanceOptions(options);
        }
        return instance;
    }
    async load(classOfInstance, data, options) {
        let mm = model_manager_1.modelManager();
        let that = this;
        let instance = mm.createInstance(classOfInstance, this, null, '', data, { isRestore: false });
        that._addInstance(instance, classOfInstance);
        let instances = [];
        instance.enumChildren((child) => {
            instances.push(child);
        }, true);
        instances.push(instance);
        for (let inst of instances) {
            await inst.afterCreated();
        }
        if (options) {
            const inst = instance;
            inst.setInstanceOptions(options);
        }
        return instance;
    }
    createInstance(classOfInstance, parent, propertyName, data, isRestore) {
        let mm = model_manager_1.modelManager();
        let that = this;
        let instance = mm.createInstance(classOfInstance, this, parent, propertyName, data, { isRestore: isRestore });
        that._addInstance(instance, classOfInstance);
        return instance;
    }
    clear() {
        const that = this;
        const mm = model_manager_1.modelManager();
        if (that._instances) {
            mm.enumClasses(item => {
                let instances = that._instances.get(item.classOfInstance);
                if (instances) {
                    const toDestroy = [];
                    for (const ii of instances) {
                        if (!ii[1].owner)
                            toDestroy.push(ii[1]);
                    }
                    toDestroy.forEach(instance => {
                        instance.destroy();
                    });
                }
            });
            for (let classOfInstance of that._instances) {
                let map = classOfInstance[1];
                let toDestroy = [];
                for (const ii of map) {
                    if (!ii[1].owner)
                        toDestroy.push(ii[1]);
                }
                toDestroy.forEach(instance => {
                    instance.destroy();
                });
            }
            that._instances = null;
        }
        if (that._removedInstances) {
            for (let classOfInstance of that._removedInstances) {
                let map = classOfInstance[1];
                let toDestroy = [];
                for (const ii of map) {
                    if (!ii[1].owner)
                        toDestroy.push(ii[1]);
                }
                toDestroy.forEach(instance => {
                    instance.destroy();
                });
            }
            that._removedInstances = null;
        }
    }
    destroy() {
        let that = this;
        that.clear();
        if (that._eventInfo) {
            that._eventInfo.destroy();
            that._eventInfo = null;
        }
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
    async find(classOfInstance, filter, options) {
        let that = this;
        let res = await that._find(filter, classOfInstance);
        if (!classOfInstance.isPersistent)
            return res || [];
        if (!options || !options.onlyInCache) {
            let store = that._store(classOfInstance);
            if (store) {
                let list = await store.find(classOfInstance.entityName, filter, { compositions: false });
                if (list && list.length) {
                    let map = {};
                    let instances = that._getInstances(classOfInstance);
                    let promises = [];
                    let byClass;
                    if (that._removedInstances) {
                        byClass = that._removedInstances.get(classOfInstance);
                    }
                    list.forEach(item => {
                        const key = item.id + '';
                        if (byClass && byClass.get(key))
                            return;
                        let o = instances ? instances.get(key) : null;
                        if (o && res.indexOf(o) < 0)
                            return;
                        map[key] = true;
                        promises.push(o ? Promise.resolve(o) : that.load(classOfInstance, item));
                    });
                    let dbList = await Promise.all(promises);
                    res && res.forEach(item => {
                        if (!map[item.uuid])
                            dbList.push(item);
                    });
                    res = dbList;
                }
            }
        }
        return res || [];
    }
    findOneInCache(classOfInstance, filter) {
        return this._findOne(filter, classOfInstance);
    }
    async findOne(classOfInstance, filter, options) {
        const that = this;
        options = options || {};
        let res = that._findOne(filter, classOfInstance);
        if (res)
            return res;
        if (!classOfInstance.isPersistent)
            return res;
        if (!options || !options.onlyInCache) {
            let store = that._store(classOfInstance);
            if (store) {
                let instances = that._getInstances(classOfInstance);
                let data = await store.findOne(classOfInstance.entityName, filter, { compositions: true });
                if (data) {
                    const key = data.id + '';
                    if (that._removedInstances) {
                        const byClass = that._removedInstances.get(classOfInstance);
                        if (byClass) {
                            const inst = byClass.get(key);
                            if (inst)
                                return null;
                        }
                    }
                    let o = instances ? instances.get(key) : null;
                    if (o)
                        return null;
                    return await that.load(classOfInstance, data);
                }
            }
        }
        return null;
    }
    removeInstance(instance) {
        const that = this;
        if (that._instances) {
            const byClass = that._instances.get(instance.constructor);
            if (byClass)
                byClass.delete(instance.uuid);
        }
        if (that._removedInstances) {
            const byClass = that._removedInstances.get(instance.constructor);
            if (byClass)
                byClass.delete(instance.uuid);
        }
    }
    remove(instance) {
        let that = this;
        that._removedInstances = that._removedInstances || new Map();
        let instances = that._removedInstances.get(instance.constructor);
        if (!instances) {
            instances = new Map();
            that._removedInstances.set(instance.constructor, instances);
        }
        instances.set(instance.uuid, instance);
    }
    async restore(classOfInstance, data, reload) {
        const that = this;
        const mm = model_manager_1.modelManager();
        data = data || {};
        if (reload && classOfInstance.isPersistent && !data._isDirty) {
            let store = that._store(classOfInstance);
            if (store) {
                let cd = await store.find(classOfInstance.entityName, { id: data.id }, { compositions: true });
                if (cd)
                    return that.restore(classOfInstance, cd, false);
            }
        }
        let instance = mm.createInstance(classOfInstance, this, null, '', data, { isRestore: true });
        that._addInstance(instance, classOfInstance);
        let instances = [];
        instance.enumChildren((child) => {
            instances.push(child);
        }, true);
        instances.push(instance);
        for (let inst of instances)
            inst.afterRestore();
        return instance;
    }
    _getInstances(classOfInstance) {
        let that = this;
        if (!that._instances)
            return null;
        return that._instances.get(classOfInstance);
    }
    _getRemovedInstances(classOfInstance) {
        let that = this;
        if (!that._removedInstances)
            return null;
        return that._removedInstances.get(classOfInstance);
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
        return histria_utils_1.findInMap(query, instances, { findFirst: true, transform: (item) => { return item.model(); } });
    }
    async _find(filter, classOfInstance) {
        let that = this;
        let instances = that._getInstances(classOfInstance);
        if (!instances)
            return [];
        return histria_utils_1.findInMap(filter, instances, { findFirst: false, transform: (item) => { return item.model(); } });
    }
    _store(classOfInstance) {
        let nameSpace = classOfInstance.nameSpace;
        if (!nameSpace)
            return null;
        return histria_utils_1.dbManager().store(nameSpace);
    }
}
exports.Transaction = Transaction;

//# sourceMappingURL=transaction.js.map
