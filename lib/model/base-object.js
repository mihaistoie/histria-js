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
const roleHasOne_1 = require("./roleHasOne");
const roleBelongsTo_1 = require("./roleBelongsTo");
const errors_1 = require("../utils/errors");
const model_manager_1 = require("./model-manager");
const schemaUtils = require("../schema/schema-utils");
const schema_consts_1 = require("../schema/schema-consts");
const number_1 = require("./number");
const event_stack_1 = require("./event-stack");
const helper = require("../utils/helper");
const util = require("util");
const uuid = require("uuid");
class Instance {
    //used for relations = called by belongsTo
    removeChild(relationName, child) {
        return __awaiter(this, void 0, void 0, function* () {
            let that = this;
            let rel = that._schema.relations[relationName];
            let localRole = that._children[relationName];
            if (rel && localRole) {
                if (rel.type === schema_consts_1.RELATION_TYPE.hasOne)
                    yield localRole.value(null);
                else if (rel.type === schema_consts_1.RELATION_TYPE.hasMany)
                    yield localRole.remove(child);
            }
        });
    }
    //used for relations = called by belongsTo
    addChild(relationName, child) {
        return __awaiter(this, void 0, void 0, function* () {
            let that = this;
            let rel = that._schema.relations[relationName];
            let localRole = that._children[relationName];
            if (rel && localRole) {
                if (rel.type === schema_consts_1.RELATION_TYPE.hasOne)
                    yield localRole.value(child);
                else if (rel.type === schema_consts_1.RELATION_TYPE.hasMany)
                    yield localRole.add(child);
            }
        });
    }
    //used for relations = called by belongsTo / HasOneComposition
    changeParent(newParent, propName, notify) {
        return __awaiter(this, void 0, void 0, function* () {
            let that = this;
            that._parent = newParent;
            that._rootCache = null;
            if (notify && propName) {
                yield that.changeProperty(propName, that._parent, newParent, function () {
                    that._parent = newParent;
                });
            }
            else {
                that._parent = newParent;
            }
        });
    }
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
    get transaction() {
        return this._transaction;
    }
    get parent() {
        return this._parent;
    }
    get uuid() {
        return this._model.$uuid;
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
        that._schema && that._schema.relations && Object.keys(that._schema.relations).forEach(relName => {
            let relation = that._schema.relations[relName];
            switch (relation.type) {
                case schema_consts_1.RELATION_TYPE.hasOne:
                    if (relation.aggregationKind === schema_consts_1.AGGREGATION_KIND.none) {
                        //reference
                        that._children[relName] = new roleHasOne_1.HasOneRef(that, relName, relation);
                    }
                    else if (relation.aggregationKind === schema_consts_1.AGGREGATION_KIND.shared) {
                        //aggregation
                        that._children[relName] = new roleHasOne_1.HasOneAggregation(that, relName, relation);
                    }
                    else if (relation.aggregationKind === schema_consts_1.AGGREGATION_KIND.composite) {
                        //composition
                        that._children[relName] = new roleHasOne_1.HasOneComposition(that, relName, relation);
                    }
                    break;
                case schema_consts_1.RELATION_TYPE.belongsTo:
                    if (relation.aggregationKind === schema_consts_1.AGGREGATION_KIND.shared) {
                        //aggregation
                        that._children[relName] = new roleBelongsTo_1.AggregationBelongsTo(that, relName, relation);
                    }
                    else if (relation.aggregationKind === schema_consts_1.AGGREGATION_KIND.composite) {
                        //composition
                        that._children[relName] = new roleBelongsTo_1.CompositionBelongsTo(that, relName, relation);
                    }
                    break;
                case schema_consts_1.RELATION_TYPE.hasMany:
                    if (relation.aggregationKind === schema_consts_1.AGGREGATION_KIND.none) {
                    }
                    else if (relation.aggregationKind === schema_consts_1.AGGREGATION_KIND.shared) {
                    }
                    else if (relation.aggregationKind === schema_consts_1.AGGREGATION_KIND.composite) {
                    }
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
    model(propName) {
        let that = this;
        return propName ? that._model[propName] : that._model;
    }
    beforePropertyChanged(propName, oldValue, newValue) {
        return __awaiter(this, void 0, void 0, function* () {
            // check can modify ?
        });
    }
    changeProperty(propName, oldValue, newValue, hnd) {
        return __awaiter(this, void 0, void 0, function* () {
            let that = this;
            let eventInfo = that._getEventInfo();
            eventInfo.push({ path: that.getPath(propName), eventType: interfaces_1.EventType.propChanged });
            try {
                try {
                    // clear errors for propName
                    that._errors[propName].error = '';
                    yield that.beforePropertyChanged(propName, oldValue, newValue);
                    //change property
                    hnd();
                    if (that.status === interfaces_1.ObjectStatus.idle) {
                        // Validation rules
                        yield that._transaction.emitInstanceEvent(interfaces_1.EventType.propValidate, eventInfo, that.constructor, that, propName, newValue);
                        // Propagation rules
                        yield that._transaction.emitInstanceEvent(interfaces_1.EventType.propChanged, eventInfo, that.constructor, that, propName, newValue, oldValue);
                    }
                }
                catch (ex) {
                    that._errors[propName].addException(ex);
                }
            }
            finally {
                eventInfo.pop();
            }
        });
    }
    getOrSetProperty(propName, value) {
        return __awaiter(this, void 0, void 0, function* () {
            let that = this;
            let isSet = (value !== undefined), propPath;
            let rel = that._schema.relations ? that._schema.relations[propName] : null;
            if (rel) {
                //TODO traiter relations
                return null;
            }
            let propSchema = that._schema.properties[propName];
            let mm = new model_manager_1.ModelManager();
            if (!propSchema)
                throw new errors_1.ApplicationError(util.format('Property not found: "%s".', propName));
            if (isSet)
                isSet = !schemaUtils.isReadOnly(propSchema);
            if (isSet) {
                // set
                if (that._model[propName] !== value) {
                    let oldValue = that._model[propName];
                    yield that.changeProperty(propName, oldValue, value, function () {
                        that._model[propName] = value;
                    });
                }
            }
            return that._model[propName];
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
        //check uid 
        checkuuid(value);
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
function checkuuid(value) {
    //check uuid 
    if (value && !value.$uuid) {
        if (value.$isNew || !value.id) {
            value.$uuid = uuid.v1();
            value.id = value.$uuid;
        }
        else
            value.$uuid = value.id + ' ';
    }
}
