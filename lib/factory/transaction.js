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
    get context() {
        return this._ctx;
    }
    get eventInfo() {
        if (!this._eventInfo)
            this._eventInfo = new event_stack_1.EventInfoStack();
        return this._eventInfo;
    }
    constructor(ctx) {
        this._id = uuid.v1();
        this._ctx = ctx || new user_context_1.TranContext();
        this._subscribers = new Map();
        this.subscribe(interfaces_1.EventType.propChanged, model_manager_1.propagationRules);
        this.subscribe(interfaces_1.EventType.addItem, model_manager_1.addItemRules);
        this.subscribe(interfaces_1.EventType.removeItem, model_manager_1.rmvItemRules);
        this.subscribe(interfaces_1.EventType.setItems, model_manager_1.setItemsRules);
        this.subscribe(interfaces_1.EventType.propValidate, validation_1.validateAfterPropChanged);
        this.subscribe(interfaces_1.EventType.propValidate, model_manager_1.propValidateRules);
        this.subscribe(interfaces_1.EventType.objValidate, model_manager_1.objValidateRules);
        this.subscribe(interfaces_1.EventType.init, model_manager_1.initRules);
        this.subscribe(interfaces_1.EventType.saving, model_manager_1.savingRules);
        this.subscribe(interfaces_1.EventType.saved, model_manager_1.savedRules);
        this.subscribe(interfaces_1.EventType.editing, model_manager_1.editingRules);
        this.subscribe(interfaces_1.EventType.edited, model_manager_1.editedRules);
        this.subscribe(interfaces_1.EventType.removing, model_manager_1.removingRules);
        this.subscribe(interfaces_1.EventType.removed, model_manager_1.removedRules);
    }
    log(module, message, debugLevel) {
        if (debugLevel === undefined)
            debugLevel = interfaces_1.DebugLevel.message;
        console.log(message);
    }
    saveToJson() {
        const res = { instances: [], removed: [] };
        if (this._removedInstances) {
            // Classname must be saved
            res.removed = [];
            for (const item of this._removedInstances) {
                for (const instance of item[1]) {
                    res.removed.push(histria_utils_1.helper.clone(instance[1].model()));
                }
            }
        }
        if (this._instances) {
            const mm = model_manager_1.modelManager();
            mm.enumClasses(item => {
                const instances = this._instances.get(item.classOfInstance);
                if (instances) {
                    for (const ii of instances) {
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
        const mm = model_manager_1.modelManager();
        const restoreList = [];
        const npList = [];
        if (data && data.instances)
            data.instances.forEach((item) => {
                const cn = item.className.split('.');
                const factory = mm.classByName(cn[1], cn[0]);
                if (!factory)
                    throw util.format('Class not found "%s".', item.className);
                if (factory.isPersistent)
                    restoreList.push(this.restore(factory, item.data, reload));
                else
                    npList.push({ factory: factory, data: item.data });
            });
        const instances = await Promise.all(restoreList);
        for (const view of npList)
            instances.push(await this.restore(view.factory, view.data, reload));
        instances.forEach(instance => {
            instance.restored();
        });
    }
    async emitInstanceEvent(eventType, eventInfo, instance, ...args) {
        args = args || [];
        const propagate = [interfaces_1.EventType.propChanged, interfaces_1.EventType.removeItem, interfaces_1.EventType.addItem, interfaces_1.EventType.setItems, interfaces_1.EventType.editing, interfaces_1.EventType.removing].indexOf(eventType) >= 0;
        const pi = propagate && args && args.length ? 0 : -1;
        const list = this._subscribers.get(eventType);
        if (!list)
            return true;
        let res = true;
        if (propagate)
            res = await this._propagateEvent(list, eventInfo, instance, [instance], args, pi);
        else {
            for (const item of list)
                if (!await item(eventInfo, instance.constructor, [instance], args))
                    res = false;
        }
        return res;
    }
    async notifyHooks(eventType, instance, source, propertyName) {
        await this._execHooks(eventType, instance, source, [instance], propertyName);
    }
    subscribe(eventType, handler) {
        let list = this._subscribers.get(eventType);
        if (!list) {
            list = [];
            this._subscribers.set(eventType, list);
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
        const mm = model_manager_1.modelManager();
        const instance = mm.createInstance(classOfInstance, this, null, '', { _isNew: true }, { isRestore: false });
        this._addInstance(instance, classOfInstance);
        const instances = [];
        instance.enumChildren((child) => {
            instances.push(child);
        }, true);
        instances.push(instance);
        for (const inst of instances) {
            await inst.afterCreated();
        }
        if (options) {
            const inst = instance;
            inst.setInstanceOptions(options);
        }
        return instance;
    }
    async load(classOfInstance, data, options) {
        const mm = model_manager_1.modelManager();
        const instance = mm.createInstance(classOfInstance, this, null, '', data, { isRestore: false });
        this._addInstance(instance, classOfInstance);
        const instances = [];
        instance.enumChildren((child) => {
            instances.push(child);
        }, true);
        instances.push(instance);
        for (const inst of instances) {
            await inst.afterCreated();
        }
        if (options) {
            const inst = instance;
            inst.setInstanceOptions(options);
        }
        return instance;
    }
    createInstance(classOfInstance, parent, propertyName, data, isRestore) {
        const mm = model_manager_1.modelManager();
        const instance = mm.createInstance(classOfInstance, this, parent, propertyName, data, { isRestore: isRestore });
        this._addInstance(instance, classOfInstance);
        return instance;
    }
    clear() {
        const mm = model_manager_1.modelManager();
        if (this._instances) {
            mm.enumClasses(item => {
                const instances = this._instances.get(item.classOfInstance);
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
            for (const classOfInstance of this._instances) {
                const map = classOfInstance[1];
                const toDestroy = [];
                for (const ii of map) {
                    if (!ii[1].owner)
                        toDestroy.push(ii[1]);
                }
                toDestroy.forEach(instance => {
                    instance.destroy();
                });
            }
            this._instances = null;
        }
        if (this._removedInstances) {
            for (const classOfInstance of this._removedInstances) {
                const map = classOfInstance[1];
                const toDestroy = [];
                for (const ii of map) {
                    if (!ii[1].owner)
                        toDestroy.push(ii[1]);
                }
                toDestroy.forEach(instance => {
                    instance.destroy();
                });
            }
            this._removedInstances = null;
        }
    }
    destroy() {
        this.clear();
        if (this._eventInfo) {
            this._eventInfo.destroy();
            this._eventInfo = null;
        }
        this._subscribers = null;
        this._ctx = null;
    }
    async find(classOfInstance, filter, options) {
        let res = await this._find(filter, classOfInstance);
        if (!classOfInstance.isPersistent)
            return res || [];
        if (!options || !options.onlyInCache) {
            const store = this._store(classOfInstance);
            if (store) {
                const list = await store.find(classOfInstance.entityName, filter, { compositions: false });
                if (list && list.length) {
                    const map = {};
                    const instances = this._getInstances(classOfInstance);
                    const promises = [];
                    let byClass;
                    if (this._removedInstances) {
                        byClass = this._removedInstances.get(classOfInstance);
                    }
                    list.forEach(item => {
                        const key = item.id + '';
                        if (byClass && byClass.get(key))
                            return;
                        const o = instances ? instances.get(key) : null;
                        if (o && res.indexOf(o) < 0)
                            return;
                        map[key] = true;
                        promises.push(o ? Promise.resolve(o) : this.load(classOfInstance, item));
                    });
                    const dbList = await Promise.all(promises);
                    if (res)
                        res.forEach(item => {
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
        options = options || {};
        const res = this._findOne(filter, classOfInstance);
        if (res)
            return res;
        if (!classOfInstance.isPersistent)
            return res;
        if (!options || !options.onlyInCache) {
            const store = this._store(classOfInstance);
            if (store) {
                const instances = this._getInstances(classOfInstance);
                const data = await store.findOne(classOfInstance.entityName, filter, { compositions: true });
                if (data) {
                    const key = data.id + '';
                    if (this._removedInstances) {
                        const byClass = this._removedInstances.get(classOfInstance);
                        if (byClass) {
                            const inst = byClass.get(key);
                            if (inst)
                                return null;
                        }
                    }
                    const o = instances ? instances.get(key) : null;
                    if (o)
                        return null;
                    return this.load(classOfInstance, data);
                }
            }
        }
        return null;
    }
    removeInstance(instance) {
        if (this._instances) {
            const byClass = this._instances.get(instance.constructor);
            if (byClass)
                byClass.delete(instance.uuid);
        }
        if (this._removedInstances) {
            const byClass = this._removedInstances.get(instance.constructor);
            if (byClass)
                byClass.delete(instance.uuid);
        }
    }
    remove(instance) {
        this._removedInstances = this._removedInstances || new Map();
        let instances = this._removedInstances.get(instance.constructor);
        if (!instances) {
            instances = new Map();
            this._removedInstances.set(instance.constructor, instances);
        }
        instances.set(instance.uuid, instance);
    }
    async restore(classOfInstance, data, reload) {
        const mm = model_manager_1.modelManager();
        data = data || {};
        if (reload && classOfInstance.isPersistent && !data._isDirty) {
            const store = this._store(classOfInstance);
            if (store) {
                const cd = await store.find(classOfInstance.entityName, { id: data.id }, { compositions: true });
                if (cd)
                    return this.restore(classOfInstance, cd, false);
            }
        }
        const instance = mm.createInstance(classOfInstance, this, null, '', data, { isRestore: true });
        this._addInstance(instance, classOfInstance);
        const instances = [];
        instance.enumChildren((child) => {
            instances.push(child);
        }, true);
        instances.push(instance);
        for (const inst of instances)
            inst.afterRestore();
        return instance;
    }
    async _propagateEvent(list, eventInfo, instance, nInstances, args, argIndex) {
        let res = true;
        for (const item of list) {
            if (!await item(eventInfo, instance.constructor, nInstances, args))
                res = false;
        }
        const listeners = instance.getListeners(eventInfo.isLazyLoading);
        for (const listener of listeners) {
            const children = nInstances.slice();
            const newArgs = args.slice();
            newArgs[argIndex] = listener.propertyName + '.' + newArgs[argIndex];
            children.unshift(listener.instance);
            if (!await this._propagateEvent(list, eventInfo, listener.instance, children, newArgs, argIndex))
                res = false;
        }
        return res;
    }
    async _execHooks(eventType, instance, source, nInstances, propertyName) {
        const inst = instance;
        await inst.execHooks(propertyName, eventType, source);
        const listeners = instance.getListeners(false);
        for (const listener of listeners) {
            const children = nInstances.slice();
            const pn = listener.propertyName + '.' + propertyName;
            children.unshift(listener.instance);
            await this._execHooks(eventType, listener.instance, source, children, pn);
        }
    }
    _addInstance(instance, classOfInstance) {
        this._instances = this._instances || new Map();
        let instances = this._instances.get(classOfInstance);
        if (!instances) {
            instances = new Map();
            this._instances.set(classOfInstance, instances);
        }
        instances.set(instance.uuid, instance);
    }
    _getInstances(classOfInstance) {
        if (!this._instances)
            return null;
        return this._instances.get(classOfInstance);
    }
    _getRemovedInstances(classOfInstance) {
        if (!this._removedInstances)
            return null;
        return this._removedInstances.get(classOfInstance);
    }
    _findById(id, classOfInstance) {
        const instances = this._getInstances(classOfInstance);
        return instances ? instances.get(id + '') : null;
    }
    _findOne(query, classOfInstance) {
        if (query.id && typeof query.id !== 'object')
            return this._findById(query.id, classOfInstance);
        const instances = this._getInstances(classOfInstance);
        if (!instances)
            return null;
        return histria_utils_1.findInMap(query, instances, { findFirst: true, transform: (item) => item.model() });
    }
    async _find(filter, classOfInstance) {
        const instances = this._getInstances(classOfInstance);
        if (!instances)
            return [];
        return histria_utils_1.findInMap(filter, instances, { findFirst: false, transform: (item) => item.model() });
    }
    _store(classOfInstance) {
        const nameSpace = classOfInstance.nameSpace;
        if (!nameSpace)
            return null;
        return histria_utils_1.dbManager().store(nameSpace);
    }
}
exports.Transaction = Transaction;

//# sourceMappingURL=transaction.js.map
