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
        let that = this;
        that._transaction = null;
        that._destroyCount = that._destroyCount || 0;
        that._destroyCount++;
        if (that._destroyCount > 1)
            throw 'Destroy called more than once.';
    }
}
exports.BaseInstance = BaseInstance;
