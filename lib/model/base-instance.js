"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BaseInstance {
    constructor(transaction) {
        let that = this;
        that._transaction = transaction;
    }
    get context() {
        return this.transaction.context;
    }
    get transaction() {
        return this._transaction;
    }
    destroy() {
        const that = this;
        that._transaction = null;
        that._destroyCount = that._destroyCount || 0;
        that._destroyCount++;
        if (that._destroyCount > 1) {
            const constr = that.constructor;
            const inst = that;
            const instanceName = constr.nameSpace + '.' + constr.entityName;
            throw 'Destroy called more than once (' + instanceName + ').';
        }
    }
}
exports.BaseInstance = BaseInstance;

//# sourceMappingURL=base-instance.js.map
