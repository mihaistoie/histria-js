"use strict";
const uuid = require('node-uuid');
const model_manager_1 = require('../model/model-manager');
class Transaction {
    constructor() {
        let that = this;
        that._id = uuid.v1();
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
}
exports.Transaction = Transaction;
