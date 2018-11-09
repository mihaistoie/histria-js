"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable:no-empty
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
    get propertyName() {
        return this._propertyName;
    }
    get hasOwner() {
        if (!this._schema.meta || !this._schema.meta.parent)
            return false;
        if (this._parent === undefined) {
            // TODO : check if fields for this._schema.relations[this._schema.meta.parent] are nulls
            return false;
        }
        else
            return !!!this._parent;
    }
    get status() {
        return this._status;
    }
    set status(value) {
        this._status = value;
    }
    get $states() {
        return this._states;
    }
    get $errors() {
        return this._errors;
    }
    constructor(transaction, parent, propertyName, value, options) {
        super(transaction);
        this._parent = parent ? parent : undefined;
        this.status = options.isRestore ? interfaces_1.ObjectStatus.restoring : interfaces_1.ObjectStatus.creating;
        this._propertyName = propertyName;
        this.init();
        // Check uid
        checkUuid(value);
        if (value._isNew)
            value._isDirty = true;
        this._setModel(value);
    }
    addListener(listener, parent, propertyName) {
        this._listeners = this._listeners || [];
        this._listeners.push({ listener: listener, parent: parent, propertyName: propertyName });
    }
    rmvListener(listener) {
        if (this._listeners) {
            const index = this._listeners.findIndex(value => value.listener === listener);
            if (index >= 0)
                this._listeners.splice(index, 1);
        }
    }
    getListeners(noParent) {
        const res = [];
        if (!noParent && this._parent)
            res.push({ instance: this._parent, propertyName: this.propertyName, isOwner: true });
        if (this._listeners)
            this._listeners.forEach(item => res.push({ instance: item.parent, propertyName: item.propertyName, isOwner: false }));
        return res;
    }
    pushLoaded(cb) {
        this._loaded = this._loaded || [];
        this._loaded.push(cb);
    }
    getRoleByName(roleName) {
        return this._children[roleName];
    }
    async rmvObjectFromRole(roleName, instance) {
        const rel = this._schema.relations[roleName];
        const localRole = this.getRoleByName(roleName);
        if (rel && localRole) {
            if (rel.type === histria_utils_1.RELATION_TYPE.hasOne)
                await localRole.setValue(null);
            else if (rel.type === histria_utils_1.RELATION_TYPE.hasMany)
                await localRole.remove(instance);
        }
    }
    async addObjectToRole(roleName, instance) {
        const rel = this._schema.relations[roleName];
        const localRole = this.getRoleByName(roleName);
        if (rel && localRole) {
            if (rel.type === histria_utils_1.RELATION_TYPE.hasOne)
                await localRole.setValue(instance);
            else if (rel.type === histria_utils_1.RELATION_TYPE.hasMany)
                await localRole.add(instance);
        }
    }
    // Used for relations = called by CompositionBelongsTo / HasOneComposition
    async changeParent(newParent, foreignPropName, localPropName, notify) {
        if (this._parent === newParent)
            return;
        this._parent = newParent;
        this._propertyName = this._parent ? foreignPropName : '';
        this._rootCache = null;
        if (notify && localPropName) {
            await this.changeProperty(localPropName, this._parent, newParent, () => {
                this._parent = newParent;
            }, { isLazyLoading: false });
        }
        else {
            this._parent = newParent;
        }
    }
    async markDirty() {
        if (this.isDirty)
            return true;
        if (this._parent) {
            const owner = this._parent;
            if (!await owner.markDirty())
                return false;
        }
        if (!await this._emitInstanceEvent(interfaces_1.EventType.editing))
            return false;
        this._model._isDirty = true;
        await this._emitInstanceEvent(interfaces_1.EventType.edited);
        return true;
    }
    getPath(propName) {
        const root = this._parent ? this._parent.getPath(this._propertyName) : '';
        return propName ? (root ? (root + '.' + propName) : propName) : root;
    }
    getRoot() {
        if (!this._rootCache)
            this._rootCache = this._parent ? this._parent.getRoot() : this;
        return this._rootCache;
    }
    changeState(propName, value, oldValue, eventInfo) { }
    restored() { }
    getSchema(propName) {
        if (!propName || propName === '$')
            return this._schema;
        return this._schema.properties[propName];
    }
    isArrayComposition(propName) {
        if (this._schema.relations && this._schema.relations[propName]) {
            const rel = this._schema.relations[propName];
            return rel.type === histria_utils_1.RELATION_TYPE.hasMany && rel.aggregationKind === histria_utils_1.AGGREGATION_KIND.composite;
        }
        return false;
    }
    modelErrors(propName) {
        this._model.$errors = this._model.$errors || {};
        if (propName === '$' && this._parent && this._propertyName && !this._parent.isArrayComposition(this._propertyName)) {
            return this._parent.modelErrors(this._propertyName);
        }
        this._model.$errors[propName] = this._model.$errors[propName] || [];
        return this._model.$errors[propName];
    }
    modelState(propName) {
        this._model.$states = this._model.$states || {};
        let ss = this._model.$states[propName];
        if (!ss) {
            // If $states[propName] not exists init using schema
            if (this._schema.states && this._schema.states[propName])
                ss = histria_utils_1.helper.clone(this._schema.states[propName]);
            else
                ss = {};
            this._model.$states[propName] = ss;
        }
        return ss;
    }
    model(propName) {
        return propName ? this._model[propName] : this._model;
    }
    setInstanceOptions(options) {
        // View refernced by trensaction
        if (options.external && this._schema.view)
            this._model._external = true;
    }
    async remove() {
        return this._remove(this.isPersistent);
    }
    async notifyOperation(propName, op, param) {
        const eventInfo = this.transaction.eventInfo;
        eventInfo.push({ path: this.getPath(propName), eventType: interfaces_1.EventType.propChanged });
        try {
            if (!await this.markDirty())
                return;
            await this._transaction.emitInstanceEvent(op, eventInfo, this, propName, param);
        }
        finally {
            eventInfo.pop();
        }
    }
    viewOfMe(classOfView) {
        if (!this._schema.viewsOfMe)
            return null;
        if (this._cacheViewsOfMe) {
            const uuidViewofMe = this._cacheViewsOfMe.get(classOfView);
            if (uuidViewofMe) {
                const resFromCache = this.transaction.findOneInCache(classOfView, { id: uuidViewofMe });
                if (resFromCache)
                    return resFromCache;
                this._cacheViewsOfMe.delete(classOfView);
            }
        }
        const cr = this._schema.viewsOfMe[classOfView.nameSpace + '.' + classOfView.entityName];
        if (!cr)
            return null;
        const query = histria_utils_1.schemaUtils.roleToQueryInv({ foreignFields: cr.localFields, localFields: cr.foreignFields }, this.model());
        const res = this.transaction.findOneInCache(classOfView, query);
        if (res) {
            this._cacheViewsOfMe = this._cacheViewsOfMe || new Map();
            this._cacheViewsOfMe.set(classOfView, res.uuid);
        }
        return res;
    }
    async notifyHooks(propName, op, instance) {
        return this._transaction.notifyHooks(op, this, instance, propName);
    }
    async execHooks(propName, op, source) {
        if (this._schema.hooks) {
            for (const hook of this._schema.hooks)
                if (hook.type === 'factory') {
                    await this._viewFactory(hook, propName, op, source);
                }
        }
    }
    async changeProperty(propName, oldValue, newValue, hnd, options) {
        const eventInfo = this.transaction.eventInfo;
        eventInfo.push({ path: this.getPath(propName), eventType: interfaces_1.EventType.propChanged });
        try {
            eventInfo.isLazyLoading = options.isLazyLoading;
            if (options.isLazyLoading) {
                await this._transaction.emitInstanceEvent(interfaces_1.EventType.propChanged, eventInfo, this, propName, newValue, oldValue);
            }
            else {
                const error = this._errorByName(propName);
                if (error)
                    error.error = '';
                try {
                    // Clear errors for propName
                    if (!await this.markDirty())
                        return;
                    await this.beforePropertyChanged(propName, oldValue, newValue);
                    // Change property
                    hnd();
                    if (this.status === interfaces_1.ObjectStatus.idle) {
                        // Validation rules
                        await this._transaction.emitInstanceEvent(interfaces_1.EventType.propValidate, eventInfo, this, propName, newValue);
                        // Propagation rules
                        await this._transaction.emitInstanceEvent(interfaces_1.EventType.propChanged, eventInfo, this, propName, newValue, oldValue);
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
        let isSet = (value !== undefined);
        const propSchema = this._schema.properties[propName];
        const mm = model_manager_1.modelManager();
        if (!propSchema)
            throw new histria_utils_1.ApplicationError(util.format('Property not found: "%s".', propName));
        if (isSet)
            isSet = !histria_utils_1.schemaUtils.isReadOnly(propSchema);
        if (isSet) {
            // Set
            if (this._model[propName] !== value) {
                const oldValue = this._model[propName];
                await this.changeProperty(propName, oldValue, value, () => {
                    this._model[propName] = value;
                }, { isLazyLoading: false });
            }
        }
        return this._model[propName];
    }
    getPropertyByName(propName) {
        const propSchema = this._schema.properties[propName];
        const mm = model_manager_1.modelManager();
        if (!propSchema)
            throw new histria_utils_1.ApplicationError(util.format('Property not found: "%s".', propName));
        return this._model[propName];
    }
    async setPropertyByName(propName, value) {
        const propSchema = this._schema.properties[propName];
        const mm = model_manager_1.modelManager();
        if (!propSchema)
            throw new histria_utils_1.ApplicationError(util.format('Property not found: "%s".', propName));
        if (!histria_utils_1.schemaUtils.isReadOnly(propSchema)) {
            // Set
            if (this._model[propName] !== value) {
                const oldValue = this._model[propName];
                await this.changeProperty(propName, oldValue, value, () => {
                    this._model[propName] = value;
                }, { isLazyLoading: false });
            }
        }
        return this._model[propName];
    }
    async afterCreated() {
        if (this._afterCreateCalled)
            return;
        this._afterCreateCalled = true;
        const eventInfo = this.transaction.eventInfo;
        try {
            if (this.status === interfaces_1.ObjectStatus.creating) {
                await this._transaction.emitInstanceEvent(interfaces_1.EventType.init, eventInfo, this);
            }
        }
        finally {
            this.status = interfaces_1.ObjectStatus.idle;
        }
        if (this._loaded) {
            const promises = this._loaded.map(cb => cb());
            this._loaded = null;
            await Promise.all(promises);
        }
    }
    afterRestore() {
        if (this._afterCreateCalled)
            return;
        this._afterCreateCalled = true;
        this.status = interfaces_1.ObjectStatus.idle;
    }
    enumChildren(cb, recursive) {
        histria_utils_1.schemaUtils.enumCompositions(this._schema.relations, (relationName, relation) => {
            const role = this._children[relationName];
            if (role)
                role.enumChildren(cb, recursive);
        });
    }
    async validate(options) {
        const eventInfo = this.transaction.eventInfo;
        if (this.status === interfaces_1.ObjectStatus.idle) {
            if (options && options.full) {
                // TODO validate all properties
            }
            try {
                await this._transaction.emitInstanceEvent(interfaces_1.EventType.objValidate, eventInfo, this);
            }
            catch (ex) {
                this._errorByName('$').addException(ex);
            }
        }
    }
    destroy() {
        if (this._states) {
            this._states.destroy();
            this._states = null;
        }
        if (this._children) {
            histria_utils_1.helper.destroy(this._children);
            this._children = null;
        }
        if (this._errors) {
            this._errors.destroy();
            this._errors = null;
        }
        if (this._transaction) {
            this._transaction.removeInstance(this);
        }
        if (this._listeners) {
            const list = this._listeners;
            this._listeners = null;
            list.forEach(item => item.listener.unsubscribe(this));
        }
        this._schema = null;
        this._model = null;
        this._rootCache = null;
        this._loaded = null;
        this._parent = null;
        this._propertyName = null;
        if (this._cacheViewsOfMe)
            this._cacheViewsOfMe = null;
        super.destroy();
    }
    init() {
    }
    _childRelationsChanged(path) {
    }
    // Called only on create or on load
    _setModel(value) {
        if (!value)
            throw 'Invalid model (null).';
        this._model = value;
        if (this._children)
            histria_utils_1.helper.destroy(this._children);
        this._children = {};
        this.createStates();
        this.createErrors();
        this._createProperties();
    }
    createErrors() { }
    createStates() { }
    _createRelations() {
        if (this._schema && this._schema.relations)
            Object.keys(this._schema.relations).forEach(relName => {
                const relation = this._schema.relations[relName];
                switch (relation.type) {
                    case histria_utils_1.RELATION_TYPE.hasOne:
                        if (relation.aggregationKind === histria_utils_1.AGGREGATION_KIND.none) {
                            // Reference
                            this._children[relName] = new role_has_one_1.HasOneRef(this, relName, relation);
                        }
                        else if (relation.aggregationKind === histria_utils_1.AGGREGATION_KIND.shared) {
                            // Aggregation
                            this._children[relName] = new role_has_one_1.HasOneAggregation(this, relName, relation);
                        }
                        else if (relation.aggregationKind === histria_utils_1.AGGREGATION_KIND.composite) {
                            // Composition
                            this._children[relName] = new role_has_one_1.HasOneComposition(this, relName, relation);
                        }
                        break;
                    case histria_utils_1.RELATION_TYPE.belongsTo:
                        if (relation.aggregationKind === histria_utils_1.AGGREGATION_KIND.shared) {
                            // Aggregation
                            this._children[relName] = new role_belongs_to_1.AggregationBelongsTo(this, relName, relation);
                        }
                        else if (relation.aggregationKind === histria_utils_1.AGGREGATION_KIND.composite) {
                            // Composition
                            this._children[relName] = new role_belongs_to_1.CompositionBelongsTo(this, relName, relation);
                        }
                        break;
                    case histria_utils_1.RELATION_TYPE.hasMany:
                        if (relation.aggregationKind === histria_utils_1.AGGREGATION_KIND.none) {
                            // Reference
                        }
                        else if (relation.aggregationKind === histria_utils_1.AGGREGATION_KIND.shared) {
                            // Aggregation
                            this._children[relName] = new role_has_many_1.HasManyAggregation(this, relName, relation);
                        }
                        else if (relation.aggregationKind === histria_utils_1.AGGREGATION_KIND.composite) {
                            // Composition
                            this._children[relName] = new role_has_many_1.HasManyComposition(this, relName, relation, this._model[relName]);
                        }
                        break;
                }
            });
    }
    _createViewRelations() {
        if (this._schema && this._schema.relations)
            Object.keys(this._schema.relations).forEach(relName => {
                // this works  only when remote model is persistent
                const relation = this._schema.relations[relName];
                const refClass = model_manager_1.modelManager().classByName(relation.model, relation.nameSpace);
                switch (relation.type) {
                    case histria_utils_1.RELATION_TYPE.hasOne:
                        if (refClass.isPersistent)
                            this._children[relName] = new role_has_one_1.HasOneRefObject(this, relName, relation);
                        else
                            this._children[relName] = new role_has_one_1.HasOneComposition(this, relName, relation);
                        break;
                    case histria_utils_1.RELATION_TYPE.belongsTo:
                        this._children[relName] = new role_belongs_to_1.CompositionBelongsTo(this, relName, relation);
                        break;
                    case histria_utils_1.RELATION_TYPE.hasMany:
                        if (refClass.isPersistent)
                            this._children[relName] = new role_has_many_1.HasManyRefObject(this, relName, relation, this._model[relName]);
                        else
                            this._children[relName] = new role_has_many_1.HasManyComposition(this, relName, relation, this._model[relName]);
                        break;
                }
            });
    }
    _createProperties() {
        if (this._schema && this._schema.properties)
            Object.keys(this._schema.properties).forEach(propName => {
                const cs = this._schema.properties[propName];
                const propType = histria_utils_1.schemaUtils.typeOfProperty(cs);
                if (this.isNew && cs.default !== undefined && this._model[propName] === undefined)
                    this._model[propName] = cs.default;
                switch (propType) {
                    case histria_utils_1.JSONTYPES.integer:
                        this._children[propName] = new number_1.IntegerValue(this, propName);
                        break;
                    case histria_utils_1.JSONTYPES.date:
                        this._children[propName] = new date_1.DateValue(this, propName);
                        break;
                    case histria_utils_1.JSONTYPES.datetime:
                        this._children[propName] = new date_time_1.DateTimeValue(this, propName);
                        break;
                    case histria_utils_1.JSONTYPES.id:
                        this._children[propName] = new id_1.IdValue(this, propName);
                        break;
                    case histria_utils_1.JSONTYPES.number:
                        this._children[propName] = new number_1.NumberValue(this, propName);
                        break;
                }
            });
        if (this._schema.view)
            this._createViewRelations();
        else
            this._createRelations();
    }
    async beforePropertyChanged(propName, oldValue, newValue) {
        // Check can modify ?
    }
    async _remove(rootIsPersistant) {
        if (this.isDeleted)
            return;
        // Mark dirty
        if (!await this.markDirty())
            return;
        // Before remove rules
        if (!await this._emitInstanceEvent(interfaces_1.EventType.removing))
            return;
        // Remove children removed
        let promises = [];
        this.enumChildren((child) => {
            const modelChild = child;
            if (!rootIsPersistant && modelChild.isPersistent)
                return;
            promises.push(modelChild._remove(rootIsPersistant));
        }, false);
        await Promise.all(promises);
        this._model._isDeleted = true;
        if (this._parent) {
            // remove from parent
            const parentRel = histria_utils_1.schemaUtils.parentRelation(this._schema);
            if (parentRel) {
                const relProp = this._children[parentRel.relationName];
                if (relProp)
                    await relProp.setValue(null);
            }
        }
        // remove from aggregations
        promises = [];
        histria_utils_1.schemaUtils.enumBelongsToAggregations(this._schema.relations, (relationName, relation) => {
            const relProp = this._children[relationName];
            if (relProp) {
                promises.push(relProp.setValue(null));
            }
        });
        histria_utils_1.schemaUtils.enumHasAggregations(this._schema.relations, (relationName, relation) => {
            if (relation.type === histria_utils_1.RELATION_TYPE.hasOne) {
                const relProp = this._children[relationName];
                promises.push(relProp.setValue(null));
            }
            else if (relation.type === histria_utils_1.RELATION_TYPE.hasMany) {
                const relProp = this._children[relationName];
                promises.push(relProp.set([]));
            }
        });
        await Promise.all(promises);
        // Remove views of me
        if (!this._schema.view && this._schema.viewsOfMe) {
            for (const viewName of Object.keys(this._schema.viewsOfMe)) {
                const viewConfig = this._schema.viewsOfMe[viewName];
                const viewClass = model_manager_1.modelManager().classByName(viewConfig.model, viewConfig.nameSpace);
                const inst = this.viewOfMe(viewClass);
                if (inst && !inst._model._external)
                    await inst.remove();
            }
        }
        // Remove from views
        promises = [];
        if (this._listeners) {
            const toNotify = this._listeners.splice(0);
            toNotify.forEach(listener => {
                const instance = listener.parent;
                promises.push(instance._children[listener.propertyName].remove(this));
            });
        }
        await Promise.all(promises);
        // Transaction:  move instance to removed instances
        this._transaction.removeInstance(this);
        this._transaction.remove(this);
        // After remove rules
        await this._emitInstanceEvent(interfaces_1.EventType.removed);
        if (this.isNew)
            this.destroy();
    }
    async _viewFactory(hook, propName, op, source) {
        if (propName === hook.property) {
            const classConstructor = model_manager_1.modelManager().classByName(hook.model, hook.nameSpace);
            if (op === interfaces_1.EventType.addItem) {
                this.transaction.log(interfaces_1.LogModule.hooks, util.format('Create instance of "%s" for "%s".', hook.model, this._schema.name));
                const instance = await this.transaction.create(classConstructor);
                await instance['set' + hook.relation.charAt(0).toUpperCase() + hook.relation.substr(1)](source);
            }
            else if (op === interfaces_1.EventType.removeItem) {
                this.transaction.log(interfaces_1.LogModule.hooks, util.format('Destroy instance of "%s" for "%s".', hook.model, this._schema.name));
                const ref = source.viewOfMe(classConstructor);
                if (ref)
                    await ref.remove();
            }
        }
        else if (hook.property.indexOf(propName + '.') === 0) {
            const src = source;
            const path = hook.property.substr((propName + '.').length);
            this.transaction.log(interfaces_1.LogModule.hooks, util.format('Find instances by path "%s.%s".', src._schema.name, path));
            const model = src.model();
            const models = [];
            histria_utils_1.helper.valuesByPath(path, model, models);
            if (models.length) {
                const classConstructor = model_manager_1.modelManager().classByPath(this._schema.name, this._schema.nameSpace, hook.property);
                for (const cmodel of models) {
                    const instance = await this.transaction.findOneInCache(classConstructor, { id: cmodel.id });
                    if (instance)
                        await this._viewFactory(hook, hook.property, op, instance);
                }
            }
        }
    }
    async _addException(ex) {
        // TODO error $ must go in parent
        this._errorByName('$').addException(ex);
    }
    async _emitInstanceEvent(event) {
        const eventInfo = this.transaction.eventInfo;
        try {
            if (this.status === interfaces_1.ObjectStatus.idle)
                return await this._transaction.emitInstanceEvent(event, eventInfo, this);
            return true;
        }
        catch (ex) {
            this._addException(ex);
            return false;
        }
    }
    _errorByName(propName) {
        const errors = this._errors;
        return errors[propName];
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

//# sourceMappingURL=model-object.js.map
