"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const interfaces_1 = require("./interfaces");
const errors_1 = require("../utils/errors");
const model_manager_1 = require("./model-manager");
const schemaUtils = require("../schema/schema-utils");
const schema_consts_1 = require("../schema/schema-consts");
const number_1 = require("./number");
const event_stack_1 = require("./event-stack");
const helper = require("../utils/helper");
const util = require("util");
class Instance {
    _getEventInfo() {
        let that = this;
        let root = that.getRoot();
        if (root === this) {
            if (!that._eventInfo)
                that._eventInfo = new event_stack_1.EventInfoStack();
            return that._eventInfo;
        }
        else
            return root._getEventInfo();
    }
    get context() {
        return this._context;
    }
    get isNew() {
        return this._model.isNew === true;
    }
    getPath(propName) {
        let that = this;
        let root = that._parentArray ? that._parentArray.getPath(that) : (that._parent ? that._parent.getPath(that._propertyName) : '');
        return propName ? (root ? (root + '.' + propName) : propName) : root;
    }
    get propertyName() {
        return this._propertyName;
    }
    getRoot() {
        let that = this;
        if (!that._rootCache)
            that._rootCache = that._parentArray ? that._parentArray.getRoot() : (that._parent ? that._parent.getRoot() : that);
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
        that.createErrors();
        that._createProperties();
    }
    createErrors() { }
    createStates() { }
    get status() {
        let that = this;
        let root = that.getRoot();
        return root._status;
    }
    set status(value) {
        let that = this;
        let root = that.getRoot();
        root._status = value;
    }
    getSchema(propName) {
        let that = this;
        if (!propName || propName === '$')
            return that._schema;
        return that._schema.properties[propName];
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
    modelErrors(propName) {
        let that = this;
        that._model.$errors = that._model.$errors || {};
        if (propName === '$' && !that._parentArray && that._parent && that._propertyName) {
            return that._parent.modelErrors(that._propertyName);
        }
        that._model.$errors[propName] = that._model.$errors[propName] || [];
        return that._model.$errors[propName];
    }
    modelState(propName) {
        let that = this;
        that._model.$states = that._model.$states || {};
        let ss = that._model.$states[propName];
        if (!ss) {
            //if $states[propName] not exists init using schema 
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
                eventInfo.push({ path: that.getPath(propName), eventType: interfaces_1.EventType.propChanged });
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
                        try {
                            // clear errors for propName
                            // I don't now what to do 
                            that._errors[propName].error = '';
                            that._children[propName] = value;
                        }
                        catch (ex) {
                            that._errors[propName].addException(ex);
                        }
                    }
                }
                else {
                    if (isSet) {
                        // set
                        if (that._model[propName] !== value) {
                            let oldValue = that._model[propName];
                            that._model[propName] = value;
                            try {
                                // clear errors for propName
                                that._errors[propName].error = '';
                                // Validate rules 
                                if (that.status === interfaces_1.ObjectStatus.idle)
                                    yield that._transaction.emitInstanceEvent(interfaces_1.EventType.propValidate, eventInfo, that.constructor, that, propName, that._model[propName]);
                                // Proppagation rules
                                if (that.status === interfaces_1.ObjectStatus.idle)
                                    yield that._transaction.emitInstanceEvent(interfaces_1.EventType.propChanged, eventInfo, that.constructor, that, propName, that._model[propName], oldValue);
                            }
                            catch (ex) {
                                that._errors[propName].addException(ex);
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
    afterCreated() {
        return __awaiter(this, void 0, void 0, function* () {
            let that = this;
            if (that._afterCreateCalled)
                return;
            that._afterCreateCalled = true;
            let eventInfo = that._getEventInfo();
            try {
                if (that.status === interfaces_1.ObjectStatus.creating) {
                    yield that._transaction.emitInstanceEvent(interfaces_1.EventType.init, eventInfo, that.constructor, that);
                }
            }
            finally {
                that.status = interfaces_1.ObjectStatus.idle;
            }
        });
    }
    validate(options) {
        return __awaiter(this, void 0, void 0, function* () {
            let that = this;
            let eventInfo = that._getEventInfo();
            if (that.status === interfaces_1.ObjectStatus.idle) {
                if (options && options.full) {
                }
                try {
                    yield that._transaction.emitInstanceEvent(interfaces_1.EventType.objValidate, eventInfo, that.constructor, that);
                }
                catch (ex) {
                    that._errors['$'].addException(ex);
                }
            }
        });
    }
    constructor(transaction, parent, parentArray, propertyName, value, options) {
        let that = this;
        that._context = transaction.context;
        that._parent = parent;
        that._parentArray = parentArray;
        that.status = options.isRestore ? interfaces_1.ObjectStatus.restoring : interfaces_1.ObjectStatus.creating;
        that._propertyName = propertyName;
        that._transaction = transaction;
        that.init();
        that._setModel(value);
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
        if (that._errors) {
            that._errors.destroy();
            that._errors = null;
        }
        that._context = null;
        that._parent = null;
        that._parentArray = null;
        that._propertyName = null;
    }
    get $states() {
        return this._states;
    }
    get $errors() {
        return this._errors;
    }
}
exports.Instance = Instance;
