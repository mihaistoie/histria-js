"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const interfaces_1 = require("./interfaces");
const role_has_one_1 = require("./relations/role-has-one");
const role_belongs_to_1 = require("./relations/role-belongs-to");
const role_has_many_1 = require("./relations/role-has-many");
const histria_utils_1 = require("histria-utils");
const model_manager_1 = require("./model-manager");
const number_1 = require("./types/number");
const id_1 = require("./types/id");
const base_instance_1 = require("./base-instance");
const util = require("util");
const uuid = require("uuid");
class ModelObject extends base_instance_1.BaseInstance {
    getRoleByName(roleName) {
        return this._children[roleName];
    }
    rmvObjectFromRole(roleName, instance) {
        return __awaiter(this, void 0, void 0, function* () {
            let that = this;
            let rel = that._schema.relations[roleName];
            let localRole = that.getRoleByName(roleName);
            if (rel && localRole) {
                if (rel.type === histria_utils_1.RELATION_TYPE.hasOne)
                    yield localRole.setValue(null);
                else if (rel.type === histria_utils_1.RELATION_TYPE.hasMany)
                    yield localRole.remove(instance);
            }
        });
    }
    addObjectToRole(roleName, instance) {
        return __awaiter(this, void 0, void 0, function* () {
            let that = this;
            let rel = that._schema.relations[roleName];
            let localRole = that.getRoleByName(roleName);
            if (rel && localRole) {
                if (rel.type === histria_utils_1.RELATION_TYPE.hasOne)
                    yield localRole.setValue(instance);
                else if (rel.type === histria_utils_1.RELATION_TYPE.hasMany)
                    yield localRole.add(instance);
            }
        });
    }
    //used for relations = called by CompositionBelongsTo / HasOneComposition
    changeParent(newParent, foreignPropName, localPropName, notify) {
        return __awaiter(this, void 0, void 0, function* () {
            let that = this;
            if (that._parent === newParent)
                return;
            that._parent = newParent;
            that._propertyName = that._parent ? foreignPropName : '';
            that._rootCache = null;
            if (notify && localPropName) {
                yield that.changeProperty(localPropName, that._parent, newParent, function () {
                    that._parent = newParent;
                });
            }
            else {
                that._parent = newParent;
            }
        });
    }
    get parent() {
        return this._parent;
    }
    get uuid() {
        return this._model.$uuid;
    }
    get isNew() {
        return this._model.$isNew === true;
    }
    getPath(propName) {
        let that = this;
        let root = that._parent ? that._parent.getPath(that._propertyName) : '';
        return propName ? (root ? (root + '.' + propName) : propName) : root;
    }
    get propertyName() {
        return this._propertyName;
    }
    getRoot() {
        let that = this;
        if (!that._rootCache)
            that._rootCache = that._parent ? that._parent.getRoot() : that;
        return that._rootCache;
    }
    standalone() {
        let that = this;
        if (!that._schema.meta || !that._schema.meta.parent)
            return true;
        return !!!that._parent;
    }
    changeState(propName, value, oldValue, eventInfo) {
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
            histria_utils_1.helper.destroy(that._children);
        that._children = {};
        that.createStates();
        that.createErrors();
        that._createProperties();
    }
    createErrors() { }
    createStates() { }
    get status() {
        return this._status;
    }
    set status(value) {
        this._status = value;
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
            let propType = histria_utils_1.schemaUtils.typeOfProperty(cs);
            if (that.isNew && cs.default !== undefined && that._model[propName] === undefined)
                that._model[propName] = cs.default;
            switch (propType) {
                case histria_utils_1.JSONTYPES.integer:
                    that._children[propName] = new number_1.IntegerValue(that, propName);
                    break;
                case histria_utils_1.JSONTYPES.id:
                    that._children[propName] = new id_1.IdValue(that, propName);
                    break;
                case histria_utils_1.JSONTYPES.number:
                    that._children[propName] = new number_1.NumberValue(that, propName);
                    break;
            }
        });
        that._schema && that._schema.relations && Object.keys(that._schema.relations).forEach(relName => {
            let relation = that._schema.relations[relName];
            switch (relation.type) {
                case histria_utils_1.RELATION_TYPE.hasOne:
                    if (relation.aggregationKind === histria_utils_1.AGGREGATION_KIND.none) {
                        //reference
                        that._children[relName] = new role_has_one_1.HasOneRef(that, relName, relation);
                    }
                    else if (relation.aggregationKind === histria_utils_1.AGGREGATION_KIND.shared) {
                        //aggregation
                        that._children[relName] = new role_has_one_1.HasOneAggregation(that, relName, relation);
                    }
                    else if (relation.aggregationKind === histria_utils_1.AGGREGATION_KIND.composite) {
                        //composition
                        that._children[relName] = new role_has_one_1.HasOneComposition(that, relName, relation);
                    }
                    break;
                case histria_utils_1.RELATION_TYPE.belongsTo:
                    if (relation.aggregationKind === histria_utils_1.AGGREGATION_KIND.shared) {
                        //aggregation
                        that._children[relName] = new role_belongs_to_1.AggregationBelongsTo(that, relName, relation);
                    }
                    else if (relation.aggregationKind === histria_utils_1.AGGREGATION_KIND.composite) {
                        //composition
                        that._children[relName] = new role_belongs_to_1.CompositionBelongsTo(that, relName, relation);
                    }
                    break;
                case histria_utils_1.RELATION_TYPE.hasMany:
                    if (relation.aggregationKind === histria_utils_1.AGGREGATION_KIND.none) {
                        //reference
                    }
                    else if (relation.aggregationKind === histria_utils_1.AGGREGATION_KIND.shared) {
                        //aggregation
                        that._children[relName] = new role_has_many_1.HasManyAggregation(that, relName, relation);
                    }
                    else if (relation.aggregationKind === histria_utils_1.AGGREGATION_KIND.composite) {
                        //composition
                        that._children[relName] = new role_has_many_1.HasManyComposition(that, relName, relation, that._model[relName]);
                    }
                    break;
            }
        });
    }
    isArrayComposition(propName) {
        let that = this;
        if (that._schema.relations && that._schema.relations[propName]) {
            let rel = that._schema.relations[propName];
            return rel.type === histria_utils_1.RELATION_TYPE.hasMany && rel.aggregationKind === histria_utils_1.AGGREGATION_KIND.composite;
        }
    }
    modelErrors(propName) {
        let that = this;
        that._model.$errors = that._model.$errors || {};
        if (propName === '$' && that._parent && that._propertyName && !that._parent.isArrayComposition(that._propertyName)) {
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
                ss = histria_utils_1.helper.clone(that._schema.states[propName]);
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
    notifyOperation(propName, op, param) {
        return __awaiter(this, void 0, void 0, function* () {
            let that = this;
            let eventInfo = that.transaction.eventInfo;
            eventInfo.push({ path: that.getPath(propName), eventType: interfaces_1.EventType.propChanged });
            try {
                yield that._transaction.emitInstanceEvent(op, eventInfo, that, propName, param);
            }
            finally {
                eventInfo.pop();
            }
        });
    }
    changeProperty(propName, oldValue, newValue, hnd) {
        return __awaiter(this, void 0, void 0, function* () {
            let that = this;
            let eventInfo = that.transaction.eventInfo;
            eventInfo.push({ path: that.getPath(propName), eventType: interfaces_1.EventType.propChanged });
            try {
                try {
                    // clear errors for propName
                    that._errorByName(propName).error = '';
                    yield that.beforePropertyChanged(propName, oldValue, newValue);
                    //change property
                    hnd();
                    if (that.status === interfaces_1.ObjectStatus.idle) {
                        // Validation rules
                        yield that._transaction.emitInstanceEvent(interfaces_1.EventType.propValidate, eventInfo, that, propName, newValue);
                        // Propagation rules
                        yield that._transaction.emitInstanceEvent(interfaces_1.EventType.propChanged, eventInfo, that, propName, newValue, oldValue);
                    }
                }
                catch (ex) {
                    that._errorByName(propName).addException(ex);
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
            let isSet = (value !== undefined);
            let propSchema = that._schema.properties[propName];
            let mm = model_manager_1.modelManager();
            if (!propSchema)
                throw new histria_utils_1.ApplicationError(util.format('Property not found: "%s".', propName));
            if (isSet)
                isSet = !histria_utils_1.schemaUtils.isReadOnly(propSchema);
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
    getPropertyByName(propName) {
        let that = this;
        let propSchema = that._schema.properties[propName];
        let mm = model_manager_1.modelManager();
        if (!propSchema)
            throw new histria_utils_1.ApplicationError(util.format('Property not found: "%s".', propName));
        return that._model[propName];
    }
    setPropertyByName(propName, value) {
        return __awaiter(this, void 0, void 0, function* () {
            let that = this;
            let propSchema = that._schema.properties[propName];
            let mm = model_manager_1.modelManager();
            if (!propSchema)
                throw new histria_utils_1.ApplicationError(util.format('Property not found: "%s".', propName));
            if (!histria_utils_1.schemaUtils.isReadOnly(propSchema)) {
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
            let eventInfo = that.transaction.eventInfo;
            try {
                if (that.status === interfaces_1.ObjectStatus.creating) {
                    yield that._transaction.emitInstanceEvent(interfaces_1.EventType.init, eventInfo, that);
                }
            }
            finally {
                that.status = interfaces_1.ObjectStatus.idle;
            }
        });
    }
    afterRestore() {
        let that = this;
        if (that._afterCreateCalled)
            return;
        that._afterCreateCalled = true;
        that.status = interfaces_1.ObjectStatus.idle;
    }
    enumChildren(cb) {
        let that = this;
        histria_utils_1.schemaUtils.enumCompositions(that._schema.relations, function (relationName, relation) {
            let role = that._children[relationName];
            if (role)
                role.enumChildren(cb);
        });
    }
    validate(options) {
        return __awaiter(this, void 0, void 0, function* () {
            let that = this;
            let eventInfo = that.transaction.eventInfo;
            if (that.status === interfaces_1.ObjectStatus.idle) {
                if (options && options.full) {
                    //TODO validate all properties
                }
                try {
                    yield that._transaction.emitInstanceEvent(interfaces_1.EventType.objValidate, eventInfo, that);
                }
                catch (ex) {
                    that._errorByName('$').addException(ex);
                }
            }
        });
    }
    _errorByName(propName) {
        let that = this;
        let errors = that._errors;
        return errors[propName];
    }
    constructor(transaction, parent, propertyName, value, options) {
        super(transaction);
        let that = this;
        that._parent = parent ? parent : undefined;
        that.status = options.isRestore ? interfaces_1.ObjectStatus.restoring : interfaces_1.ObjectStatus.creating;
        that._propertyName = propertyName;
        that.init();
        //check uid 
        checkuuid(value);
        that._setModel(value);
    }
    destroy() {
        let that = this;
        if (that._states) {
            that._states.destroy();
            that._states = null;
        }
        if (that._children) {
            histria_utils_1.helper.destroy(that._children);
            that._children = null;
        }
        if (that._errors) {
            that._errors.destroy();
            that._errors = null;
        }
        if (that._transaction) {
            that._transaction.removeInstance(model_manager_1.modelManager().classByName(that._schema.name, that._schema.nameSpace), that);
        }
        that._schema = null;
        that._model = null;
        that._rootCache = null;
        that._parent = null;
        that._propertyName = null;
        super.destroy();
    }
    get $states() {
        return this._states;
    }
    get $errors() {
        return this._errors;
    }
}
exports.ModelObject = ModelObject;
function checkuuid(value) {
    //check uuid 
    if (!value.$uuid) {
        if (value.$isNew || !value.id) {
            value.$uuid = uuid.v1();
            value.id = value.$uuid;
        }
        else
            value.$uuid = value.id + '';
    }
}
