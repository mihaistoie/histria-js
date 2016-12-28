"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const uuid = require("uuid");
const model_manager_1 = require("../model/model-manager");
const validation_1 = require("../model/validation");
const user_context_1 = require("./user-context");
const interfaces_1 = require("../model/interfaces");
class Transaction {
    constructor(ctx) {
        let that = this;
        that._id = uuid.v1();
        that._ctx = ctx || new user_context_1.TranContext();
        that._subscribers = new Map();
        that.subscribe(interfaces_1.EventType.propChanged, model_manager_1.propagationRules);
        that.subscribe(interfaces_1.EventType.propValidate, validation_1.validateAfterPropChanged);
        that.subscribe(interfaces_1.EventType.propValidate, model_manager_1.propValidateRules);
        that.subscribe(interfaces_1.EventType.objValidate, model_manager_1.objValidateRules);
        that.subscribe(interfaces_1.EventType.init, model_manager_1.initRules);
    }
    get context() {
        return this._ctx;
    }
    emitInstanceEvent(eventType, eventInfo, classOfInstance, instance, ...args) {
        return __awaiter(this, void 0, void 0, function* () {
            let that = this;
            let list = that._subscribers.get(eventType);
            if (list) {
                for (let item of list) {
                    yield item(eventInfo, classOfInstance, instance, args);
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
        return __awaiter(this, void 0, void 0, function* () {
            let mm = new model_manager_1.ModelManager();
            let instance = mm.createInstance(classOfInstance, this, { $isNew: true }, { isRestore: true });
            yield instance.afterCreated();
            return instance;
        });
    }
    restore(classOfInstance, data) {
        return __awaiter(this, void 0, void 0, function* () {
            let mm = new model_manager_1.ModelManager();
            data = data || {};
            let instance = mm.createInstance(classOfInstance, this, data, { isRestore: true });
            yield instance.afterCreated();
            return instance;
        });
    }
    load(classOfInstance, data) {
        return __awaiter(this, void 0, void 0, function* () {
            let mm = new model_manager_1.ModelManager();
            let instance = mm.createInstance(classOfInstance, this, data, { isRestore: false });
            yield instance.afterCreated();
            return instance;
        });
    }
    destroy() {
        let that = this;
        that._subscribers = null;
        that._ctx = null;
    }
}
exports.Transaction = Transaction;
