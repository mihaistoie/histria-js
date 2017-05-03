import { ObservableObject, ObservableArray, EventInfo, ObjectStatus, MessageServerity, UserContext, TransactionContainer, EventType, ChangePropertyOptions } from './interfaces';
import { RoleBase } from './relations/role';
import { HasOneRef, HasOneComposition, HasOneAggregation, HasOneRefObject } from './relations/role-has-one';
import { CompositionBelongsTo, AggregationBelongsTo } from './relations/role-belongs-to';
import { HasManyComposition, HasManyAggregation, HasManyRefObject } from './relations/role-has-many';

import { ApplicationError, schemaUtils, JSONTYPES, RELATION_TYPE, AGGREGATION_KIND, DEFAULT_PARENT_NAME, helper } from 'histria-utils';
import { modelManager } from './model-manager';

import { IntegerValue, NumberValue } from './types/number';
import { IdValue } from './types/id';

import { InstanceErrors } from './states/instance-errors'
import { ErrorState } from './states/error-state'

import { InstanceState } from './states/instance-state'

import { BaseInstance } from './base-instance'


import * as util from 'util';
import * as uuid from 'uuid';

export class ModelObject extends BaseInstance implements ObservableObject {

    context: UserContext;
    transaction: TransactionContainer;

    protected _status: ObjectStatus;
    // When set _parent reset _rootCache
    protected _parent: ObservableObject;
    protected _listeners: { listener: any, parent: ObservableObject, propertyName: string }[];
    protected _children: any;
    protected _schema: any;
    protected _rootCache: ObservableObject;
    private _afterCreateCalled: boolean;
    protected _model: any;
    protected _states: InstanceState;
    protected _errors: InstanceErrors;
    protected _propertyName: string;

    public addListener(listener: any, parent: ObservableObject, propertyName: string): void {
        const that = this;
        that._listeners = that._listeners || [];
        that._listeners.push({ listener: listener, parent: parent, propertyName: propertyName });
    }
    public rmvListener(listener: any): void {
        const that = this;
        if (that._listeners) {
            const index = that._listeners.findIndex(value => value.listener === listener);
            if (index >= 0) that._listeners.splice(index, 1);
        }
    }
    public getListeners(noParent: boolean): { instance: ObservableObject; propertyName: string; isOwner: boolean; }[] {
        const that = this;
        const res: { instance: ObservableObject; propertyName: string; isOwner: boolean; }[] = [];
        if (!noParent && that._parent)
            res.push({ instance: that._parent, propertyName: that.propertyName, isOwner: true });
        that._listeners && that._listeners.forEach(item => res.push({ instance: item.parent, propertyName: item.propertyName, isOwner: false }))
        return res;
    }


    public getRoleByName(roleName: string) {
        return this._children[roleName];
    }

    public async rmvObjectFromRole(roleName: string, instance: ObservableObject): Promise<void> {
        let that = this;
        let rel = that._schema.relations[roleName];
        let localRole = that.getRoleByName(roleName);
        if (rel && localRole) {
            if (rel.type === RELATION_TYPE.hasOne)
                await localRole.setValue(null)
            else if (rel.type === RELATION_TYPE.hasMany)
                await localRole.remove(instance)
        }
    }

    public async addObjectToRole(roleName: string, instance: ObservableObject): Promise<void> {
        let that = this;
        let rel = that._schema.relations[roleName];
        let localRole = that.getRoleByName(roleName);
        if (rel && localRole) {
            if (rel.type === RELATION_TYPE.hasOne)
                await localRole.setValue(instance)
            else if (rel.type === RELATION_TYPE.hasMany)
                await localRole.add(instance)
        }
    }
    // Used for relations = called by CompositionBelongsTo / HasOneComposition
    public async changeParent(newParent: ObservableObject, foreignPropName: string, localPropName: string, notify: boolean): Promise<void> {
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
        } else {
            that._parent = newParent;
        }
    }



    public get owner(): ObservableObject {
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
    public async markDirty(): Promise<void> {
        const that = this;
        if (that.isDirty) return;
        if (that._parent) {
            const owner: ModelObject = <ModelObject>that._parent;
            await owner.markDirty();
        }
        await that._emitInstanceEvent(EventType.editing);
        that._model._isDirty = true;
        await that._emitInstanceEvent(EventType.edited);
    }
    public getPath(propName?: string): string {
        let that = this;
        let root = that._parent ? that._parent.getPath(that._propertyName) : '';
        return propName ? (root ? (root + '.' + propName) : propName) : root;
    }

    public get propertyName(): string {
        return this._propertyName;
    }

    public getRoot(): ObservableObject {
        let that = this;
        if (!that._rootCache)
            that._rootCache = that._parent ? that._parent.getRoot() : that;
        return that._rootCache;
    }
    public get hasOwner(): boolean {
        let that = this;
        if (!that._schema.meta || !that._schema.meta.parent) return false;
        if (that._parent === undefined) {
            // TODO : check if fields for that._schema.relations[that._schema.meta.parent] are nulls
            return false;
        } else
            return !!!that._parent;
    }

    public changeState(propName: string, value: any, oldValue: any, eventInfo: EventInfo) {
    }
    protected init() {
    }

    // Called only on create or on load
    protected _setModel(value: any) {
        const that = this;
        if (!value) throw 'Invalid model (null).'
        that._model = value;
        if (that._children)
            helper.destroy(that._children);
        that._children = {};
        that.createStates();
        that.createErrors();
        that._createProperties();

    }
    protected createErrors() { }
    protected createStates() { }
    public restored(): void { }

    public get status(): ObjectStatus {
        return this._status;
    }
    public set status(value: ObjectStatus) {
        this._status = value;
    }



    public getSchema(propName?: string): any {
        let that = this;
        if (!propName || propName === '$') return that._schema;
        return that._schema.properties[propName];
    }

    private _createRelations() {
        const that = this;
        that._schema && that._schema.relations && Object.keys(that._schema.relations).forEach(relName => {
            const relation = that._schema.relations[relName];
            switch (relation.type) {
                case RELATION_TYPE.hasOne:
                    if (relation.aggregationKind === AGGREGATION_KIND.none) {
                        // Reference
                        that._children[relName] = new HasOneRef(that, relName, relation);
                    } else if (relation.aggregationKind === AGGREGATION_KIND.shared) {
                        // Aggregation
                        that._children[relName] = new HasOneAggregation(that, relName, relation);
                    } else if (relation.aggregationKind === AGGREGATION_KIND.composite) {
                        // Composition
                        that._children[relName] = new HasOneComposition(that, relName, relation);
                    }
                    break;
                case RELATION_TYPE.belongsTo:
                    if (relation.aggregationKind === AGGREGATION_KIND.shared) {
                        // Aggregation
                        that._children[relName] = new AggregationBelongsTo(that, relName, relation);
                    } else if (relation.aggregationKind === AGGREGATION_KIND.composite) {
                        // Composition
                        that._children[relName] = new CompositionBelongsTo(that, relName, relation);
                    }
                    break;
                case RELATION_TYPE.hasMany:
                    if (relation.aggregationKind === AGGREGATION_KIND.none) {
                        // Reference
                    } else if (relation.aggregationKind === AGGREGATION_KIND.shared) {
                        // Aggregation
                        that._children[relName] = new HasManyAggregation(that, relName, relation);
                    } else if (relation.aggregationKind === AGGREGATION_KIND.composite) {
                        // Composition
                        that._children[relName] = new HasManyComposition(that, relName, relation, that._model[relName]);
                    }
                    break

            }
        });

    }
    private _createViewRelations() {
        const that = this;
        that._schema && that._schema.relations && Object.keys(that._schema.relations).forEach(relName => {
            // That works  only when remote model is persistent
            const relation = that._schema.relations[relName];
            switch (relation.type) {
                case RELATION_TYPE.hasOne:
                    that._children[relName] = new HasOneRefObject(that, relName, relation);
                    break;
                case RELATION_TYPE.hasMany:
                    that._children[relName] = new HasManyRefObject(that, relName, relation, that._model[relName]);
                    break
            }
        });
    }

    private _createProperties() {
        const that = this;
        that._schema && that._schema.properties && Object.keys(that._schema.properties).forEach(propName => {
            let cs = that._schema.properties[propName];
            let propType = schemaUtils.typeOfProperty(cs);
            if (that.isNew && cs.default !== undefined && that._model[propName] === undefined)
                that._model[propName] = cs.default;
            switch (propType) {
                case JSONTYPES.integer:
                    that._children[propName] = new IntegerValue(that, propName);
                    break;
                case JSONTYPES.id:
                    that._children[propName] = new IdValue(that, propName);
                    break;
                case JSONTYPES.number:
                    that._children[propName] = new NumberValue(that, propName);
                    break;
            }
        });
        if (that._schema.view)
            that._createViewRelations();
        else
            that._createRelations();
    }
    public isArrayComposition(propName: string): boolean {
        let that = this;
        if (that._schema.relations && that._schema.relations[propName]) {
            let rel = that._schema.relations[propName];
            return rel.type === RELATION_TYPE.hasMany && rel.aggregationKind === AGGREGATION_KIND.composite;
        }
    }

    public modelErrors(propName: string): { message: string, severity: MessageServerity }[] {
        let that = this;
        that._model.$errors = that._model.$errors || {};
        if (propName === '$' && that._parent && that._propertyName && !that._parent.isArrayComposition(that._propertyName)) {
            return that._parent.modelErrors(that._propertyName);
        }
        that._model.$errors[propName] = that._model.$errors[propName] || [];
        return that._model.$errors[propName];
    }

    public modelState(propName: string): any {
        let that = this;
        that._model.$states = that._model.$states || {};
        let ss = that._model.$states[propName];
        if (!ss) {
            // If $states[propName] not exists init using schema
            if (that._schema.states && that._schema.states[propName])
                ss = helper.clone(that._schema.states[propName]);
            else
                ss = {};
            that._model.$states[propName] = ss;
        }
        return ss;
    }
    public model(propName?: string): any {
        let that = this;
        return propName ? that._model[propName] : that._model;
    }

    private async beforePropertyChanged(propName: string, oldValue: any, newValue: any): Promise<void> {
        // Check can modify ?
    }
    private async _remove(rootIsPersistant: boolean): Promise<void> {
        const that = this;
        if (that.isDeleted) return;
        // Mark dirty
        await that.markDirty();
        // Remove children removed
        let promises: Promise<void | ModelObject>[] = [];
        that.enumChildren((child) => {
            let modelChild = <ModelObject>child;
            if (!rootIsPersistant && modelChild.isPersistent)
                return;
            promises.push(modelChild._remove(rootIsPersistant));
        }, false);
        await Promise.all(promises);
        // Before remove rules
        await that._emitInstanceEvent(EventType.removing);
        that._model._isDeleted = true;

        if (that._parent) {
            // remove from parent
            let parentRel = schemaUtils.parentRelation(that._schema);
            if (parentRel) {
                const relProp: CompositionBelongsTo<ModelObject> = <CompositionBelongsTo<ModelObject>>that._children[parentRel.relationName];
                if (relProp)
                    await relProp.setValue(null);
            }
        }
        // remove from aggregations
        promises = []
        schemaUtils.enumBelongsToAggregations(that._schema.relations, (relationName, relation) => {
            const relProp: AggregationBelongsTo<ModelObject> = <AggregationBelongsTo<ModelObject>>that._children[relationName];
            if (relProp) {
                promises.push(relProp.setValue(null));
            }

        });

        schemaUtils.enumHasAggregations(that._schema.relations, (relationName, relation) => {
            if (relation.type === RELATION_TYPE.hasOne) {
                const relProp: HasOneAggregation<ModelObject> = <HasOneAggregation<ModelObject>>that._children[relationName];
                promises.push(relProp.setValue(null));
            } else if (relation.type === RELATION_TYPE.hasMany) {
                const relProp: HasManyAggregation<ModelObject> = <HasManyAggregation<ModelObject>>that._children[relationName];
                promises.push(relProp.set([]));
            }

        });
        await Promise.all(promises);
        // Remove from views

        if (that._listeners) {
            promises = [];
            const toNotify: { listener: any, parent: ObservableObject, propertyName: string }[] = that._listeners.splice(0);
            toNotify.forEach(listener => {
                let instance: ModelObject = <ModelObject>listener.parent;
                promises.push(instance._children[listener.propertyName].remove(that));
            })
        }
        await Promise.all(promises);
        // Transaction:  move instance to removed instances
        that._transaction.removeInstance(that);
        that._transaction.remove(that);
        // After remove rules
        await that._emitInstanceEvent(EventType.removed);
        if (that.isNew)
            that.destroy();
    }

    public async remove(): Promise<void> {
        return this._remove(this.isPersistent);
    }

    public async notifyOperation(propName: string, op: EventType, param: any): Promise<void> {
        let that = this;
        let eventInfo = that.transaction.eventInfo;
        eventInfo.push({ path: that.getPath(propName), eventType: EventType.propChanged });
        try {
            await that.markDirty();
            await that._transaction.emitInstanceEvent(op, eventInfo, that, propName, param);
        } finally {
            eventInfo.pop()
        }

    }
    private async _addException(ex: Error): Promise<void> {
        // TODO error $ must go in parent
        const that = this;
        that._errorByName('$').addException(ex);
    }

    private async _emitInstanceEvent(event: EventType): Promise<void> {
        const that = this;
        const eventInfo = that.transaction.eventInfo;
        try {
            if (that.status === ObjectStatus.idle)
                await that._transaction.emitInstanceEvent(event, eventInfo, that);
        } catch (ex) {
            that._addException(ex);
        }
    }
    public async changeProperty(propName: string, oldValue: any, newValue: any, hnd: any, options: ChangePropertyOptions): Promise<void> {
        const that = this;
        const eventInfo = that.transaction.eventInfo;
        eventInfo.push({ path: that.getPath(propName), eventType: EventType.propChanged });
        try {
            eventInfo.isLazyLoading = options.isLazyLoading;
            if (options.isLazyLoading) {
                await that._transaction.emitInstanceEvent(EventType.propChanged, eventInfo, that, propName, newValue, oldValue);
            } else {
                const error = that._errorByName(propName);
                if (error) error.error = '';
                try {
                    // Clear errors for propName
                    await that.beforePropertyChanged(propName, oldValue, newValue);
                    // Change property
                    hnd();
                    await that.markDirty();
                    if (that.status === ObjectStatus.idle) {
                        // Validation rules
                        await that._transaction.emitInstanceEvent(EventType.propValidate, eventInfo, that, propName, newValue);
                        // Propagation rules
                        await that._transaction.emitInstanceEvent(EventType.propChanged, eventInfo, that, propName, newValue, oldValue);
                    }
                } catch (ex) {
                    if (error)
                        error.addException(ex);
                }
            }
        } finally {
            eventInfo.pop()
        }

    }


    public async getOrSetProperty(propName: string, value?: any): Promise<any> {
        let that = this;
        let isSet = (value !== undefined);

        let propSchema = that._schema.properties[propName];
        let mm = modelManager();
        if (!propSchema)
            throw new ApplicationError(util.format('Property not found: "%s".', propName));
        if (isSet) isSet = !schemaUtils.isReadOnly(propSchema);
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

    public getPropertyByName(propName: string): any {
        let that = this;
        let propSchema = that._schema.properties[propName];
        let mm = modelManager();
        if (!propSchema)
            throw new ApplicationError(util.format('Property not found: "%s".', propName))
        return that._model[propName];
    }

    public async setPropertyByName(propName: string, value: any): Promise<any> {
        let that = this;

        let propSchema = that._schema.properties[propName];
        let mm = modelManager();
        if (!propSchema)
            throw new ApplicationError(util.format('Property not found: "%s".', propName));
        if (!schemaUtils.isReadOnly(propSchema)) {
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

    public async afterCreated() {
        let that = this;
        if (that._afterCreateCalled) return;
        that._afterCreateCalled = true;
        let eventInfo = that.transaction.eventInfo;
        try {
            if (that.status === ObjectStatus.creating) {
                await that._transaction.emitInstanceEvent(EventType.init, eventInfo, that);
            }
        } finally {
            that.status = ObjectStatus.idle;
        }
    }
    public afterRestore() {
        let that = this;
        if (that._afterCreateCalled) return;
        that._afterCreateCalled = true;
        that.status = ObjectStatus.idle;
    }

    public enumChildren(cb: (value: ObservableObject) => void, recursive: boolean) {
        const that = this;
        schemaUtils.enumCompositions(that._schema.relations, (relationName, relation) => {
            let role = that._children[relationName];
            if (role) role.enumChildren(cb, recursive);
        });

    }

    public async validate(options?: { full: boolean }) {
        let that = this;
        let eventInfo = that.transaction.eventInfo;
        if (that.status === ObjectStatus.idle) {
            if (options && options.full) {
                // TODO validate all properties
            }
            try {
                await that._transaction.emitInstanceEvent(EventType.objValidate, eventInfo, that);
            } catch (ex) {
                that._errorByName('$').addException(ex);
            }
        }
    }

    private _errorByName(propName: string): ErrorState {
        let that = this;
        let errors: any = that._errors;
        return <ErrorState>errors[propName];
    }


    constructor(transaction: TransactionContainer, parent: ObservableObject, propertyName: string, value: any, options: { isRestore: boolean }) {
        super(transaction);
        let that = this;
        that._parent = parent ? parent : undefined;
        that.status = options.isRestore ? ObjectStatus.restoring : ObjectStatus.creating;
        that._propertyName = propertyName;
        that.init();
        // Check uid
        checkUuid(value);
        if (value._isNew) value._isDirty = true;
        that._setModel(value);
    }

    public destroy() {
        const that = this;

        if (that._states) {
            that._states.destroy();
            that._states = null;
        }
        if (that._children) {
            helper.destroy(that._children);
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

        that._parent = null;
        that._propertyName = null;
        super.destroy();

    }
    public get $states(): InstanceState {
        return <InstanceState>this._states;
    }
    public get $errors(): InstanceErrors {
        return <InstanceErrors>this._errors;
    }

}

function checkUuid(value: any) {
    // Check uuid
    if (!value._uuid) {
        if (value._isNew || !value.id) {
            value._uuid = uuid.v1();
            value.id = value._uuid
        } else
            value._uuid = value.id + '';
    }
}

