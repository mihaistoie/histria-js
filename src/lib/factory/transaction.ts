import * as util from 'util';
import * as uuid from 'uuid';
import { ModelManager, propagationRules, initRules, propValidateRules, objValidateRules } from '../model/model-manager';
import { validateAfterPropChanged } from '../model/validation';

import { TranContext } from './user-context';
import { UserContext, TransactionContainer, EventType, EventInfo } from '../model/interfaces';

export class Transaction implements TransactionContainer {
    private _id: any;
    private _subscribers: Map<EventType, any[]>;
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

    public async create<T>(classOfInstance: any): Promise<T> {
        let mm = new ModelManager();
        let instance: any = mm.createInstance<T>(classOfInstance, this, { $isNew: true }, { isRestore: true });
        await instance.afterCreated();
        return instance;
    }
    public async restore<T>(classOfInstance: any, data: any): Promise<T> {
        let mm = new ModelManager();
        data = data || {};
        let instance: any = mm.createInstance<T>(classOfInstance, this, data, { isRestore: true });
        await instance.afterCreated();
        return instance;
    }
    public async load<T>(classOfInstance: any, data: any): Promise<T> {
        let mm = new ModelManager();
        let instance: any = mm.createInstance<T>(classOfInstance, this, data, { isRestore: false });
        await instance.afterCreated();
        return instance;
    }
    public destroy() {
        let that = this;
        that._subscribers = null;
        that._ctx = null;
    }

}

