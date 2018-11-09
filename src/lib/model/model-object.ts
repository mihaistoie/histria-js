// tslint:disable:no-empty
import {
    IObservableObject, IFrameworkObject, IEventInfo, ObjectStatus,
    MessageServerity, IUserContext, ITransactionContainer, EventType, IChangePropertyOptions, LogModule
} from './interfaces';
import { RoleBase } from './relations/role';
import { HasOneRef, HasOneComposition, HasOneAggregation, HasOneRefObject } from './relations/role-has-one';
import { CompositionBelongsTo, AggregationBelongsTo } from './relations/role-belongs-to';
import { HasManyComposition, HasManyAggregation, HasManyRefObject } from './relations/role-has-many';

import { ApplicationError, schemaManager, schemaUtils, JSONTYPES, RELATION_TYPE, AGGREGATION_KIND, DEFAULT_PARENT_NAME, helper } from 'histria-utils';
import { modelManager } from './model-manager';

import { IntegerValue, NumberValue } from './types/number';
import { DateValue } from './types/date';
import { DateTimeValue } from './types/date-time';
import { IdValue } from './types/id';

import { InstanceErrors } from './states/instance-errors';
import { ErrorState } from './states/error-state';

import { InstanceState } from './states/instance-state';

import { BaseInstance } from './base-instance';

import * as util from 'util';
import * as uuid from 'uuid';

export class ModelObject extends BaseInstance implements IObservableObject, IFrameworkObject {

    public get owner(): IObservableObject {
        return this._parent;
    }
    public get uuid(): string {
        return this._model._uuid;
    }

    public get isPersistent(): boolean {
        return true;
    }

    public get isNew(): boolean {
        return this._model._isNew === true;
    }

    public get isDeleted(): boolean {
        return this._model._isDeleted;
    }
    public get isDirty(): boolean {
        return this._model._isDirty;
    }

    public get propertyName(): string {
        return this._propertyName;
    }
    public get hasOwner(): boolean {
        if (!this._schema.meta || !this._schema.meta.parent) return false;
        if (this._parent === undefined) {
            // TODO : check if fields for this._schema.relations[this._schema.meta.parent] are nulls
            return false;
        } else
            return !!!this._parent;
    }

    public get status(): ObjectStatus {
        return this._status;
    }
    public set status(value: ObjectStatus) {
        this._status = value;
    }
    public get $states(): InstanceState {
        return this._states as InstanceState;
    }
    public get $errors(): InstanceErrors {
        return this._errors as InstanceErrors;
    }

    public context: IUserContext;
    public transaction: ITransactionContainer;

    protected _status: ObjectStatus;
    // When set _parent reset _rootCache
    protected _parent: IObservableObject;
    protected _listeners: Array<{ listener: any, parent: IObservableObject, propertyName: string }>;
    protected _loaded: any[];
    protected _children: any;
    protected _schema: any;
    protected _rootCache: IObservableObject;
    protected _model: any;
    protected _states: InstanceState;
    protected _errors: InstanceErrors;
    protected _propertyName: string;
    private _cacheViewsOfMe: Map<any, string>;
    private _afterCreateCalled: boolean;

    constructor(transaction: ITransactionContainer, parent: IObservableObject, propertyName: string, value: any, options: { isRestore: boolean }) {
        super(transaction);
        this._parent = parent ? parent : undefined;
        this.status = options.isRestore ? ObjectStatus.restoring : ObjectStatus.creating;
        this._propertyName = propertyName;
        this.init();
        // Check uid
        checkUuid(value);
        if (value._isNew) value._isDirty = true;
        this._setModel(value);
    }

    public addListener(listener: any, parent: IObservableObject, propertyName: string): void {
        this._listeners = this._listeners || [];
        this._listeners.push({ listener: listener, parent: parent, propertyName: propertyName });
    }
    public rmvListener(listener: any): void {
        if (this._listeners) {
            const index = this._listeners.findIndex(value => value.listener === listener);
            if (index >= 0) this._listeners.splice(index, 1);
        }
    }
    public getListeners(noParent: boolean): Array<{ instance: IObservableObject; propertyName: string; isOwner: boolean; }> {
        const res: Array<{ instance: IObservableObject; propertyName: string; isOwner: boolean; }> = [];
        if (!noParent && this._parent)
            res.push({ instance: this._parent, propertyName: this.propertyName, isOwner: true });
        if (this._listeners)
            this._listeners.forEach(item => res.push({ instance: item.parent, propertyName: item.propertyName, isOwner: false }));
        return res;
    }

    public pushLoaded(cb: () => Promise<void>): void {
        this._loaded = this._loaded || [];
        this._loaded.push(cb);
    }

    public getRoleByName(roleName: string) {
        return this._children[roleName];
    }

    public async rmvObjectFromRole(roleName: string, instance: IObservableObject): Promise<void> {
        const rel = this._schema.relations[roleName];
        const localRole = this.getRoleByName(roleName);
        if (rel && localRole) {
            if (rel.type === RELATION_TYPE.hasOne)
                await localRole.setValue(null);
            else if (rel.type === RELATION_TYPE.hasMany)
                await localRole.remove(instance);
        }
    }

    public async addObjectToRole(roleName: string, instance: IObservableObject): Promise<void> {
        const rel = this._schema.relations[roleName];
        const localRole = this.getRoleByName(roleName);
        if (rel && localRole) {
            if (rel.type === RELATION_TYPE.hasOne)
                await localRole.setValue(instance);
            else if (rel.type === RELATION_TYPE.hasMany)
                await localRole.add(instance);
        }
    }
    // Used for relations = called by CompositionBelongsTo / HasOneComposition
    public async changeParent(newParent: IObservableObject, foreignPropName: string, localPropName: string, notify: boolean): Promise<void> {
        if (this._parent === newParent)
            return;
        this._parent = newParent;
        this._propertyName = this._parent ? foreignPropName : '';
        this._rootCache = null;

        if (notify && localPropName) {
            await this.changeProperty(localPropName, this._parent, newParent, () => {
                this._parent = newParent;
            }, { isLazyLoading: false });
        } else {
            this._parent = newParent;
        }
    }
    public async markDirty(): Promise<boolean> {
        if (this.isDirty) return true;
        if (this._parent) {
            const owner: ModelObject = this._parent as ModelObject;
            if (!await owner.markDirty())
                return false;
        }
        if (!await this._emitInstanceEvent(EventType.editing))
            return false;
        this._model._isDirty = true;
        await this._emitInstanceEvent(EventType.edited);
        return true;
    }
    public getPath(propName?: string): string {
        const root = this._parent ? this._parent.getPath(this._propertyName) : '';
        return propName ? (root ? (root + '.' + propName) : propName) : root;
    }

    public getRoot(): IObservableObject {
        if (!this._rootCache)
            this._rootCache = this._parent ? this._parent.getRoot() : this;
        return this._rootCache;
    }

    public changeState(propName: string, value: any, oldValue: any, eventInfo: IEventInfo) { }
    public restored(): void { }

    public getSchema(propName?: string): any {
        if (!propName || propName === '$') return this._schema;
        return this._schema.properties[propName];
    }
    public isArrayComposition(propName: string): boolean {
        if (this._schema.relations && this._schema.relations[propName]) {
            const rel = this._schema.relations[propName];
            return rel.type === RELATION_TYPE.hasMany && rel.aggregationKind === AGGREGATION_KIND.composite;
        }
        return false;
    }

    public modelErrors(propName: string): Array<{ message: string, severity: MessageServerity }> {
        this._model.$errors = this._model.$errors || {};
        if (propName === '$' && this._parent && this._propertyName && !this._parent.isArrayComposition(this._propertyName)) {
            return this._parent.modelErrors(this._propertyName);
        }
        this._model.$errors[propName] = this._model.$errors[propName] || [];
        return this._model.$errors[propName];
    }

    public modelState(propName: string): any {
        this._model.$states = this._model.$states || {};
        let ss = this._model.$states[propName];
        if (!ss) {
            // If $states[propName] not exists init using schema
            if (this._schema.states && this._schema.states[propName])
                ss = helper.clone(this._schema.states[propName]);
            else
                ss = {};
            this._model.$states[propName] = ss;
        }
        return ss;
    }
    public model(propName?: string): any {
        return propName ? this._model[propName] : this._model;
    }

    public setInstanceOptions(options: { external: boolean }): void {
        // View refernced by trensaction
        if (options.external && this._schema.view)
            this._model._external = true;
    }

    public async remove(): Promise<void> {
        return this._remove(this.isPersistent);
    }

    public async notifyOperation(propName: string, op: EventType, param: any): Promise<void> {
        const eventInfo = this.transaction.eventInfo;
        eventInfo.push({ path: this.getPath(propName), eventType: EventType.propChanged });
        try {
            if (!await this.markDirty()) return;
            await this._transaction.emitInstanceEvent(op, eventInfo, this, propName, param);
        } finally {
            eventInfo.pop();
        }

    }

    public viewOfMe<T extends IObservableObject>(classOfView: any): T {
        if (!this._schema.viewsOfMe) return null;
        if (this._cacheViewsOfMe) {
            const uuidViewofMe = this._cacheViewsOfMe.get(classOfView);
            if (uuidViewofMe) {
                const resFromCache = this.transaction.findOneInCache<T>(classOfView, { id: uuidViewofMe });
                if (resFromCache) return resFromCache;
                this._cacheViewsOfMe.delete(classOfView);
            }
        }
        const cr = this._schema.viewsOfMe[classOfView.nameSpace + '.' + classOfView.entityName];
        if (!cr) return null;
        const query: any = schemaUtils.roleToQueryInv({ foreignFields: cr.localFields, localFields: cr.foreignFields }, this.model());
        const res = this.transaction.findOneInCache<T>(classOfView, query);
        if (res) {
            this._cacheViewsOfMe = this._cacheViewsOfMe || new Map<any, string>();
            this._cacheViewsOfMe.set(classOfView, res.uuid);
        }
        return res;
    }

    public async notifyHooks(propName: string, op: EventType, instance: IObservableObject): Promise<void> {
        return this._transaction.notifyHooks(op, this, instance, propName);
    }
    public async execHooks(propName: string, op: EventType, source: IObservableObject): Promise<void> {
        if (this._schema.hooks) {
            for (const hook of this._schema.hooks)
                if (hook.type === 'factory') {
                    await this._viewFactory(hook, propName, op, source);
                }
        }
    }
    public async changeProperty(propName: string, oldValue: any, newValue: any, hnd: any, options: IChangePropertyOptions): Promise<void> {
        const eventInfo = this.transaction.eventInfo;
        eventInfo.push({ path: this.getPath(propName), eventType: EventType.propChanged });
        try {
            eventInfo.isLazyLoading = options.isLazyLoading;
            if (options.isLazyLoading) {
                await this._transaction.emitInstanceEvent(EventType.propChanged, eventInfo, this, propName, newValue, oldValue);
            } else {
                const error = this._errorByName(propName);
                if (error) error.error = '';
                try {
                    // Clear errors for propName
                    if (!await this.markDirty()) return;
                    await this.beforePropertyChanged(propName, oldValue, newValue);
                    // Change property
                    hnd();
                    if (this.status === ObjectStatus.idle) {
                        // Validation rules
                        await this._transaction.emitInstanceEvent(EventType.propValidate, eventInfo, this, propName, newValue);
                        // Propagation rules
                        await this._transaction.emitInstanceEvent(EventType.propChanged, eventInfo, this, propName, newValue, oldValue);
                    }
                } catch (ex) {
                    if (error)
                        error.addException(ex);
                }
            }
        } finally {
            eventInfo.pop();
        }

    }

    public async getOrSetProperty(propName: string, value?: any): Promise<any> {
        let isSet = (value !== undefined);
        const propSchema = this._schema.properties[propName];
        const mm = modelManager();
        if (!propSchema)
            throw new ApplicationError(util.format('Property not found: "%s".', propName));
        if (isSet) isSet = !schemaUtils.isReadOnly(propSchema);
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

    public getPropertyByName(propName: string): any {
        const propSchema = this._schema.properties[propName];
        const mm = modelManager();
        if (!propSchema)
            throw new ApplicationError(util.format('Property not found: "%s".', propName));
        return this._model[propName];
    }

    public async setPropertyByName(propName: string, value: any): Promise<any> {
        const propSchema = this._schema.properties[propName];
        const mm = modelManager();
        if (!propSchema)
            throw new ApplicationError(util.format('Property not found: "%s".', propName));
        if (!schemaUtils.isReadOnly(propSchema)) {
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

    public async afterCreated() {
        if (this._afterCreateCalled) return;
        this._afterCreateCalled = true;
        const eventInfo = this.transaction.eventInfo;
        try {
            if (this.status === ObjectStatus.creating) {
                await this._transaction.emitInstanceEvent(EventType.init, eventInfo, this);
            }
        } finally {
            this.status = ObjectStatus.idle;
        }
        if (this._loaded) {
            const promises = this._loaded.map(cb => cb());
            this._loaded = null;
            await Promise.all(promises);
        }
    }
    public afterRestore() {
        if (this._afterCreateCalled) return;
        this._afterCreateCalled = true;
        this.status = ObjectStatus.idle;
    }

    public enumChildren(cb: (value: IObservableObject) => void, recursive: boolean) {
        schemaUtils.enumCompositions(this._schema.relations, (relationName, relation) => {
            const role = this._children[relationName];
            if (role) role.enumChildren(cb, recursive);
        });

    }

    public async validate(options?: { full: boolean }) {
        const eventInfo = this.transaction.eventInfo;
        if (this.status === ObjectStatus.idle) {
            if (options && options.full) {
                // TODO validate all properties
            }
            try {
                await this._transaction.emitInstanceEvent(EventType.objValidate, eventInfo, this);
            } catch (ex) {
                this._errorByName('$').addException(ex);
            }
        }
    }

    public destroy() {
        if (this._states) {
            this._states.destroy();
            this._states = null;
        }
        if (this._children) {
            helper.destroy(this._children);
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
    protected init() {
    }

    protected _childRelationsChanged(path: string) {

    }

    // Called only on create or on load
    protected _setModel(value: any) {
        if (!value) throw 'Invalid model (null).';
        this._model = value;
        if (this._children)
            helper.destroy(this._children);
        this._children = {};
        this.createStates();
        this.createErrors();
        this._createProperties();

    }
    protected createErrors() { }
    protected createStates() { }

    private _createRelations() {
        if (this._schema && this._schema.relations)
            Object.keys(this._schema.relations).forEach(relName => {
                const relation = this._schema.relations[relName];
                switch (relation.type) {
                    case RELATION_TYPE.hasOne:
                        if (relation.aggregationKind === AGGREGATION_KIND.none) {
                            // Reference
                            this._children[relName] = new HasOneRef(this, relName, relation);
                        } else if (relation.aggregationKind === AGGREGATION_KIND.shared) {
                            // Aggregation
                            this._children[relName] = new HasOneAggregation(this, relName, relation);
                        } else if (relation.aggregationKind === AGGREGATION_KIND.composite) {
                            // Composition
                            this._children[relName] = new HasOneComposition(this, relName, relation);
                        }
                        break;
                    case RELATION_TYPE.belongsTo:
                        if (relation.aggregationKind === AGGREGATION_KIND.shared) {
                            // Aggregation
                            this._children[relName] = new AggregationBelongsTo(this, relName, relation);
                        } else if (relation.aggregationKind === AGGREGATION_KIND.composite) {
                            // Composition
                            this._children[relName] = new CompositionBelongsTo(this, relName, relation);
                        }
                        break;
                    case RELATION_TYPE.hasMany:
                        if (relation.aggregationKind === AGGREGATION_KIND.none) {
                            // Reference
                        } else if (relation.aggregationKind === AGGREGATION_KIND.shared) {
                            // Aggregation
                            this._children[relName] = new HasManyAggregation(this, relName, relation);
                        } else if (relation.aggregationKind === AGGREGATION_KIND.composite) {
                            // Composition
                            this._children[relName] = new HasManyComposition(this, relName, relation, this._model[relName]);
                        }
                        break;

                }
            });

    }
    private _createViewRelations() {
        if (this._schema && this._schema.relations)
            Object.keys(this._schema.relations).forEach(relName => {
                // this works  only when remote model is persistent
                const relation = this._schema.relations[relName];
                const refClass = modelManager().classByName(relation.model, relation.nameSpace);
                switch (relation.type) {
                    case RELATION_TYPE.hasOne:
                        if (refClass.isPersistent)
                            this._children[relName] = new HasOneRefObject(this, relName, relation);
                        else
                            this._children[relName] = new HasOneComposition(this, relName, relation);
                        break;
                    case RELATION_TYPE.belongsTo:
                        this._children[relName] = new CompositionBelongsTo(this, relName, relation);
                        break;
                    case RELATION_TYPE.hasMany:
                        if (refClass.isPersistent)
                            this._children[relName] = new HasManyRefObject(this, relName, relation, this._model[relName]);
                        else
                            this._children[relName] = new HasManyComposition(this, relName, relation, this._model[relName]);
                        break;
                }
            });
    }

    private _createProperties() {
        if (this._schema && this._schema.properties)
            Object.keys(this._schema.properties).forEach(propName => {
                const cs = this._schema.properties[propName];
                const propType = schemaUtils.typeOfProperty(cs);
                if (this.isNew && cs.default !== undefined && this._model[propName] === undefined)
                    this._model[propName] = cs.default;
                switch (propType) {
                    case JSONTYPES.integer:
                        this._children[propName] = new IntegerValue(this, propName);
                        break;
                    case JSONTYPES.date:
                        this._children[propName] = new DateValue(this, propName);
                        break;
                    case JSONTYPES.datetime:
                        this._children[propName] = new DateTimeValue(this, propName);
                        break;
                    case JSONTYPES.id:
                        this._children[propName] = new IdValue(this, propName);
                        break;
                    case JSONTYPES.number:
                        this._children[propName] = new NumberValue(this, propName);
                        break;
                }
            });
        if (this._schema.view)
            this._createViewRelations();
        else
            this._createRelations();
    }

    private async beforePropertyChanged(propName: string, oldValue: any, newValue: any): Promise<void> {
        // Check can modify ?
    }
    private async _remove(rootIsPersistant: boolean): Promise<void> {
        if (this.isDeleted) return;
        // Mark dirty
        if (!await this.markDirty()) return;
        // Before remove rules
        if (!await this._emitInstanceEvent(EventType.removing)) return;
        // Remove children removed
        let promises: Array<Promise<void | ModelObject>> = [];
        this.enumChildren((child) => {
            const modelChild = child as ModelObject;
            if (!rootIsPersistant && modelChild.isPersistent)
                return;
            promises.push(modelChild._remove(rootIsPersistant));
        }, false);
        await Promise.all(promises);
        this._model._isDeleted = true;

        if (this._parent) {
            // remove from parent
            const parentRel = schemaUtils.parentRelation(this._schema);
            if (parentRel) {
                const relProp: CompositionBelongsTo<ModelObject> = this._children[parentRel.relationName] as CompositionBelongsTo<ModelObject>;
                if (relProp)
                    await relProp.setValue(null);
            }
        }
        // remove from aggregations
        promises = [];
        schemaUtils.enumBelongsToAggregations(this._schema.relations, (relationName, relation) => {
            const relProp: AggregationBelongsTo<ModelObject> = this._children[relationName] as AggregationBelongsTo<ModelObject>;
            if (relProp) {
                promises.push(relProp.setValue(null));
            }

        });

        schemaUtils.enumHasAggregations(this._schema.relations, (relationName, relation) => {
            if (relation.type === RELATION_TYPE.hasOne) {
                const relProp: HasOneAggregation<ModelObject> = this._children[relationName] as HasOneAggregation<ModelObject>;
                promises.push(relProp.setValue(null));
            } else if (relation.type === RELATION_TYPE.hasMany) {
                const relProp: HasManyAggregation<ModelObject> = this._children[relationName] as HasManyAggregation<ModelObject>;
                promises.push(relProp.set([]));
            }

        });
        await Promise.all(promises);
        // Remove views of me
        if (!this._schema.view && this._schema.viewsOfMe) {
            for (const viewName of Object.keys(this._schema.viewsOfMe)) {
                const viewConfig = this._schema.viewsOfMe[viewName];
                const viewClass = modelManager().classByName(viewConfig.model, viewConfig.nameSpace);
                const inst: ModelObject = this.viewOfMe(viewClass) as any;
                if (inst && !inst._model._external)
                    await inst.remove();
            }
        }
        // Remove from views
        promises = [];
        if (this._listeners) {
            const toNotify: Array<{ listener: any, parent: IObservableObject, propertyName: string }> = this._listeners.splice(0);
            toNotify.forEach(listener => {
                const instance: ModelObject = listener.parent as ModelObject;
                promises.push(instance._children[listener.propertyName].remove(this));
            });
        }
        await Promise.all(promises);
        // Transaction:  move instance to removed instances
        this._transaction.removeInstance(this);
        this._transaction.remove(this);
        // After remove rules
        await this._emitInstanceEvent(EventType.removed);

        if (this.isNew)
            this.destroy();
    }

    private async _viewFactory(hook: any, propName: string, op: EventType, source: IObservableObject): Promise<void> {
        if (propName === hook.property) {
            const classConstructor = modelManager().classByName(hook.model, hook.nameSpace);
            if (op === EventType.addItem) {
                this.transaction.log(LogModule.hooks, util.format('Create instance of "%s" for "%s".', hook.model, this._schema.name));
                const instance: any = await this.transaction.create(classConstructor);
                await instance['set' + hook.relation.charAt(0).toUpperCase() + hook.relation.substr(1)](source);
            } else if (op === EventType.removeItem) {
                this.transaction.log(LogModule.hooks, util.format('Destroy instance of "%s" for "%s".', hook.model, this._schema.name));
                const ref = source.viewOfMe(classConstructor);
                if (ref)
                    await ref.remove();
            }

        } else if (hook.property.indexOf(propName + '.') === 0) {
            const src = source as ModelObject;
            const path = hook.property.substr((propName + '.').length);
            this.transaction.log(LogModule.hooks, util.format('Find instances by path "%s.%s".', src._schema.name, path));
            const model = src.model();
            const models: any[] = [];
            helper.valuesByPath(path, model, models);
            if (models.length) {
                const classConstructor = modelManager().classByPath(this._schema.name, this._schema.nameSpace, hook.property);
                for (const cmodel of models) {
                    const instance: any = await this.transaction.findOneInCache(classConstructor, { id: cmodel.id });
                    if (instance)
                        await this._viewFactory(hook, hook.property, op, instance);
                }
            }

        }
    }

    private async _addException(ex: Error): Promise<void> {
        // TODO error $ must go in parent
        this._errorByName('$').addException(ex);
    }

    private async _emitInstanceEvent(event: EventType): Promise<boolean> {
        const eventInfo = this.transaction.eventInfo;
        try {
            if (this.status === ObjectStatus.idle)
                return await this._transaction.emitInstanceEvent(event, eventInfo, this);
            return true;
        } catch (ex) {
            this._addException(ex);
            return false;
        }
    }

    private _errorByName(propName: string): ErrorState {
        const errors: any = this._errors;
        return errors[propName] as ErrorState;
    }

}

function checkUuid(value: any) {
    // Check uuid
    if (!value._uuid) {
        if (value._isNew || !value.id) {
            value._uuid = uuid.v1();
            value.id = value._uuid;
        } else
            value._uuid = value.id + '';
    }
}
