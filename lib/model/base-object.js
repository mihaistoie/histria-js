"use strict";
const errors_1 = require('../utils/errors');
const util = require('util');
class Instance {
    constructor(parent, parentArray, propertyName, schema) {
        let that = this;
        that._schema = schema;
        that.init();
    }
    propertyChanged(propName, value, oldValue, callStackInfo) {
    }
    stateChanged(propName, value, oldValue, callStackInfo) {
    }
    init() { }
    modelState(propName) {
        return null;
    }
    getOrSetProperty(propName, value) {
        let that = this;
        let propSchema = that._schema.properties[propName];
        if (!propSchema)
            return Promise.reject(new errors_1.ApplicationError(util.format('Property not found: "%s".', propName)));
        if (value === 'undefined') {
            // get
            return Promise.resolve(that._model[propSchema]);
        }
        else {
            // set
            that._model[propSchema] = value;
            return Promise.resolve(that._model[propSchema]);
        }
    }
}
exports.Instance = Instance;
