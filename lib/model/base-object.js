"use strict";
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
        let that = this;
        let propSchema = that._schema.properties[propName];
        let mm = new model_manager_1.ModelManager();
        if (!propSchema)
            return Promise.reject(new errors_1.ApplicationError(util.format('Property not found: "%s".', propName)));
        if (schemaUtils.isComplex(propSchema)) {
            if (value === undefined) {
                return Promise.resolve(that._children[propSchema]);
            }
            else {
                if (schemaUtils.isArray(propSchema))
                    return Promise.reject(new errors_1.ApplicationError(util.format('Can\'t set "%s", because is an array.', propName)));
                that._children[propName] = value;
                return Promise.resolve(that._children[propName]);
            }
        }
        else {
            if (value === undefined) {
                // get
                return Promise.resolve(that._model[propName]);
            }
            else {
                // set
                if (that._model[propName] !== value) {
                    that._model[propName] = value;
                    let rules = mm.rulesForPropChange(that.constructor, propName);
                }
                return Promise.resolve(that._model[propName]);
            }
        }
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
