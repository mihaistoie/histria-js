import { ObservableObject, ObservableArray, EventInfo, ObjectStatus, MessageServerity, UserContext, TransactionContainer, EventType } from './interfaces';

export class BaseInstance {
    protected _transaction: TransactionContainer;
    protected _destroyCount: number;
    constructor(transaction: TransactionContainer) {
        let that = this;
        that._transaction = transaction;
    }
    public get context(): UserContext {
        return this.transaction.context;
    }
    public get transaction(): TransactionContainer {
        return this._transaction;
    }
    public destroy() {
        const that = this;
        that._transaction = null;
        that._destroyCount = that._destroyCount || 0;
        that._destroyCount++;
        if (that._destroyCount > 1) {
            const constr: any = that.constructor;
            const inst: any = that;
            const instanceName = constr.nameSpace + '.' + constr.entityName;
            throw 'Destroy called more than once (' + instanceName + ').';
        }
    }

}