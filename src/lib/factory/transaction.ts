import * as util from 'util';
import * as uuid from 'uuid';
import { modelManager, propagationRules, initRules, propValidateRules, objValidateRules, addItemRules, rmvItemRules, setItemsRules } from '../model/model-manager';
import { validateAfterPropChanged } from './validation';
import { findInMap, IStore, dbManager } from 'histria-utils';

import { TranContext } from './user-context';
import { UserContext, TransactionContainer, EventType, EventInfo, ObservableObject, FindOptions } from '../model/interfaces';

export class Transaction implements TransactionContainer {
    private _id: any;
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
    }
    public get context(): UserContext {
        return this._ctx;
    }
    private _saveToJson(): void {
        let that = this;
        let res: any = { instances: [] };
        if (that._removedInstances) {

            //classname must be saved
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
                if (item.isView) {

                } else {
                    let instances = that._instances.get(item.classOfInstance);
                    if (instances) {
                        for (let ii of instances) {
                            const instance: ObservableObject = ii[1];
                            if (!item.isChild || instance.standalone())
                                res.instances.push({ className: item.className, data: instance.model() });

                        }


                    }

                }
            });
        }
    }


    public async emitInstanceEvent(eventType: EventType, eventInfo: EventInfo, instance: ObservableObject, ...args: any[]) {
        let that = this;
        let ci = instance;
        args = args || [];
        let nIstances = [ci];
        let propagate = [EventType.propChanged, EventType.removeItem, EventType.addItem, EventType.setItems].indexOf(eventType) >= 0;
        let pi = propagate && args && args.length ? 0 : -1;

        let list = that._subscribers.get(eventType);

        if (list) {
            while (ci) {
                for (let item of list)
                    await item(eventInfo, ci.constructor, nIstances, args)
                if (!propagate)
                    break;
                //XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
                //TODO code review
                args[pi] = ci.propertyName + '.' + args[pi];
                ci = ci.parent;
                //XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
                nIstances.unshift(ci)
            }
        }
    }
    public subscribe(eventType: EventType, handler: (eventInfo: EventInfo, classOfInstance: any, instance: any, args?: any[]) => Promise<void>) {
        let that = this;
        let list = that._subscribers.get(eventType);
        if (!list) {
            list = [];
            that._subscribers.set(eventType, list);
        }
        list.push(handler);
    }

    public async create<T extends ObservableObject>(classOfInstance: any): Promise<T> {
        let that = this;
        let mm = modelManager();
        let instance: T = mm.createInstance<T>(classOfInstance, this, null, '', { $isNew: true }, { isRestore: false });
        that._addInstance(instance, classOfInstance);
        let instances: any[] = []
        instance.enumChildren((child: any) => {
            instances.push(child);
        });
        instances.push(instance);
        for (let inst of instances) {
            await inst.afterCreated();
        }
        return instance;
    }

    public async restore<T extends ObservableObject>(classOfInstance: any, data: any): Promise<T> {
        let mm = modelManager();
        let that = this;
        data = data || {};
        let instance: any = mm.createInstance<T>(classOfInstance, this, null, '', data, { isRestore: true });
        that._addInstance(instance, classOfInstance);
        let instances: any[] = []
        instance.enumChildren((child: any) => {
            instances.push(child);
        });
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
        });
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
        let that = this;
        if (that._instances) {
            let mm = modelManager();
            mm.enumRoots(item => {
                let instances = that._instances.get(item.classOfInstance);
                if (instances) {
                    let toDestroy: ObservableObject[] = [];
                    for (let ii of instances) {
                        toDestroy.push(ii[1]);
                    }
                    toDestroy.forEach(instance => instance.destroy());
                }
            });
            for (let classOfInstance of that._instances) {
                let map = classOfInstance[1];
                let toDestroy: ObservableObject[] = [];
                for (let ii of map) {
                    toDestroy.push(ii[1]);
                }
                toDestroy.forEach(instance => instance.destroy());
            }
            that._instances = null;
        }

    }
    public destroy() {
        let that = this;
        that.clear();
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
        if (!options || !options.onlyInCache) {
            let store = that._store(classOfInstance);
            if (store) {
                let list = await store.find(classOfInstance.entityName, filter, { compositions: false });
                if (list && list.length) {
                    let map: any = {};
                    let instances = that._getInstances(classOfInstance);
                    let promises = list.map(item => {
                        let o = instances ? <T>instances.get(item.id + '') : null;
                        map[item.id + ''] = true;
                        return o ? Promise.resolve(o) : that.load<T>(classOfInstance, item);
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
    public async findOne<T extends ObservableObject>(classOfInstance: any, filter: any, options?: FindOptions): Promise<T> {
        let that = this;
        let res = await that._findOne<T>(filter, classOfInstance);
        if (res) return res;
        if (!options || !options.onlyInCache) {
            let store = that._store(classOfInstance);
            if (store) {
                let data = await store.findOne(classOfInstance.entityName, filter, { compositions: true });
                if (data) {
                    return await that.load<T>(classOfInstance, data);
                }
            }
        }
        return null;
    }
    public removeInstance(classOfInstance: any, instance: ObservableObject) {
        let that = this;
        if (that._instances) {
            let byClass = that._instances.get(classOfInstance);
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
        if (!nameSpace) return;
        return dbManager().store(nameSpace);

    }

}

