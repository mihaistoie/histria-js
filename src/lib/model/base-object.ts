import { ObservableObject, ObservableArray, EventInfo, ObjectStatus, MessageServerity, UserContext, TransactionContainer } from './interfaces';
import { ApplicationError } from '../utils/errors';
import { ModelManager } from './model-manager';
import * as schemaUtils from '../schema/schema-utils';
import { JSONTYPES } from '../schema/schema-consts';
import { RULE_TRIGGERS } from '../consts/consts';

import { IntegerValue, NumberValue } from './number';
import { InstanceErrors } from './instance-errors'
import { InstanceState } from './instance-state'

import * as helper from '../utils/helper';
import * as util from 'util';

class InstanceEventInfo implements EventInfo {
	private _stack: any[];
	constructor() {
		let that = this;
		that._stack = [];
	}

	public push(info: any): void {
		let that = this;
		that._stack.push(info);
	}
	public pop(): void {
		let that = this;
		that._stack.pop();
	}
	public isTriggeredBy(propertyName: string, target: any): boolean {
		let that = this;
		let path = target.getPath();
		let fp = path ? path + '.' + propertyName : propertyName;
		for (let i = 0, len = that._stack.length; i < len; i++) {
			let info = that._stack[i];
			if (info && info.eventType === RULE_TRIGGERS.PROP_CHANGED) {
				if (fp === info.path) return true;
			}
		}
		return false;
	}
	public destroy() {
		let that = this;
		that._stack = null;
	}
}




export class Instance implements ObservableObject {
	//used only in root
	protected _status: ObjectStatus;
	protected _transaction: any;
	//when set _parent reset _rootCache
	protected _parent: ObservableObject;
	protected _parentArray: ObservableArray;
	protected _children: any;
	protected _schema: any;
	protected _rootCache: ObservableObject;
	private _eventInfo: InstanceEventInfo;
	protected _model: any;
	protected _states: InstanceState;
	protected _errors: InstanceErrors;
	protected _propertyName: string;
	private _context: UserContext;
	protected _getEventInfo(): EventInfo {
		let that = this;
		let root = <Instance>that.getRoot();
		if (root === this) {
			if (!that._eventInfo)
				that._eventInfo = new InstanceEventInfo();
			return that._eventInfo;
		} else
			return root._getEventInfo();
	}

	public get context(): UserContext {
		return this._context;
	}

	public getPath(propName?: string): string {
		let that = this;
		let root = that._parentArray ? that._parentArray.getPath(that) : (that._parent ? that._parent.getPath(that._propertyName) : '');
		return propName ? (root ? (root + '.' + propName) : propName) : root;
	}

	public getRoot(): ObservableObject {
		let that = this;
		if (!that._rootCache)
			that._rootCache = that._parent ? that._parent.getRoot() : that;
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

	private _canExecutePropChangeRules() {
		let that = this;
		let root = <Instance>that.getRoot();
		return root._status === ObjectStatus.idle;
	}

	private _canExecuteValidateRules() {
		let that = this;
		let root = <Instance>that.getRoot();
		return root._status === ObjectStatus.idle;
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


	public async getOrSetProperty(propName: string, value?: any): Promise<any> {
		let that = this;
		let isSet = (value !== undefined), isComplex = false, propPath;
		let eventInfo = that._getEventInfo();
		if (isSet)
			eventInfo.push({ path: that.getPath(propName), eventType: RULE_TRIGGERS.PROP_CHANGED });
		try {
			let propSchema = that._schema.properties[propName];
			let mm = new ModelManager();
			if (!propSchema)
				throw new ApplicationError(util.format('Property not found: "%s".', propName));
			if (schemaUtils.isComplex(propSchema)) {
				isComplex = true;
				if (isSet) {
					if (schemaUtils.isArray(propSchema))
						throw new ApplicationError(util.format('Can\'t set "%s", because is an array.', propName));
					try {
						// clear errors for propName
						that._errors[propName].error = '';
						that._children[propName] = value;
						if (that._canExecuteValidateRules()) {
						}
					} catch (ex) {
						that._errors[propName].addException(ex);
					}
				}
			} else {
				if (isSet) {
					// set
					if (that._model[propName] !== value) {
						that._model[propName] = value;
						try {
							// clear errors for propName
							that._errors[propName].error = '';
							// execute rules 
							if (that._canExecuteValidateRules()) {
							}
							if (that._canExecutePropChangeRules()) {
								let rules = mm.rulesForPropChange(that.constructor, propName);
								if (rules.length) {
									for (let i = 0, len = rules.length; i < len; i++) {
										let rule = rules[i];
										await rule(that, eventInfo);
									}
								}
							}
						} catch (ex) {
							that._errors[propName].addException(ex);
						}
					}
				}
			}
		} finally {
			if (isSet)
				eventInfo.pop()
		}
		return isComplex ? that._children[propName] : that._model[propName];

	}
	constructor(transaction: TransactionContainer, parent: ObservableObject, parentArray: ObservableArray, propertyName: string, value: any, options: { isCreate: boolean, isRestore: boolean }) {
		let that = this;
		that._context = transaction.context;
		that._status = ObjectStatus.idle;
		that._propertyName = propertyName;
		that.init();
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

