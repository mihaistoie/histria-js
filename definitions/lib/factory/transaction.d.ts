import { UserContext, TransactionContainer, EventType, EventInfo, ObservableObject, FindOptions, LogModule, DebugLevel } from '../model/interfaces';
export declare class Transaction implements TransactionContainer {
    private _id;
    private _eventInfo;
    private _subscribers;
    private _removedInstances;
    private _instances;
    private _ctx;
    constructor(ctx?: UserContext);
    readonly context: UserContext;
    log(module: LogModule, message: string, debugLevel?: DebugLevel): void;
    readonly eventInfo: EventInfo;
    saveToJson(): any;
    loadFromJson(data: any, reload: boolean): Promise<void>;
    private _propagateEvent;
    emitInstanceEvent(eventType: EventType, eventInfo: EventInfo, instance: ObservableObject, ...args: any[]): Promise<boolean>;
    notifyHooks(eventType: EventType, instance: ObservableObject, source: ObservableObject, propertyName: string): Promise<void>;
    private _execHooks;
    subscribe(eventType: EventType, handler: (eventInfo: EventInfo, classOfInstance: any, instance: any, args?: any[]) => Promise<boolean>): void;
    save(): Promise<void>;
    cancel(): Promise<void>;
    create<T extends ObservableObject>(classOfInstance: any, options?: {
        external: true;
    }): Promise<T>;
    load<T extends ObservableObject>(classOfInstance: any, data: any, options?: {
        external: true;
    }): Promise<T>;
    createInstance<T extends ObservableObject>(classOfInstance: any, parent: ObservableObject, propertyName: string, data: any, isRestore: boolean): T;
    clear(): void;
    destroy(): void;
    private _addInstance;
    find<T extends ObservableObject>(classOfInstance: any, filter: any, options?: FindOptions): Promise<T[]>;
    findOneInCache<T extends ObservableObject>(classOfInstance: any, filter: any): T;
    findOne<T extends ObservableObject>(classOfInstance: any, filter: any, options?: FindOptions): Promise<T>;
    removeInstance(instance: ObservableObject): void;
    remove(instance: ObservableObject): void;
    restore<T extends ObservableObject>(classOfInstance: any, data: any, reload: boolean): Promise<T>;
    private _getInstances;
    private _getRemovedInstances;
    private _findById;
    private _findOne;
    private _find;
    private _store;
}
//# sourceMappingURL=transaction.d.ts.map