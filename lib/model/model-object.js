"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const interfaces_1 = require("./interfaces");
const role_has_one_1 = require("./relations/role-has-one");
const role_belongs_to_1 = require("./relations/role-belongs-to");
const role_has_many_1 = require("./relations/role-has-many");
const histria_utils_1 = require("histria-utils");
const model_manager_1 = require("./model-manager");
const number_1 = require("./types/number");
const date_1 = require("./types/date");
const date_time_1 = require("./types/date-time");
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
    pushLoaded(cb) {
        const that = this;
        that._loaded = that._loaded || [];
        that._loaded.push(cb);
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
    get isDeleted() {
        return this._model._isDeleted;
    }
    get isDirty() {
        return this._model._isDirty;
    }
    async markDirty() {
        const that = this;
        if (that.isDirty)
            return true;
        if (that._parent) {
            const owner = that._parent;
            if (!await owner.markDirty())
                return false;
        }
        if (!await that._emitInstanceEvent(interfaces_1.EventType.editing))
            return false;
        that._model._isDirty = true;
        await that._emitInstanceEvent(interfaces_1.EventType.edited);
        return true;
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
    get hasOwner() {
        let that = this;
        if (!that._schema.meta || !that._schema.meta.parent)
            return false;
        if (that._parent === undefined) {
            // TODO : check if fields for that._schema.relations[that._schema.meta.parent] are nulls
            return false;
        }
        else
            return !!!that._parent;
    }
    changeState(propName, value, oldValue, eventInfo) {
    }
    init() {
    }
    _childRelationsChanged(path) {
    }
    // Called only on create or on load
    _setModel(value) {
        const that = this;
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
            // That works  only when remote model is persistent
            const relation = that._schema.relations[relName];
            const refClass = model_manager_1.modelManager().classByName(relation.model, relation.nameSpace);
            switch (relation.type) {
                case histria_utils_1.RELATION_TYPE.hasOne:
                    if (refClass.isPersistent)
                        that._children[relName] = new role_has_one_1.HasOneRefObject(that, relName, relation);
                    else
                        that._children[relName] = new role_has_one_1.HasOneComposition(that, relName, relation);
                    break;
                case histria_utils_1.RELATION_TYPE.belongsTo:
                    that._children[relName] = new role_belongs_to_1.CompositionBelongsTo(that, relName, relation);
                    break;
                case histria_utils_1.RELATION_TYPE.hasMany:
                    if (refClass.isPersistent)
                        that._children[relName] = new role_has_many_1.HasManyRefObject(that, relName, relation, that._model[relName]);
                    else
                        that._children[relName] = new role_has_many_1.HasManyComposition(that, relName, relation, that._model[relName]);
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
                case histria_utils_1.JSONTYPES.date:
                    that._children[propName] = new date_1.DateValue(that, propName);
                    break;
                case histria_utils_1.JSONTYPES.datetime:
                    that._children[propName] = new date_time_1.DateTimeValue(that, propName);
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
        return false;
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
    setInstanceOptions(options) {
        let that = this;
        // View refernced by trensaction
        if (options.external && that._schema.view)
            that._model._external = true;
    }
    async beforePropertyChanged(propName, oldValue, newValue) {
        // Check can modify ?
    }
    async _remove(rootIsPersistant) {
        const that = this;
        if (that.isDeleted)
            return;
        // Mark dirty
        if (!await that.markDirty())
            return;
        // Before remove rules
        if (!await that._emitInstanceEvent(interfaces_1.EventType.removing))
            return;
        // Remove children removed
        let promises = [];
        that.enumChildren((child) => {
            let modelChild = child;
            if (!rootIsPersistant && modelChild.isPersistent)
                return;
            promises.push(modelChild._remove(rootIsPersistant));
        }, false);
        await Promise.all(promises);
        that._model._isDeleted = true;
        if (that._parent) {
            // remove from parent
            let parentRel = histria_utils_1.schemaUtils.parentRelation(that._schema);
            if (parentRel) {
                const relProp = that._children[parentRel.relationName];
                if (relProp)
                    await relProp.setValue(null);
            }
        }
        // remove from aggregations
        promises = [];
        histria_utils_1.schemaUtils.enumBelongsToAggregations(that._schema.relations, (relationName, relation) => {
            const relProp = that._children[relationName];
            if (relProp) {
                promises.push(relProp.setValue(null));
            }
        });
        histria_utils_1.schemaUtils.enumHasAggregations(that._schema.relations, (relationName, relation) => {
            if (relation.type === histria_utils_1.RELATION_TYPE.hasOne) {
                const relProp = that._children[relationName];
                promises.push(relProp.setValue(null));
            }
            else if (relation.type === histria_utils_1.RELATION_TYPE.hasMany) {
                const relProp = that._children[relationName];
                promises.push(relProp.set([]));
            }
        });
        await Promise.all(promises);
        // Remove views of me
        if (!that._schema.view && that._schema.viewsOfMe) {
            for (let viewName of Object.keys(that._schema.viewsOfMe)) {
                const viewConfig = that._schema.viewsOfMe[viewName];
                const viewClass = model_manager_1.modelManager().classByName(viewConfig.model, viewConfig.nameSpace);
                const inst = that.viewOfMe(viewClass);
                if (inst && !inst._model._external)
                    await inst.remove();
            }
        }
        // Remove from views
        promises = [];
        if (that._listeners) {
            const toNotify = that._listeners.splice(0);
            toNotify.forEach(listener => {
                let instance = listener.parent;
                promises.push(instance._children[listener.propertyName].remove(that));
            });
        }
        await Promise.all(promises);
        // Transaction:  move instance to removed instances
        that._transaction.removeInstance(that);
        that._transaction.remove(that);
        // After remove rules
        await that._emitInstanceEvent(interfaces_1.EventType.removed);
        if (that.isNew)
            that.destroy();
    }
    async remove() {
        return this._remove(this.isPersistent);
    }
    async notifyOperation(propName, op, param) {
        let that = this;
        let eventInfo = that.transaction.eventInfo;
        eventInfo.push({ path: that.getPath(propName), eventType: interfaces_1.EventType.propChanged });
        try {
            if (!await that.markDirty())
                return;
            await that._transaction.emitInstanceEvent(op, eventInfo, that, propName, param);
        }
        finally {
            eventInfo.pop();
        }
    }
    viewOfMe(classOfView) {
        const that = this;
        if (!that._schema.viewsOfMe)
            return null;
        if (that._cacheViewsOfMe) {
            let uuid = that._cacheViewsOfMe.get(classOfView);
            if (uuid) {
                const res = that.transaction.findOneInCache(classOfView, { id: uuid });
                if (res)
                    return res;
                that._cacheViewsOfMe.delete(classOfView);
            }
        }
        const cr = that._schema.viewsOfMe[classOfView.nameSpace + '.' + classOfView.entityName];
        if (!cr)
            return null;
        const query = histria_utils_1.schemaUtils.roleToQueryInv({ foreignFields: cr.localFields, localFields: cr.foreignFields }, that.model());
        const res = that.transaction.findOneInCache(classOfView, query);
        if (res) {
            that._cacheViewsOfMe = that._cacheViewsOfMe || new Map();
            that._cacheViewsOfMe.set(classOfView, res.uuid);
        }
        return res;
    }
    async notifyHooks(propName, op, instance) {
        const that = this;
        return await that._transaction.notifyHooks(op, that, instance, propName);
    }
    async _viewFactory(hook, propName, op, source) {
        const that = this;
        if (propName === hook.property) {
            const classConstructor = model_manager_1.modelManager().classByName(hook.model, hook.nameSpace);
            if (op === interfaces_1.EventType.addItem) {
                that.transaction.log(interfaces_1.LogModule.hooks, util.format('Create instance of "%s" for "%s".', hook.model, that._schema.name));
                const instance = await that.transaction.create(classConstructor);
                await instance['set' + hook.relation.charAt(0).toUpperCase() + hook.relation.substr(1)](source);
            }
            else if (op === interfaces_1.EventType.removeItem) {
                that.transaction.log(interfaces_1.LogModule.hooks, util.format('Destroy instance of "%s" for "%s".', hook.model, that._schema.name));
                let ref = source.viewOfMe(classConstructor);
                if (ref)
                    await ref.remove();
            }
        }
        else if (hook.property.indexOf(propName + '.') === 0) {
            const src = source;
            const path = hook.property.substr((propName + '.').length);
            that.transaction.log(interfaces_1.LogModule.hooks, util.format('Find instances by path "%s.%s".', src._schema.name, path));
            let model = src.model();
            let models = [];
            histria_utils_1.helper.valuesByPath(path, model, models);
            if (models.length) {
                const classConstructor = model_manager_1.modelManager().classByPath(that._schema.name, that._schema.nameSpace, hook.property);
                for (let model of models) {
                    let instance = await that.transaction.findOneInCache(classConstructor, { id: model.id });
                    if (instance)
                        await that._viewFactory(hook, hook.property, op, instance);
                }
            }
        }
    }
    async execHooks(propName, op, source) {
        let that = this;
        if (that._schema.hooks) {
            for (let hook of that._schema.hooks)
                if (hook.type === 'factory') {
                    await that._viewFactory(hook, propName, op, source);
                }
        }
    }
    async _addException(ex) {
        // TODO error $ must go in parent
        const that = this;
        that._errorByName('$').addException(ex);
    }
    async _emitInstanceEvent(event) {
        const that = this;
        const eventInfo = that.transaction.eventInfo;
        try {
            if (that.status === interfaces_1.ObjectStatus.idle)
                return await that._transaction.emitInstanceEvent(event, eventInfo, that);
            return true;
        }
        catch (ex) {
            that._addException(ex);
            return false;
        }
    }
    async changeProperty(propName, oldValue, newValue, hnd, options) {
        const that = this;
        const eventInfo = that.transaction.eventInfo;
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
                    if (!await that.markDirty())
                        return;
                    await that.beforePropertyChanged(propName, oldValue, newValue);
                    // Change property
                    hnd();
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
        const that = this;
        if (that._afterCreateCalled)
            return;
        that._afterCreateCalled = true;
        const eventInfo = that.transaction.eventInfo;
        try {
            if (that.status === interfaces_1.ObjectStatus.creating) {
                await that._transaction.emitInstanceEvent(interfaces_1.EventType.init, eventInfo, that);
            }
        }
        finally {
            that.status = interfaces_1.ObjectStatus.idle;
        }
        if (that._loaded) {
            const promises = that._loaded.map(cb => { return cb(); });
            that._loaded = null;
            await Promise.all(promises);
        }
    }
    afterRestore() {
        let that = this;
        if (that._afterCreateCalled)
            return;
        that._afterCreateCalled = true;
        that.status = interfaces_1.ObjectStatus.idle;
    }
    enumChildren(cb, recursive) {
        const that = this;
        histria_utils_1.schemaUtils.enumCompositions(that._schema.relations, (relationName, relation) => {
            let role = that._children[relationName];
            if (role)
                role.enumChildren(cb, recursive);
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
            that._transaction.removeInstance(that);
        }
        if (that._listeners) {
            let list = that._listeners;
            that._listeners = null;
            list.forEach(item => item.listener.unsubscribe(that));
        }
        that._schema = null;
        that._model = null;
        that._rootCache = null;
        that._loaded = null;
        that._parent = null;
        that._propertyName = null;
        if (that._cacheViewsOfMe)
            that._cacheViewsOfMe = null;
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
