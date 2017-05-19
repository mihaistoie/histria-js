import * as util from 'util';
import * as uuid from 'uuid';
import {
    modelManager, propagationRules, propValidateRules, objValidateRules, addItemRules,
    rmvItemRules, setItemsRules, initRules, editedRules, editingRules, savedRules, savingRules, removedRules, removingRules
} from '../model/model-manager';
import { validateAfterPropChanged } from './validation';
import { findInMap, IStore, dbManager } from 'histria-utils';

import { TranContext } from './user-context';
import { UserContext, TransactionContainer, EventType, EventInfo, ObservableObject, FindOptions } from '../model/interfaces';
import { EventInfoStack } from './divers/event-stack'

export class Transaction implements TransactionContainer {
    private _id: any;
    private _eventInfo: EventInfo;

    private _subscribers: Map<EventType, any[]>;
    private _removedInstances: Map<any, Map<string, ObservableObject>>;
    private _instances: Map<any, Map<string, ObservableObject>>;
    private _ctx: UserContext;
    constructor(ctx?: UserContext) {
        let that = this;
        that._id = uuid.v1();
        that._ctx = ctx || new TranContext();
        that._subscribers = new Map();
        that.subscribe(EventType.propChanged, propagationRules);
        that.subscribe(EventType.addItem, addItemRules);
        that.subscribe(EventType.removeItem, rmvItemRules);
        that.subscribe(EventType.setItems, setItemsRules);
        that.subscribe(EventType.propValidate, validateAfterPropChanged);
        that.subscribe(EventType.propValidate, propValidateRules);
        that.subscribe(EventType.objValidate, objValidateRules);
        that.subscribe(EventType.init, initRules);
        that.subscribe(EventType.saving, savingRules);
        that.subscribe(EventType.saved, savedRules);
        that.subscribe(EventType.editing, editingRules);
        that.subscribe(EventType.edited, editedRules);
        that.subscribe(EventType.removing, removingRules);
        that.subscribe(EventType.removed, removedRules);
    }
    public get context(): UserContext {
        return this._ctx;
    }
    public get eventInfo(): EventInfo {
        let that = this;
        if (!that._eventInfo)
            that._eventInfo = new EventInfoStack()
        return this._eventInfo;
    }
    public saveToJson(): any {
        const that = this;
        const res: any = { instances: [], removed: [] };
        const mm = modelManager();
        if (that._removedInstances) {
            // Classname must be saved
            res.removed = [];
            for (let item of that._removedInstances) {
                for (let instance of item[1]) {
                    res.removed.push(instance[1].model());
                }
            }
        }
        if (that._instances) {
            let mm = modelManager();
            mm.enumClasses(item => {
                let instances = that._instances.get(item.classOfInstance);
                if (instances) {
                    for (let ii of instances) {
                        const instance: ObservableObject = ii[1];
                        if (!instance.owner)
                            res.instances.push({ className: item.className, data: instance.model() });
                    }
                }

            });
        }
        return res;
    }

    public async loadFromJson(data: any, reload: boolean): Promise<void> {
        const that = this;
        const mm = modelManager();
        const restoreList: Promise<ObservableObject>[] = [];
        const npList: { factory: any, data: any }[] = [];
        data && data.instances.forEach((item: { className: string, data: any }) => {
            const cn = item.className.split('.');
            const factory = mm.classByName(cn[1], cn[0]);
            if (!factory)
                throw util.format('Class not found "%s".', item.className);
            if (factory.isPersistent)
                restoreList.push(that.restore(factory, item.data, reload))
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
    private async _propagateEvent(list: any[], eventInfo: EventInfo, instance: ObservableObject, nInstances: ObservableObject[], args: any[], argIndex: number): Promise<boolean> {
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
    public async emitInstanceEvent(eventType: EventType, eventInfo: EventInfo, instance: ObservableObject, ...args: any[]): Promise<boolean> {
        let that = this;
        args = args || [];
        let propagate = [EventType.propChanged, EventType.removeItem, EventType.addItem, EventType.setItems, EventType.editing, EventType.removing].indexOf(eventType) >= 0;
        const pi = propagate && args && args.length ? 0 : -1;
        const list = that._subscribers.get(eventType);
        if (!list) return true;
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
    public subscribe(eventType: EventType, handler: (eventInfo: EventInfo, classOfInstance: any, instance: any, args?: any[]) => Promise<boolean>) {
        let that = this;
        let list = that._subscribers.get(eventType);
        if (!list) {
            list = [];
            that._subscribers.set(eventType, list);
        }
        list.push(handler);
    }
    public async save(): Promise<void> {
        return Promise.resolve();
    }

    public async cancel(): Promise<void> {
        return Promise.resolve();
    }

    public async create<T extends ObservableObject>(classOfInstance: any): Promise<T> {
        let that = this;
        let mm = modelManager();
        let instance: T = mm.createInstance<T>(classOfInstance, this, null, '', { _isNew: true }, { isRestore: false });
        that._addInstance(instance, classOfInstance);
        let instances: any[] = []
        instance.enumChildren((child: any) => {
            instances.push(child);
        }, true);
        instances.push(instance);
        for (let inst of instances) {
            await inst.afterCreated();
        }
        return instance;
    }

    public async load<T extends ObservableObject>(classOfInstance: any, data: any): Promise<T> {
        let mm = modelManager();
        let that = this;
        let instance: any = mm.createInstance<T>(classOfInstance, this, null, '', data, { isRestore: false });
        that._addInstance(instance, classOfInstance);
        let instances: any[] = []
        instance.enumChildren((child: any) => {
            instances.push(child);
        }, true);
        instances.push(instance);
        for (let inst of instances) {
            await inst.afterCreated();
        }
        return instance;
    }
    public createInstance<T extends ObservableObject>(classOfInstance: any, parent: ObservableObject, propertyName: string, data: any, isRestore: boolean): T {
        let mm = modelManager();
        let that = this;
        let instance: any = mm.createInstance<T>(classOfInstance, this, parent, propertyName, data, { isRestore: isRestore });
        that._addInstance(instance, classOfInstance);
        return instance;
    }
    public clear() {
        const that = this;
        const mm = modelManager();
        if (that._instances) {
            mm.enumClasses(item => {
                let instances = that._instances.get(item.classOfInstance);
                if (instances) {
                    const toDestroy: ObservableObject[] = [];
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
                let toDestroy: ObservableObject[] = [];
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
                let toDestroy: ObservableObject[] = [];
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
    public destroy() {
        let that = this;
        that.clear();
        if (that._eventInfo) {
            that._eventInfo.destroy();
            that._eventInfo = null;
        }
        that._subscribers = null;
        that._ctx = null;
    }
    private _addInstance(instance: ObservableObject, classOfInstance: any) {
        let that = this;
        that._instances = that._instances || new Map<any, Map<string, ObservableObject>>();
        let instances = that._instances.get(classOfInstance);
        if (!instances) {
            instances = new Map<string, ObservableObject>();
            that._instances.set(classOfInstance, instances);
        }
        instances.set(instance.uuid, instance);

    }
    public async find<T extends ObservableObject>(classOfInstance: any, filter: any, options?: FindOptions): Promise<T[]> {
        let that = this;
        let res = await that._find<T>(filter, classOfInstance);
        if (!classOfInstance.isPersistent)
            return res || [];
        if (!options || !options.onlyInCache) {
            let store = that._store(classOfInstance);
            if (store) {
                let list = await store.find(classOfInstance.entityName, filter, { compositions: false });
                if (list && list.length) {
                    let map: any = {};
                    let instances = that._getInstances(classOfInstance);
                    let promises: Promise<T>[] = [];
                    let byClass: Map<string, ObservableObject>;
                    if (that._removedInstances) {
                        byClass = that._removedInstances.get(classOfInstance);
                    }
                    list.forEach(item => {
                        const key = item.id + '';
                        if (byClass && byClass.get(key))
                            return;
                        let o = instances ? <T>instances.get(key) : null;
                        if (o && res.indexOf(o) < 0)
                            return;
                        map[key] = true;
                        promises.push(o ? Promise.resolve(o) : that.load<T>(classOfInstance, item));
                    });
                    let dbList = await Promise.all(promises);
                    res && res.forEach(item => {
                        if (!map[item.uuid])
                            dbList.push(item)
                    });
                    res = dbList;
                }
            }
        }
        return res || [];
    }
    public findOneInCache<T extends ObservableObject>(classOfInstance: any, filter: any): T {
        return this._findOne<T>(filter, classOfInstance);
    }

    public async findOne<T extends ObservableObject>(classOfInstance: any, filter: any, options?: FindOptions): Promise<T> {
        const that = this;
        options = options || {};
        const byId = !!filter.id;
        let res = that._findOne<T>(filter, classOfInstance);
        if (res) return res;
        if (!classOfInstance.isPersistent)
            return res;
        if (!options || !options.onlyInCache) {
            let store = that._store(classOfInstance);
            if (store) {
                let instances = that._getInstances(classOfInstance);
                let data = await store.findOne(classOfInstance.entityName, filter, { compositions: true });
                if (data) {
                    const key = data.id + ''
                    if (that._removedInstances) {
                        const byClass = that._removedInstances.get(classOfInstance);
                        if (byClass) {
                            const inst = byClass.get(key);
                            if (inst)
                                return null;
                        }
                    }
                    let o = instances ? <T>instances.get(key) : null;
                    if (o) return null;
                    return await that.load<T>(classOfInstance, data);
                }
            }
        }
        return null;
    }
    public removeInstance(instance: ObservableObject) {
        const that = this;
        if (that._instances) {
            const byClass = that._instances.get(instance.constructor);
            if (byClass)
                byClass.delete(instance.uuid)
        }
        if (that._removedInstances) {
            const byClass = that._removedInstances.get(instance.constructor);
            if (byClass)
                byClass.delete(instance.uuid)
        }

    }
    public remove(instance: ObservableObject): void {
        let that = this;
        that._removedInstances = that._removedInstances || new Map<any, Map<string, ObservableObject>>();
        let instances = that._removedInstances.get(instance.constructor);
        if (!instances) {
            instances = new Map<string, ObservableObject>();
            that._removedInstances.set(instance.constructor, instances);
        }
        instances.set(instance.uuid, instance);
    }
    public async restore<T extends ObservableObject>(classOfInstance: any, data: any, reload: boolean): Promise<T> {
        const that = this;
        const mm = modelManager();
        data = data || {};
        if (reload && classOfInstance.isPersistent && !data._isDirty) {
            let store = that._store(classOfInstance);
            if (store) {
                let cd = await store.find(classOfInstance.entityName, { id: data.id }, { compositions: true });
                if (cd)
                    return that.restore<T>(classOfInstance, cd, false);
            }
        }

        let instance: any = mm.createInstance<T>(classOfInstance, this, null, '', data, { isRestore: true });
        that._addInstance(instance, classOfInstance);
        let instances: any[] = []
        instance.enumChildren((child: any) => {
            instances.push(child);
        }, true);
        instances.push(instance);
        for (let inst of instances)
            inst.afterRestore();
        return instance;
    }

    private _getInstances(classOfInstance: any): Map<string, ObservableObject> {
        let that = this;
        if (!that._instances) return null;
        return that._instances.get(classOfInstance);
    }

    private _getRemovedInstances(classOfInstance: any): Map<string, ObservableObject> {
        let that = this;
        if (!that._removedInstances) return null;
        return that._removedInstances.get(classOfInstance);
    }

    private _findById<T extends ObservableObject>(id: string, classOfInstance: any): T {
        let that = this;
        let instances = that._getInstances(classOfInstance);
        return instances ? <any>instances.get(id + '') : null;
    }

    private _findOne<T extends ObservableObject>(query: any, classOfInstance: any): T {
        let that = this;
        if (query.id && typeof query.id !== 'object')
            return that._findById<T>(query.id, classOfInstance);
        let instances = that._getInstances(classOfInstance);
        if (!instances) return null;
        return findInMap(query, instances, { findFirst: true, transform: (item) => { return item.model(); } });
    }

    private async _find<T extends ObservableObject>(filter: any, classOfInstance: any): Promise<T[]> {
        let that = this;
        let instances = that._getInstances(classOfInstance);
        if (!instances) return [];
        return findInMap(filter, instances, { findFirst: false, transform: (item) => { return item.model(); } });
    }
    private _store(classOfInstance: any): IStore {
        let nameSpace = classOfInstance.nameSpace;
        if (!nameSpace) return null;
        return dbManager().store(nameSpace);
    }
}

