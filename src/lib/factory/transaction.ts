import * as util from 'util';
import * as uuid from 'uuid';
import { ModelManager, propagationRules, initRules, propValidateRules, objValidateRules } from '../model/model-manager';
import { validateAfterPropChanged } from '../model/validation';
import { findInMap } from '../db/mongo-filter';

import { TranContext } from './user-context';
import { UserContext, TransactionContainer, EventType, EventInfo, ObservableObject } from '../model/interfaces';

export class Transaction implements TransactionContainer {
    private _id: any;
    private _subscribers: Map<EventType, any[]>;
    private _instances: Map<any, Map<string, ObservableObject>>;
    private _ctx: UserContext;
    constructor(ctx?: UserContext) {
        let that = this;
        that._id = uuid.v1();
        that._ctx = ctx || new TranContext();
        that._subscribers = new Map();
        that.subscribe(EventType.propChanged, propagationRules);
        that.subscribe(EventType.propValidate, validateAfterPropChanged);
        that.subscribe(EventType.propValidate, propValidateRules);
        that.subscribe(EventType.objValidate, objValidateRules);
        that.subscribe(EventType.init, initRules);
    }

    public get context(): UserContext {
        return this._ctx;
    }
    public async emitInstanceEvent(eventType: EventType, eventInfo: EventInfo, classOfInstance: any, instance: any, ...args) {
        let that = this;
        let list = that._subscribers.get(eventType);
        if (list) {
            for (let item of list) {
                await item(eventInfo, classOfInstance, instance, args)
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
        let mm = new ModelManager();
        let instance: any = mm.createInstance<T>(classOfInstance, this, { $isNew: true }, { isRestore: true });
        that._addInstance(instance, classOfInstance);
        await instance.afterCreated();
        return instance;
    }
    public async restore<T extends ObservableObject>(classOfInstance: any, data: any): Promise<T> {
        let mm = new ModelManager();
        let that = this;
        data = data || {};
        let instance: any = mm.createInstance<T>(classOfInstance, this, data, { isRestore: true });
        that._addInstance(instance, classOfInstance);
        await instance.afterCreated();
        return instance;
    }
    public async load<T extends ObservableObject>(classOfInstance: any, data: any): Promise<T> {
        let mm = new ModelManager();
        let that = this;
        let instance: any = mm.createInstance<T>(classOfInstance, this, data, { isRestore: false });
        that._addInstance(instance, classOfInstance);
        await instance.afterCreated();
        return instance;
    }
    public destroy() {
        let that = this;
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
    public async find<T extends ObservableObject>(filter: any, classOfInstance: any): Promise<T[]> {
        let that = this;
        let res = that._find<T>(filter, classOfInstance);
        if (res) return res;
        //TODO use persistence
        return [];
    }
    public async findOne<T extends ObservableObject>(filter: any, classOfInstance: any): Promise<T> {
        let that = this;
        let res = await that._findOne<T>(filter, classOfInstance);
        if (res) return res;
        //TODO use persistence
        return null;
    }
    private _getInstances(classOfInstance: any): Map<string, ObservableObject> {
        let that = this;
        if (!that._instances) return null;
        return that._instances.get(classOfInstance);

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

}

