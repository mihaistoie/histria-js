import { UserContext, TransactionContainer, EventType, EventInfo, ObservableObject } from '../model/interfaces';
export declare class Transaction implements TransactionContainer {
    private _id;
    private _subscribers;
    private _instances;
    private _ctx;
    constructor(ctx?: UserContext);
    readonly context: UserContext;
    emitInstanceEvent(eventType: EventType, eventInfo: EventInfo, classOfInstance: any, instance: any, ...args: any[]): Promise<void>;
    subscribe(eventType: EventType, handler: (eventInfo: EventInfo, classOfInstance: any, instance: any, args?: any[]) => Promise<void>): void;
    create<T extends ObservableObject>(classOfInstance: any): Promise<T>;
    restore<T extends ObservableObject>(classOfInstance: any, data: any): Promise<T>;
    load<T extends ObservableObject>(classOfInstance: any, data: any): Promise<T>;
    destroy(): void;
    private _addInstance(instance, classOfInstance);
    find<T extends ObservableObject>(filter: any, classOfInstance: any): Promise<T[]>;
    findOne<T extends ObservableObject>(filter: any, classOfInstance: any): Promise<T>;
    private _getInstances(classOfInstance);
    private _findById<T>(id, classOfInstance);
    private _findOne<T>(query, classOfInstance);
    private _find<T>(filter, classOfInstance);
}
