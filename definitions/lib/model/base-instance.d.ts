import { IUserContext, ITransactionContainer } from './interfaces';
export declare class BaseInstance {
    protected _transaction: ITransactionContainer;
    protected _destroyCount: number;
    constructor(transaction: ITransactionContainer);
    readonly context: IUserContext;
    readonly transaction: ITransactionContainer;
    destroy(): void;
}
//# sourceMappingURL=base-instance.d.ts.map