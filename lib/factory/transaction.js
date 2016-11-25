"use strict";
const uuid = require('node-uuid');
const model_manager_1 = require('../model/model-manager');
const user_context_1 = require('./user-context');
class Transaction {
    constructor(ctx) {
        let that = this;
        that._id = uuid.v1();
        that._ctx = ctx || new user_context_1.TranContext();
    }
    get context() {
        return this._ctx;
    }
    create(classOfInstance) {
        let mm = new model_manager_1.ModelManager();
        let instance = mm.createInstance(classOfInstance, this, {}, { isCreate: true, isRestore: true });
        return instance;
    }
    restore(classOfInstance, data) {
        let mm = new model_manager_1.ModelManager();
        let instance = mm.createInstance(classOfInstance, this, data, { isCreate: true, isRestore: true });
        return instance;
    }
    load(classOfInstance, data) {
        let mm = new model_manager_1.ModelManager();
        let instance = mm.createInstance(classOfInstance, this, data, { isCreate: false, isRestore: false });
        return instance;
    }
    destroy() {
        let that = this;
        that._ctx = null;
    }
}
exports.Transaction = Transaction;
