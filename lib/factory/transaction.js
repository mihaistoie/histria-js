"use strict";
const uuid = require('node-uuid');
const model_manager_1 = require('./model-manager');
class Transaction {
    constructor() {
        let that = this;
        that._id = uuid.v1();
    }
    create(classOfInstance) {
        let mm = new model_manager_1.ModelManager();
        let instance = mm.createInstance(classOfInstance, this, {});
        return instance;
    }
}
exports.Transaction = Transaction;
