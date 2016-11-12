"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const errors_1 = require('../utils/errors');
const model_manager_1 = require('./model-manager');
const schemaUtils = require('../schema/schema-utils');
const util = require('util');
class Instance {
    constructor(transaction, parent, parentArray, propertyName, value) {
        let that = this;
        that._propertyName = propertyName;
        that.init();
        that._setModel(value);
    }
    propertyChanged(propName, value, oldValue, callStackInfo) {
    }
    stateChanged(propName, value, oldValue, callStackInfo) {
    }
    init() {
    }
    //called only on create or on load 
    _setModel(value) {
        let that = this;
        let states = value.$states;
        that._model = value;
        that._children = {};
    }
    modelState(propName) {
        return null;
    }
    getOrSetProperty(propName, value) {
        return __awaiter(this, void 0, void 0, function* () {
            let that = this;
            let propSchema = that._schema.properties[propName];
            let mm = new model_manager_1.ModelManager();
            if (!propSchema)
                throw new errors_1.ApplicationError(util.format('Property not found: "%s".', propName));
            if (schemaUtils.isComplex(propSchema)) {
                if (value === undefined) {
                }
                else {
                    if (schemaUtils.isArray(propSchema))
                        throw new errors_1.ApplicationError(util.format('Can\'t set "%s", because is an array.', propName));
                    that._children[propName] = value;
                }
                return Promise.resolve(that._children[propName]);
            }
            else {
                if (value === undefined) {
                }
                else {
                    // set
                    if (that._model[propName] !== value) {
                        that._model[propName] = value;
                        let rules = mm.rulesForPropChange(that.constructor, propName);
                        if (rules.length) {
                            for (let i = 0, len = rules.length; i < len; i++) {
                                let rule = rules[i];
                                yield rule(that, null);
                            }
                        }
                    }
                }
            }
            return that._model[propName];
        });
    }
    finalize() {
        let that = this;
        that._schema = null;
        that._model = null;
        that._state = null;
        that._parent = null;
        that._parentArray = null;
        that._propertyName = null;
    }
}
exports.Instance = Instance;
