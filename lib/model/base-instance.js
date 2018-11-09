"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BaseInstance {
    constructor(transaction) {
        this._transaction = transaction;
    }
    get context() {
        return this.transaction.context;
    }
    get transaction() {
        return this._transaction;
    }
    destroy() {
        this._transaction = null;
        this._destroyCount = this._destroyCount || 0;
        this._destroyCount++;
        if (this._destroyCount > 1) {
            const constr = this.constructor;
            const instanceName = constr.nameSpace + '.' + constr.entityName;
            throw new Error(`'Destroy called more than once (${instanceName}).`);
        }
    }
}
exports.BaseInstance = BaseInstance;

//# sourceMappingURL=base-instance.js.map
