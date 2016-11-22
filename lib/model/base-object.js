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
const consts_1 = require('../consts/consts');
const state_1 = require('./state');
const number_1 = require('./number');
const helper = require('../utils/helper');
const util = require('util');
class InstanceEventInfo {
    constructor() {
        let that = this;
        that._stack = [];
    }
    push(info) {
        let that = this;
        that._stack.push(info);
    }
    pop() {
        let that = this;
        that._stack.pop();
    }
    isTriggeredBy(propertyName, target) {
        let that = this;
        let path = target.getPath();
        let fp = path ? path + '.' + propertyName : propertyName;
        for (let i = 0, len = that._stack.length; i < len; i++) {
            let info = that._stack[i];
            if (info && info.eventType === consts_1.RULE_TRIGGERS.PROP_CHANGED) {
                if (fp === info.path)
                    return true;
            }
        }
        return false;
    }
    destroy() {
        let that = this;
        that._stack = null;
    }
}
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
    constructor(transaction, parent, parentArray, propertyName, value, options) {
        let that = this;
        that._status = consts_1.ObjectStatus.idle;
        that._propertyName = propertyName;
        that.init();
        that._setModel(value);
    }
    _getEventInfo() {
        let that = this;
        let root = that.getRoot();
        if (root === this) {
            if (!that._eventInfo)
                that._eventInfo = new InstanceEventInfo();
            return that._eventInfo;
        }
        else
            return root._getEventInfo();
    }
    getPath(propName) {
        let that = this;
        let root = that._parentArray ? that._parentArray.getPath(that) : (that._parent ? that._parent.getPath(that._propertyName) : '');
        return propName ? (root ? (root + '.' + propName) : propName) : root;
    }
    getRoot() {
        let that = this;
        if (!that._rootCache)
            that._rootCache = that._parent ? that._parent.getRoot() : that;
        return that._rootCache;
    }
    propertyChanged(propName, value, oldValue, eventInfo) {
    }
    stateChanged(propName, value, oldValue, eventInfo) {
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
    _canExecutePropChangeRule() {
        let that = this;
        let root = that.getRoot();
        return root._status === consts_1.ObjectStatus.idle;
    }
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
            let isSet = (value !== undefined), isComplex = false, propPath;
            let eventInfo = that._getEventInfo();
            if (isSet)
                eventInfo.push({ path: that.getPath(propName), eventType: consts_1.RULE_TRIGGERS.PROP_CHANGED });
            try {
                let propSchema = that._schema.properties[propName];
                let mm = new model_manager_1.ModelManager();
                if (!propSchema)
                    throw new errors_1.ApplicationError(util.format('Property not found: "%s".', propName));
                if (schemaUtils.isComplex(propSchema)) {
                    isComplex = true;
                    if (isSet) {
                        if (schemaUtils.isArray(propSchema))
                            throw new errors_1.ApplicationError(util.format('Can\'t set "%s", because is an array.', propName));
                        that._children[propName] = value;
                    }
                }
                else {
                    if (isSet) {
                        // set
                        if (that._model[propName] !== value) {
                            that._model[propName] = value;
                            if (that._canExecutePropChangeRule()) {
                                let rules = mm.rulesForPropChange(that.constructor, propName);
                                if (rules.length) {
                                    for (let i = 0, len = rules.length; i < len; i++) {
                                        let rule = rules[i];
                                        yield rule(that, eventInfo);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            finally {
                if (isSet)
                    eventInfo.pop();
            }
            return isComplex ? that._children[propName] : that._model[propName];
        });
    }
    destroy() {
        let that = this;
        that._schema = null;
        that._model = null;
        that._rootCache = null;
        if (that._states) {
            that._states.destroy();
            that._states = null;
        }
        if (that._children) {
            helper.destroy(that._children);
            that._children = null;
        }
        if (that._eventInfo) {
            that._eventInfo.destroy();
            that._eventInfo = null;
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
