"use strict";
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
    addListener(listener, parent, propertyName) {
        const that = this;
        that._listeners = that._listeners || [];
        that._listeners.push({ listener: listener, parent: parent, propertyName: propertyName });
    }
    rmvListener(listener) {
        const that = this;
        if (that._listeners) {
            const index = that._listeners.findIndex(value => value.listener === listener);
            if (index >= 0)
                that._listeners.splice(index, 1);
        }
    }
    getListeners(noParent) {
        const that = this;
        const res = [];
        if (!noParent && that._parent)
            res.push({ instance: that._parent, propertyName: that.propertyName, isOwner: true });
        that._listeners && that._listeners.forEach(item => res.push({ instance: item.parent, propertyName: item.propertyName, isOwner: false }));
        return res;
    }
    getRoleByName(roleName) {
        return this._children[roleName];
    }
    async rmvObjectFromRole(roleName, instance) {
        let that = this;
        let rel = that._schema.relations[roleName];
        let localRole = that.getRoleByName(roleName);
        if (rel && localRole) {
            if (rel.type === histria_utils_1.RELATION_TYPE.hasOne)
                await localRole.setValue(null);
            else if (rel.type === histria_utils_1.RELATION_TYPE.hasMany)
                await localRole.remove(instance);
        }
    }
    async addObjectToRole(roleName, instance) {
        let that = this;
        let rel = that._schema.relations[roleName];
        let localRole = that.getRoleByName(roleName);
        if (rel && localRole) {
            if (rel.type === histria_utils_1.RELATION_TYPE.hasOne)
                await localRole.setValue(instance);
            else if (rel.type === histria_utils_1.RELATION_TYPE.hasMany)
                await localRole.add(instance);
        }
    }
    // Used for relations = called by CompositionBelongsTo / HasOneComposition
    async changeParent(newParent, foreignPropName, localPropName, notify) {
        let that = this;
        if (that._parent === newParent)
            return;
        that._parent = newParent;
        that._propertyName = that._parent ? foreignPropName : '';
        that._rootCache = null;
        if (notify && localPropName) {
            await that.changeProperty(localPropName, that._parent, newParent, () => {
                that._parent = newParent;
            }, { isLazyLoading: false });
        }
        else {
            that._parent = newParent;
        }
    }
    get owner() {
        return this._parent;
    }
    get uuid() {
        return this._model._uuid;
    }
    get isPersistent() {
        return true;
    }
    get isNew() {
        return this._model._isNew === true;
    }
    get isDirty() {
        return this._model._isDirty;
    }
    set isDirty(value) {
        this._model._isDirty = value;
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
    // Called only on create or on load
    _setModel(value) {
        let that = this;
        if (!value)
            throw 'Invalid model (null).';
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
    restored() { }
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
    _createRelations() {
        const that = this;
        that._schema && that._schema.relations && Object.keys(that._schema.relations).forEach(relName => {
            const relation = that._schema.relations[relName];
            switch (relation.type) {
                case histria_utils_1.RELATION_TYPE.hasOne:
                    if (relation.aggregationKind === histria_utils_1.AGGREGATION_KIND.none) {
                        // Reference
                        that._children[relName] = new role_has_one_1.HasOneRef(that, relName, relation);
                    }
                    else if (relation.aggregationKind === histria_utils_1.AGGREGATION_KIND.shared) {
                        // Aggregation
                        that._children[relName] = new role_has_one_1.HasOneAggregation(that, relName, relation);
                    }
                    else if (relation.aggregationKind === histria_utils_1.AGGREGATION_KIND.composite) {
                        // Composition
                        that._children[relName] = new role_has_one_1.HasOneComposition(that, relName, relation);
                    }
                    break;
                case histria_utils_1.RELATION_TYPE.belongsTo:
                    if (relation.aggregationKind === histria_utils_1.AGGREGATION_KIND.shared) {
                        // Aggregation
                        that._children[relName] = new role_belongs_to_1.AggregationBelongsTo(that, relName, relation);
                    }
                    else if (relation.aggregationKind === histria_utils_1.AGGREGATION_KIND.composite) {
                        // Composition
                        that._children[relName] = new role_belongs_to_1.CompositionBelongsTo(that, relName, relation);
                    }
                    break;
                case histria_utils_1.RELATION_TYPE.hasMany:
                    if (relation.aggregationKind === histria_utils_1.AGGREGATION_KIND.none) {
                        // Reference
                    }
                    else if (relation.aggregationKind === histria_utils_1.AGGREGATION_KIND.shared) {
                        // Aggregation
                        that._children[relName] = new role_has_many_1.HasManyAggregation(that, relName, relation);
                    }
                    else if (relation.aggregationKind === histria_utils_1.AGGREGATION_KIND.composite) {
                        // Composition
                        that._children[relName] = new role_has_many_1.HasManyComposition(that, relName, relation, that._model[relName]);
                    }
                    break;
            }
        });
    }
    _createViewRelations() {
        const that = this;
        that._schema && that._schema.relations && Object.keys(that._schema.relations).forEach(relName => {
            const relation = that._schema.relations[relName];
            switch (relation.type) {
                case histria_utils_1.RELATION_TYPE.hasOne:
                    that._children[relName] = new role_has_one_1.HasOneRefObject(that, relName, relation);
                    break;
                case histria_utils_1.RELATION_TYPE.hasMany:
                    break;
            }
        });
    }
    _createProperties() {
        const that = this;
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
        if (that._schema.view)
            that._createViewRelations();
        else
            that._createRelations();
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
            // If $states[propName] not exists init using schema
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
    async beforePropertyChanged(propName, oldValue, newValue) {
        // Check can modify ?
    }
    async notifyOperation(propName, op, param) {
        let that = this;
        let eventInfo = that.transaction.eventInfo;
        eventInfo.push({ path: that.getPath(propName), eventType: interfaces_1.EventType.propChanged });
        try {
            that.isDirty = true;
            await that._transaction.emitInstanceEvent(op, eventInfo, that, propName, param);
        }
        finally {
            eventInfo.pop();
        }
    }
    async changeProperty(propName, oldValue, newValue, hnd, options) {
        let that = this;
        let eventInfo = that.transaction.eventInfo;
        eventInfo.push({ path: that.getPath(propName), eventType: interfaces_1.EventType.propChanged });
        try {
            eventInfo.isLazyLoading = options.isLazyLoading;
            if (options.isLazyLoading) {
                await that._transaction.emitInstanceEvent(interfaces_1.EventType.propChanged, eventInfo, that, propName, newValue, oldValue);
            }
            else {
                const error = that._errorByName(propName);
                if (error)
                    error.error = '';
                try {
                    // Clear errors for propName
                    await that.beforePropertyChanged(propName, oldValue, newValue);
                    // Change property
                    hnd();
                    that.isDirty = true;
                    if (that.status === interfaces_1.ObjectStatus.idle) {
                        // Validation rules
                        await that._transaction.emitInstanceEvent(interfaces_1.EventType.propValidate, eventInfo, that, propName, newValue);
                        // Propagation rules
                        await that._transaction.emitInstanceEvent(interfaces_1.EventType.propChanged, eventInfo, that, propName, newValue, oldValue);
                    }
                }
                catch (ex) {
                    if (error)
                        error.addException(ex);
                }
            }
        }
        finally {
            eventInfo.pop();
        }
    }
    async getOrSetProperty(propName, value) {
        let that = this;
        let isSet = (value !== undefined);
        let propSchema = that._schema.properties[propName];
        let mm = model_manager_1.modelManager();
        if (!propSchema)
            throw new histria_utils_1.ApplicationError(util.format('Property not found: "%s".', propName));
        if (isSet)
            isSet = !histria_utils_1.schemaUtils.isReadOnly(propSchema);
        if (isSet) {
            // Set
            if (that._model[propName] !== value) {
                let oldValue = that._model[propName];
                await that.changeProperty(propName, oldValue, value, () => {
                    that._model[propName] = value;
                }, { isLazyLoading: false });
            }
        }
        return that._model[propName];
    }
    getPropertyByName(propName) {
        let that = this;
        let propSchema = that._schema.properties[propName];
        let mm = model_manager_1.modelManager();
        if (!propSchema)
            throw new histria_utils_1.ApplicationError(util.format('Property not found: "%s".', propName));
        return that._model[propName];
    }
    async setPropertyByName(propName, value) {
        let that = this;
        let propSchema = that._schema.properties[propName];
        let mm = model_manager_1.modelManager();
        if (!propSchema)
            throw new histria_utils_1.ApplicationError(util.format('Property not found: "%s".', propName));
        if (!histria_utils_1.schemaUtils.isReadOnly(propSchema)) {
            // Set
            if (that._model[propName] !== value) {
                let oldValue = that._model[propName];
                await that.changeProperty(propName, oldValue, value, () => {
                    that._model[propName] = value;
                }, { isLazyLoading: false });
            }
        }
        return that._model[propName];
    }
    async afterCreated() {
        let that = this;
        if (that._afterCreateCalled)
            return;
        that._afterCreateCalled = true;
        let eventInfo = that.transaction.eventInfo;
        try {
            if (that.status === interfaces_1.ObjectStatus.creating) {
                await that._transaction.emitInstanceEvent(interfaces_1.EventType.init, eventInfo, that);
            }
        }
        finally {
            that.status = interfaces_1.ObjectStatus.idle;
        }
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
        histria_utils_1.schemaUtils.enumCompositions(that._schema.relations, (relationName, relation) => {
            let role = that._children[relationName];
            if (role)
                role.enumChildren(cb);
        });
    }
    async validate(options) {
        let that = this;
        let eventInfo = that.transaction.eventInfo;
        if (that.status === interfaces_1.ObjectStatus.idle) {
            if (options && options.full) {
                // TODO validate all properties
            }
            try {
                await that._transaction.emitInstanceEvent(interfaces_1.EventType.objValidate, eventInfo, that);
            }
            catch (ex) {
                that._errorByName('$').addException(ex);
            }
        }
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
        // Check uid
        checkUuid(value);
        if (value._isNew)
            value._isDirty = true;
        that._setModel(value);
    }
    destroy() {
        const that = this;
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
        if (that._listeners) {
            let list = that._listeners;
            that._listeners = null;
            list.forEach(item => item.listener.unsubscribe());
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
function checkUuid(value) {
    // Check uuid
    if (!value._uuid) {
        if (value._isNew || !value.id) {
            value._uuid = uuid.v1();
            value.id = value._uuid;
        }
        else
            value._uuid = value.id + '';
    }
}