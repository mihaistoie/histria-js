import { UserContext, TransactionContainer, EventType, EventInfo } from '../model/interfaces';
export declare class Transaction implements TransactionContainer {
    private _id;
    private _subscribers;
    private _ctx;
    constructor(ctx?: UserContext);
    readonly context: UserContext;
    emitInstanceEvent(eventType: EventType, eventInfo: EventInfo, classOfInstance: any, instance: any, ...args: any[]): Promise<void>;
    subscribe(eventType: EventType, handler: (eventInfo: EventInfo, classOfInstance: any, instance: any, ...args) => Promise<void>): void;
    create<T>(classOfInstance: any): T;
    restore<T>(classOfInstance: any, data: any): T;
    load<T>(classOfInstance: any, data: any): T;
    destroy(): void;
}
