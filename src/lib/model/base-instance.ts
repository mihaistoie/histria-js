import { IObservableObject, IObservableArray, IEventInfo, ObjectStatus, MessageServerity, IUserContext, ITransactionContainer, EventType } from './interfaces';

export class BaseInstance {
    protected _transaction: ITransactionContainer;
    protected _destroyCount: number;
    constructor(transaction: ITransactionContainer) {
        this._transaction = transaction;
    }
    public get context(): IUserContext {
        return this.transaction.context;
    }
    public get transaction(): ITransactionContainer {
        return this._transaction;
    }
    public destroy() {
        this._transaction = null;
        this._destroyCount = this._destroyCount || 0;
        this._destroyCount++;
        if (this._destroyCount > 1) {
            const constr: any = this.constructor;
            const instanceName = constr.nameSpace + '.' + constr.entityName;
            throw new Error(`'Destroy called more than once (${instanceName}).`);
        }
    }

}