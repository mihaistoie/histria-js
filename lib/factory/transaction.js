"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const uuid = require('node-uuid');
const model_manager_1 = require('../model/model-manager');
const user_context_1 = require('./user-context');
const interfaces_1 = require('../model/interfaces');
class Transaction {
    constructor(ctx) {
        let that = this;
        that._id = uuid.v1();
        that._ctx = ctx || new user_context_1.TranContext();
        that._subscribers = new Map();
        that.subscribe(interfaces_1.EventType.propChanged, model_manager_1.propagationRules);
    }
    get context() {
        return this._ctx;
    }
    emitInstanceEvent(eventType, eventInfo, classOfInstance, instance, ...args) {
        return __awaiter(this, void 0, void 0, function* () {
            let that = this;
            let list = that._subscribers.get(eventType);
            if (list) {
                for (let i = 0, len = list.length; i < len; i++) {
                    yield list[i](eventInfo, classOfInstance, instance, args);
                }
            }
        });
    }
    subscribe(eventType, handler) {
        let that = this;
        let list = that._subscribers.get(eventType);
        if (!list) {
            list = [];
            that._subscribers.set(eventType, list);
        }
        list.push(handler);
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
        that._subscribers = null;
        that._ctx = null;
    }
}
exports.Transaction = Transaction;
