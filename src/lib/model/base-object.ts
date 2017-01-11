import { ObservableObject, ObservableArray, EventInfo, ObjectStatus, MessageServerity, UserContext, TransactionContainer, EventType } from './interfaces';
import { HasOneRef, HasOneComposition, HasOneAggregation } from './roleHasOne';
import { CompositionBelongsTo, AggregationBelongsTo } from './roleBelongsTo';
import { ApplicationError } from '../utils/errors';
import { ModelManager } from './model-manager';
import * as schemaUtils from '../schema/schema-utils';
import { JSONTYPES, RELATION_TYPE, AGGREGATION_KIND } from '../schema/schema-consts';

import { IntegerValue, NumberValue } from './number';
import { InstanceErrors } from './instance-errors'
import { InstanceState } from './instance-state'
import { EventInfoStack } from './event-stack'

import * as helper from '../utils/helper';
import * as util from 'util';
import * as uuid from 'uuid';




export class Instance implements ObservableObject {
	//used only in root
	protected _status: ObjectStatus;
	protected _transaction: TransactionContainer;
	//when set _parent reset _rootCache
	protected _parent: ObservableObject;
	protected _parentArray: ObservableArray;
	protected _children: any;
	protected _schema: any;
	protected _rootCache: ObservableObject;
	private _eventInfo: EventInfo;
	private _afterCreateCalled: boolean;
	protected _model: any;
	protected _states: InstanceState;
	protected _errors: InstanceErrors;
	protected _propertyName: string;
	private _context: UserContext;

	//used for relations = called by belongsTo
	protected async removeChild(relationName: string, child: ObservableArray): Promise<void> {

		let that = this;
		let rel = that._schema.relations[relationName];
		let localRole = that._children[relationName];
		if (rel && localRole) {
			if (rel.type === RELATION_TYPE.hasOne)
				await localRole.value(null)
			else if (rel.type === RELATION_TYPE.hasMany)
				await localRole.remove(child)
		}
	}
	//used for relations = called by belongsTo
	protected async addChild(relationName: string, child: ObservableArray): Promise<void> {
		let that = this;
		let rel = that._schema.relations[relationName];
		let localRole = that._children[relationName];
		if (rel && localRole) {
			if (rel.type === RELATION_TYPE.hasOne)
				await localRole.value(child)
			else if (rel.type === RELATION_TYPE.hasMany)
				await localRole.add(child)
		}
	}
	//used for relations = called by CompositionBelongsTo / HasOneComposition
	protected async changeParent(newParent: ObservableObject, propName: string, notify: boolean): Promise<void> {
		let that = this;
		if (that._parent === newParent)
			return;
		that._parent = newParent;
		that._rootCache = null;

		if (notify && propName) {
			await that.changeProperty(propName, that._parent, newParent, function () {
				that._parent = newParent;
			});
		} else {
			that._parent = newParent;
		}
	}

	protected _getEventInfo(): EventInfo {
		let that = this;
		let root = <Instance>that.getRoot();
		if (root === this) {
			if (!that._eventInfo)
				that._eventInfo = new EventInfoStack();
			return that._eventInfo;
		} else
			return root._getEventInfo();
	}

	public get context(): UserContext {
		return this._context;
	}
	public get transaction(): TransactionContainer {
		return this._transaction;
	}
	public get parent(): ObservableObject {
		return this._parent;
	}

	public get uuid(): string {
		return this._model.$uuid;
	}

	public get isNew(): boolean {
		return this._model.isNew === true;
	}

	public getPath(propName?: string): string {
		let that = this;
		let root = that._parentArray ? that._parentArray.getPath(that) : (that._parent ? that._parent.getPath(that._propertyName) : '');
		return propName ? (root ? (root + '.' + propName) : propName) : root;
	}

	public get propertyName(): string {
		return this._propertyName;
	}

	public getRoot(): ObservableObject {
		let that = this;
		if (!that._rootCache)
			that._rootCache = that._parentArray ? that._parentArray.getRoot() : (that._parent ? that._parent.getRoot() : that);
		return that._rootCache;
	}


	public propertyChanged(propName: string, value: any, oldValue: any, eventInfo: EventInfo) {
	}
	public stateChanged(propName: string, value: any, oldValue: any, eventInfo: EventInfo) {
	}
	protected init() {
	}

	//called only on create or on load 
	protected _setModel(value: any) {
		let that = this;
		if (!value) throw "Invalid model (null)."
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

	public get status(): ObjectStatus {
		let that = this;
		let root = <Instance>that.getRoot();
		return root._status;
	}
	public set status(value: ObjectStatus) {
		let that = this;
		let root = <Instance>that.getRoot();
		root._status = value;
	}


	public getSchema(propName?: string): any {
		let that = this;
		if (!propName || propName === '$') return that._schema;
		return that._schema.properties[propName];
	}


	private _createProperties() {
		let that = this;
		that._schema && that._schema.properties && Object.keys(that._schema.properties).forEach(propName => {
			let cs = that._schema.properties[propName];
			let propType = schemaUtils.typeOfProperty(cs);
			switch (propType) {
				case JSONTYPES.integer:
					that._children[propName] = new IntegerValue(that, propName);
					break;
				case JSONTYPES.number:
					that._children[propName] = new NumberValue(that, propName);
					break;
			}
		});
		that._schema && that._schema.relations && Object.keys(that._schema.relations).forEach(relName => {
			let relation = that._schema.relations[relName];
			switch (relation.type) {
				case RELATION_TYPE.hasOne:
					if (relation.aggregationKind === AGGREGATION_KIND.none) {
						//reference
						that._children[relName] = new HasOneRef(that, relName, relation);
					} else if (relation.aggregationKind === AGGREGATION_KIND.shared) {
						//aggregation
						that._children[relName] = new HasOneAggregation(that, relName, relation);
					} else if (relation.aggregationKind === AGGREGATION_KIND.composite) {
						//composition
						that._children[relName] = new HasOneComposition(that, relName, relation);
					}
					break;
				case RELATION_TYPE.belongsTo:
					if (relation.aggregationKind === AGGREGATION_KIND.shared) {
						//aggregation
						that._children[relName] = new AggregationBelongsTo(that, relName, relation);
					} else if (relation.aggregationKind === AGGREGATION_KIND.composite) {
						//composition
						that._children[relName] = new CompositionBelongsTo(that, relName, relation);
					}
					break;
				case RELATION_TYPE.hasMany:
					if (relation.aggregationKind === AGGREGATION_KIND.none) {
						//reference
					} else if (relation.aggregationKind === AGGREGATION_KIND.shared) {
						//aggregation
					} else if (relation.aggregationKind === AGGREGATION_KIND.composite) {
						//composition
					}
					break

			}
		});
	}

	public modelErrors(propName: string): { message: string, severity: MessageServerity }[] {
		let that = this;
		that._model.$errors = that._model.$errors || {};
		if (propName === '$' && !that._parentArray && that._parent && that._propertyName) {
			return that._parent.modelErrors(that._propertyName)
		}
		that._model.$errors[propName] = that._model.$errors[propName] || [];
		return that._model.$errors[propName];
	}

	public modelState(propName: string): any {
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
	public model(propName?: string): any {
		let that = this;
		return propName ? that._model[propName] : that._model;
	}

	private async beforePropertyChanged(propName: string, oldValue: any, newValue: any): Promise<void> {
		// check can modify ?
	}
	public async changeProperty(propName: string, oldValue: any, newValue: any, hnd): Promise<void> {
		let that = this;
		let eventInfo = that._getEventInfo();
		eventInfo.push({ path: that.getPath(propName), eventType: EventType.propChanged });
		try {
			try {
				// clear errors for propName
				that._errors[propName].error = '';
				await that.beforePropertyChanged(propName, oldValue, newValue);
				//change property
				hnd();
				if (that.status === ObjectStatus.idle) {
					// Validation rules
					await that._transaction.emitInstanceEvent(EventType.propValidate, eventInfo, that.constructor, that, propName, newValue);
					// Propagation rules
					await that._transaction.emitInstanceEvent(EventType.propChanged, eventInfo, that.constructor, that, propName, newValue, oldValue);
				}
			} catch (ex) {
				that._errors[propName].addException(ex);
			}
		} finally {
			eventInfo.pop()
		}

	}


	public async getOrSetProperty(propName: string, value?: any): Promise<any> {
		let that = this;
		let isSet = (value !== undefined), propPath;

		let rel = that._schema.relations ? that._schema.relations[propName] : null;
		if (rel) {
			//TODO traiter relations
			return null;
			//return that._children[propName]
		}

		let propSchema = that._schema.properties[propName];
		let mm = new ModelManager();
		if (!propSchema)
			throw new ApplicationError(util.format('Property not found: "%s".', propName));
		if (isSet) isSet = !schemaUtils.isReadOnly(propSchema);
		if (isSet) {
			// set
			if (that._model[propName] !== value) {
				let oldValue = that._model[propName];
				await that.changeProperty(propName, oldValue, value, function () {
					that._model[propName] = value;
				});
			}
		}
		return that._model[propName];
	}

	public async afterCreated() {
		let that = this;
		if (that._afterCreateCalled) return;
		that._afterCreateCalled = true;
		let eventInfo = that._getEventInfo();
		try {
			if (that.status === ObjectStatus.creating) {
				await that._transaction.emitInstanceEvent(EventType.init, eventInfo, that.constructor, that);
			}
		} finally {
			that.status = ObjectStatus.idle;
		}
	}

	public async validate(options?: { full: boolean }) {
		let that = this;
		let eventInfo = that._getEventInfo();
		if (that.status === ObjectStatus.idle) {
			if (options && options.full) {
				//TODO validate all properties
			}
			try {
				await that._transaction.emitInstanceEvent(EventType.objValidate, eventInfo, that.constructor, that);
			} catch (ex) {
				that._errors['$'].addException(ex);
			}
		}
	}


	constructor(transaction: TransactionContainer, parent: ObservableObject, parentArray: ObservableArray, propertyName: string, value: any, options: { isRestore: boolean }) {
		let that = this;
		that._context = transaction.context;
		that._parent = parent ? parent : undefined;
		that._parentArray = parentArray;
		that.status = options.isRestore ? ObjectStatus.restoring : ObjectStatus.creating;
		that._propertyName = propertyName;
		that._transaction = transaction;
		that.init();
		//check uid 
		checkuuid(value);
		that._setModel(value);
	}

	public destroy() {
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
	public get $states(): InstanceState {
		return <InstanceState>this._states;
	}
	public get $errors(): InstanceErrors {
		return <InstanceErrors>this._errors;
	}

}

function checkuuid(value: any) {
	//check uuid 
	if (value && !value.$uuid) {
		if (value.$isNew || !value.id) {
			value.$uuid = uuid.v1();
			value.id = value.$uuid;
		} else
			value.$uuid = value.id + ' ';
	}
}