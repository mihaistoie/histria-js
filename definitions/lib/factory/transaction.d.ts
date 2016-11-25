import { UserContext, TransactionContainer } from '../model/interfaces';
export declare class Transaction implements TransactionContainer {
    private _id;
    private _ctx;
    constructor(ctx?: UserContext);
    readonly context: UserContext;
    create<T>(classOfInstance: any): T;
    restore<T>(classOfInstance: any, data: any): T;
    load<T>(classOfInstance: any, data: any): T;
    destroy(): void;
}
