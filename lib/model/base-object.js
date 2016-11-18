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
const schema_consts_1 = require('../schema/schema-consts');
const state_1 = require('./state');
const number_1 = require('./number');
const helper = require('../utils/helper');
const util = require('util');
class InstanceState {
    constructor(parent, schema) {
        let that = this;
        that._states = {};
        that._schema = schema;
        that._parent = parent;
        schema && schema.properties && Object.keys(schema.properties).forEach(propName => {
            let cs = schema.properties[propName];
            let propType = schemaUtils.typeOfProperty(cs);
            if (cs.enum) {
                that._states[propName] = new state_1.EnumState(that._parent, propName);
            }
            else {
                switch (propType) {
                    case schema_consts_1.JSONTYPES.integer:
                        that._states[propName] = new state_1.IntegerState(that._parent, propName);
                        break;
                    case schema_consts_1.JSONTYPES.number:
                        that._states[propName] = new state_1.NumberState(that._parent, propName);
                        break;
                    case schema_consts_1.JSONTYPES.date:
                        that._states[propName] = new state_1.DateState(that._parent, propName);
                        break;
                    case schema_consts_1.JSONTYPES.datetime:
                        that._states[propName] = new state_1.DateTimeState(that._parent, propName);
                        break;
                    case schema_consts_1.JSONTYPES.array:
                        break;
                    case schema_consts_1.JSONTYPES.object:
                        break;
                    case schema_consts_1.JSONTYPES.refobject:
                        that._states[propName] = new state_1.RefObjectState(that._parent, propName);
                        break;
                    case schema_consts_1.JSONTYPES.refarray:
                        that._states[propName] = new state_1.RefArrayState(that._parent, propName);
                        break;
                    default:
                        that._states[propName] = new state_1.StringState(that._parent, propName);
                        break;
                }
            }
        });
    }
    destroy() {
        let that = this;
        if (that._states) {
            helper.destroy(that._states);
            that._states = null;
        }
        that._schema = null;
        that._parent = null;
    }
}
exports.InstanceState = InstanceState;
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
        if (!value)
            throw "Invalid model (null).";
        that._model = value;
        if (that._children)
            helper.destroy(that._children);
        that._children = {};
        that.createStates();
        that._createProperties();
    }
    createStates() { }
    _createProperties() {
        let that = this;
        that._schema && that._schema.properties && Object.keys(that._schema.properties).forEach(propName => {
            let cs = that._schema.properties[propName];
            let propType = schemaUtils.typeOfProperty(cs);
            switch (propType) {
                case schema_consts_1.JSONTYPES.integer:
                    that._children[propName] = new number_1.IntegerValue(that, propName);
                    break;
                case schema_consts_1.JSONTYPES.number:
                    that._children[propName] = new number_1.NumberValue(that, propName);
                    break;
            }
        });
    }
    modelState(propName) {
        let that = this;
        that._model.$states = that._model.$states || {};
        let ss = that._model.$states[propName];
        if (!ss) {
            if (that._schema.states && that._schema.states[propName])
                ss = helper.clone(that._schema.states[propName]);
            else
                ss = {};
            that._model.$states[propName] = ss;
        }
        return ss;
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
    dstroy() {
        let that = this;
        that._schema = null;
        that._model = null;
        if (that._states) {
            that._states.destroy();
            that._states = null;
        }
        if (that._children) {
            helper.destroy(that._children);
            that._children = null;
        }
        that._parent = null;
        that._parentArray = null;
        that._propertyName = null;
    }
    get states() {
        return this._states;
    }
}
exports.Instance = Instance;
