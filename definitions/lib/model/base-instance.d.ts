import { UserContext, TransactionContainer } from './interfaces';
export declare class BaseInstance {
    protected _transaction: TransactionContainer;
    protected _destroyCount: number;
    constructor(transaction: TransactionContainer);
    readonly context: UserContext;
    readonly transaction: TransactionContainer;
    destroy(): void;
}
