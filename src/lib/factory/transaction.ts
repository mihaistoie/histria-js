import * as util from 'util';
import * as uuid from 'uuid';
import {
    modelManager, propagationRules, propValidateRules, objValidateRules, addItemRules,
    rmvItemRules, setItemsRules, initRules, editedRules, editingRules, savedRules, savingRules, removedRules, removingRules
} from '../model/model-manager';
import { validateAfterPropChanged } from './validation';
import { findInMap, IStore, dbManager, helper } from 'histria-utils';

import { TranContext } from './user-context';
import { IUserContext, ITransactionContainer, EventType, IEventInfo, IObservableObject, IFindOptions, LogModule, DebugLevel, IFrameworkObject } from '../model/interfaces';
import { EventInfoStack } from './divers/event-stack';

export class Transaction implements ITransactionContainer {
    public get context(): IUserContext {
        return this._ctx;
    }
    public get eventInfo(): IEventInfo {
        if (!this._eventInfo)
            this._eventInfo = new EventInfoStack();
        return this._eventInfo;
    }
    private _id: any;
    private _eventInfo: IEventInfo;

    private _subscribers: Map<EventType, any[]>;
    private _removedInstances: Map<any, Map<string, IObservableObject>>;
    private _instances: Map<any, Map<string, IObservableObject>>;
    private _ctx: IUserContext;
    constructor(ctx?: IUserContext) {
        this._id = uuid.v1();
        this._ctx = ctx || new TranContext();
        this._subscribers = new Map();
        this.subscribe(EventType.propChanged, propagationRules);
        this.subscribe(EventType.addItem, addItemRules);
        this.subscribe(EventType.removeItem, rmvItemRules);
        this.subscribe(EventType.setItems, setItemsRules);
        this.subscribe(EventType.propValidate, validateAfterPropChanged);
        this.subscribe(EventType.propValidate, propValidateRules);
        this.subscribe(EventType.objValidate, objValidateRules);
        this.subscribe(EventType.init, initRules);
        this.subscribe(EventType.saving, savingRules);
        this.subscribe(EventType.saved, savedRules);
        this.subscribe(EventType.editing, editingRules);
        this.subscribe(EventType.edited, editedRules);
        this.subscribe(EventType.removing, removingRules);
        this.subscribe(EventType.removed, removedRules);
    }
    public log(module: LogModule, message: string, debugLevel?: DebugLevel) {
        if (debugLevel === undefined)
            debugLevel = DebugLevel.message;
        console.log(message);
    }

    public saveToJson(): any {
        const res: any = { instances: [], removed: [] };
        if (this._removedInstances) {
            // Classname must be saved
            res.removed = [];
            for (const item of this._removedInstances) {
                for (const instance of item[1]) {
                    res.removed.push(helper.clone(instance[1].model()));
                }
            }
        }
        if (this._instances) {
            const mm = modelManager();
            mm.enumClasses(item => {
                const instances = this._instances.get(item.classOfInstance);
                if (instances) {
                    for (const ii of instances) {
                        const instance: IObservableObject = ii[1];
                        if (!instance.owner)
                            res.instances.push({ className: item.className, data: helper.clone(instance.model()) });
                    }
                }

            });
        }
        return res;
    }

    public async loadFromJson(data: any, reload: boolean): Promise<void> {
        const mm = modelManager();
        const restoreList: Array<Promise<IObservableObject>> = [];
        const npList: Array<{ factory: any, data: any }> = [];
        if (data && data.instances)
            data.instances.forEach((item: { className: string, data: any }) => {
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
    public async emitInstanceEvent(eventType: EventType, eventInfo: IEventInfo, instance: IObservableObject, ...args: any[]): Promise<boolean> {

        args = args || [];
        const propagate = [EventType.propChanged, EventType.removeItem, EventType.addItem, EventType.setItems, EventType.editing, EventType.removing].indexOf(eventType) >= 0;
        const pi = propagate && args && args.length ? 0 : -1;
        const list = this._subscribers.get(eventType);
        if (!list) return true;
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
    public async notifyHooks(eventType: EventType, instance: IObservableObject, source: IObservableObject, propertyName: string): Promise<void> {

        await this._execHooks(eventType, instance, source, [instance], propertyName);
    }

    public subscribe(eventType: EventType, handler: (eventInfo: IEventInfo, classOfInstance: any, instance: any, args?: any[]) => Promise<boolean>) {

        let list = this._subscribers.get(eventType);
        if (!list) {
            list = [];
            this._subscribers.set(eventType, list);
        }
        list.push(handler);
    }
    public async save(): Promise<void> {
        return Promise.resolve();
    }

    public async cancel(): Promise<void> {
        return Promise.resolve();
    }

    public async create<T extends IObservableObject>(classOfInstance: any, options?: { external: true }): Promise<T> {

        const mm = modelManager();
        const instance: T = mm.createInstance<T>(classOfInstance, this, null, '', { _isNew: true }, { isRestore: false });
        this._addInstance(instance, classOfInstance);
        const instances: any[] = [];
        instance.enumChildren((child: any) => {
            instances.push(child);
        }, true);
        instances.push(instance);
        for (const inst of instances) {
            await inst.afterCreated();
        }
        if (options) {
            const inst: IFrameworkObject = instance as any;
            inst.setInstanceOptions(options);

        }
        return instance;
    }

    public async load<T extends IObservableObject>(classOfInstance: any, data: any, options?: { external: true }): Promise<T> {
        const mm = modelManager();

        const instance: any = mm.createInstance<T>(classOfInstance, this, null, '', data, { isRestore: false });
        this._addInstance(instance, classOfInstance);
        const instances: any[] = [];
        instance.enumChildren((child: any) => {
            instances.push(child);
        }, true);
        instances.push(instance);
        for (const inst of instances) {
            await inst.afterCreated();
        }
        if (options) {
            const inst: IFrameworkObject = instance as any;
            inst.setInstanceOptions(options);

        }
        return instance;
    }
    public createInstance<T extends IObservableObject>(classOfInstance: any, parent: IObservableObject, propertyName: string, data: any, isRestore: boolean): T {
        const mm = modelManager();

        const instance: any = mm.createInstance<T>(classOfInstance, this, parent, propertyName, data, { isRestore: isRestore });
        this._addInstance(instance, classOfInstance);
        return instance;
    }
    public clear() {

        const mm = modelManager();
        if (this._instances) {
            mm.enumClasses(item => {
                const instances = this._instances.get(item.classOfInstance);
                if (instances) {
                    const toDestroy: IObservableObject[] = [];
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
                const toDestroy: IObservableObject[] = [];
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
                const toDestroy: IObservableObject[] = [];
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
    public destroy() {

        this.clear();
        if (this._eventInfo) {
            this._eventInfo.destroy();
            this._eventInfo = null;
        }
        this._subscribers = null;
        this._ctx = null;
    }
    public async find<T extends IObservableObject>(classOfInstance: any, filter: any, options?: IFindOptions): Promise<T[]> {

        let res = await this._find<T>(filter, classOfInstance);
        if (!classOfInstance.isPersistent)
            return res || [];
        if (!options || !options.onlyInCache) {
            const store = this._store(classOfInstance);
            if (store) {
                const list = await store.find(classOfInstance.entityName, filter, { compositions: false });
                if (list && list.length) {
                    const map: any = {};
                    const instances = this._getInstances(classOfInstance);
                    const promises: Array<Promise<T>> = [];
                    let byClass: Map<string, IObservableObject>;
                    if (this._removedInstances) {
                        byClass = this._removedInstances.get(classOfInstance);
                    }
                    list.forEach(item => {
                        const key = item.id + '';
                        if (byClass && byClass.get(key))
                            return;
                        const o = instances ? instances.get(key) as T : null;
                        if (o && res.indexOf(o) < 0)
                            return;
                        map[key] = true;
                        promises.push(o ? Promise.resolve(o) : this.load<T>(classOfInstance, item));
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
    public findOneInCache<T extends IObservableObject>(classOfInstance: any, filter: any): T {
        return this._findOne<T>(filter, classOfInstance);
    }

    public async findOne<T extends IObservableObject>(classOfInstance: any, filter: any, options?: IFindOptions): Promise<T> {

        options = options || {};
        const res = this._findOne<T>(filter, classOfInstance);
        if (res) return res;
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
                    const o = instances ? instances.get(key) as T : null;
                    if (o) return null;
                    return this.load<T>(classOfInstance, data);
                }
            }
        }
        return null;
    }
    public removeInstance(instance: IObservableObject) {

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
    public remove(instance: IObservableObject): void {

        this._removedInstances = this._removedInstances || new Map<any, Map<string, IObservableObject>>();
        let instances = this._removedInstances.get(instance.constructor);
        if (!instances) {
            instances = new Map<string, IObservableObject>();
            this._removedInstances.set(instance.constructor, instances);
        }
        instances.set(instance.uuid, instance);
    }
    public async restore<T extends IObservableObject>(classOfInstance: any, data: any, reload: boolean): Promise<T> {

        const mm = modelManager();
        data = data || {};
        if (reload && classOfInstance.isPersistent && !data._isDirty) {
            const store = this._store(classOfInstance);
            if (store) {
                const cd = await store.find(classOfInstance.entityName, { id: data.id }, { compositions: true });
                if (cd)
                    return this.restore<T>(classOfInstance, cd, false);
            }
        }

        const instance: any = mm.createInstance<T>(classOfInstance, this, null, '', data, { isRestore: true });
        this._addInstance(instance, classOfInstance);
        const instances: any[] = [];
        instance.enumChildren((child: any) => {
            instances.push(child);
        }, true);
        instances.push(instance);
        for (const inst of instances)
            inst.afterRestore();
        return instance;
    }
    private async _propagateEvent(list: any[], eventInfo: IEventInfo, instance: IObservableObject, nInstances: IObservableObject[], args: any[], argIndex: number): Promise<boolean> {

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

    private async _execHooks(eventType: EventType, instance: IObservableObject, source: IObservableObject, nInstances: IObservableObject[], propertyName: string): Promise<void> {

        const inst: IFrameworkObject = instance as any;
        await inst.execHooks(propertyName, eventType, source);
        const listeners = instance.getListeners(false);
        for (const listener of listeners) {
            const children = nInstances.slice();
            const pn = listener.propertyName + '.' + propertyName;
            children.unshift(listener.instance);
            await this._execHooks(eventType, listener.instance, source, children, pn);
        }

    }
    private _addInstance(instance: IObservableObject, classOfInstance: any) {

        this._instances = this._instances || new Map<any, Map<string, IObservableObject>>();
        let instances = this._instances.get(classOfInstance);
        if (!instances) {
            instances = new Map<string, IObservableObject>();
            this._instances.set(classOfInstance, instances);
        }
        instances.set(instance.uuid, instance);

    }

    private _getInstances(classOfInstance: any): Map<string, IObservableObject> {

        if (!this._instances) return null;
        return this._instances.get(classOfInstance);
    }

    private _getRemovedInstances(classOfInstance: any): Map<string, IObservableObject> {

        if (!this._removedInstances) return null;
        return this._removedInstances.get(classOfInstance);
    }

    private _findById<T extends IObservableObject>(id: string, classOfInstance: any): T {

        const instances = this._getInstances(classOfInstance);
        return instances ? instances.get(id + '') as any : null;
    }

    private _findOne<T extends IObservableObject>(query: any, classOfInstance: any): T {

        if (query.id && typeof query.id !== 'object')
            return this._findById<T>(query.id, classOfInstance);
        const instances = this._getInstances(classOfInstance);
        if (!instances) return null;
        return findInMap(query, instances, { findFirst: true, transform: (item) => item.model() });
    }

    private async _find<T extends IObservableObject>(filter: any, classOfInstance: any): Promise<T[]> {

        const instances = this._getInstances(classOfInstance);
        if (!instances) return [];
        return findInMap(filter, instances, { findFirst: false, transform: (item) => item.model() });
    }
    private _store(classOfInstance: any): IStore {
        const nameSpace = classOfInstance.nameSpace;
        if (!nameSpace) return null;
        return dbManager().store(nameSpace);
    }
}
