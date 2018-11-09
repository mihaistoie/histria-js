import { IUserContext, ITransactionContainer, EventType, IEventInfo, IObservableObject, IFindOptions, LogModule, DebugLevel } from '../model/interfaces';
export declare class Transaction implements ITransactionContainer {
    readonly context: IUserContext;
    readonly eventInfo: IEventInfo;
    private _id;
    private _eventInfo;
    private _subscribers;
    private _removedInstances;
    private _instances;
    private _ctx;
    constructor(ctx?: IUserContext);
    log(module: LogModule, message: string, debugLevel?: DebugLevel): void;
    saveToJson(): any;
    loadFromJson(data: any, reload: boolean): Promise<void>;
    emitInstanceEvent(eventType: EventType, eventInfo: IEventInfo, instance: IObservableObject, ...args: any[]): Promise<boolean>;
    notifyHooks(eventType: EventType, instance: IObservableObject, source: IObservableObject, propertyName: string): Promise<void>;
    subscribe(eventType: EventType, handler: (eventInfo: IEventInfo, classOfInstance: any, instance: any, args?: any[]) => Promise<boolean>): void;
    save(): Promise<void>;
    cancel(): Promise<void>;
    create<T extends IObservableObject>(classOfInstance: any, options?: {
        external: true;
    }): Promise<T>;
    load<T extends IObservableObject>(classOfInstance: any, data: any, options?: {
        external: true;
    }): Promise<T>;
    createInstance<T extends IObservableObject>(classOfInstance: any, parent: IObservableObject, propertyName: string, data: any, isRestore: boolean): T;
    clear(): void;
    destroy(): void;
    find<T extends IObservableObject>(classOfInstance: any, filter: any, options?: IFindOptions): Promise<T[]>;
    findOneInCache<T extends IObservableObject>(classOfInstance: any, filter: any): T;
    findOne<T extends IObservableObject>(classOfInstance: any, filter: any, options?: IFindOptions): Promise<T>;
    removeInstance(instance: IObservableObject): void;
    remove(instance: IObservableObject): void;
    restore<T extends IObservableObject>(classOfInstance: any, data: any, reload: boolean): Promise<T>;
    private _propagateEvent;
    private _execHooks;
    private _addInstance;
    private _getInstances;
    private _getRemovedInstances;
    private _findById;
    private _findOne;
    private _find;
    private _store;
}
//# sourceMappingURL=transaction.d.ts.map