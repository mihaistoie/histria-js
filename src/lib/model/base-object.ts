import { ObservableObject, ObservableArray, EventInfo } from './instance';
import { ApplicationError } from '../utils/errors';
import { ModelManager } from './model-manager';
import * as schemaUtils from '../schema/schema-utils';
import { JSONTYPES } from '../schema/schema-consts';
import { RULE_TRIGGERS } from '../consts/consts';

import { EnumState, IntegerState, NumberState, DateState, DateTimeState, RefObjectState, RefArrayState, StringState } from './state';
import { IntegerValue, NumberValue } from './number';
import * as helper from '../utils/helper';
import * as util from 'util';

class InstanceEventInfo implements EventInfo {
	constructor() {

	}
	public push(info: any): void {

	}
	public pop(): void {

	}
	public isTriggeredBy(): boolean {
		return false;
	}
	public destroy() {

	}
}

export class InstanceState {
	protected _states: any;
	private _schema: any;
	private _parent: ObservableObject;

	constructor(parent: ObservableObject, schema: any) {
		let that = this;
		that._states = {};
		that._schema = schema;
		that._parent = parent;
		schema && schema.properties && Object.keys(schema.properties).forEach(propName => {
			let cs = schema.properties[propName];
			let propType = schemaUtils.typeOfProperty(cs);
			if (cs.enum) {
				that._states[propName] = new EnumState(that._parent, propName);
			} else {
				switch (propType) {
					case JSONTYPES.integer:
						that._states[propName] = new IntegerState(that._parent, propName);
						break;
					case JSONTYPES.number:
						that._states[propName] = new NumberState(that._parent, propName);
						break;
					case JSONTYPES.date:
						that._states[propName] = new DateState(that._parent, propName);
						break;
					case JSONTYPES.datetime:
						that._states[propName] = new DateTimeState(that._parent, propName);
						break;
					case JSONTYPES.array:
						break;
					case JSONTYPES.object:
						break;
					case JSONTYPES.refobject:
						that._states[propName] = new RefObjectState(that._parent, propName);
						break;
					case JSONTYPES.refarray:
						that._states[propName] = new RefArrayState(that._parent, propName);
						break;
					default:
						that._states[propName] = new StringState(that._parent, propName);
						break;
				}
			}

		});

	}
	public destroy() {
		let that = this;
		if (that._states) {
			helper.destroy(that._states);
			that._states = null;
		}
		that._schema = null;
		that._parent = null;

	}
}

export class Instance implements ObservableObject {
	protected _parent: ObservableObject;
	protected _parentArray: ObservableArray;
	protected _children: any;
	protected _schema: any;
	private  _eventInfo: InstanceEventInfo;
	protected _model: any;
	protected _states: InstanceState;
	protected _propertyName: string;
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

	public getPath(propName?: string): string {
		let that = this;
		let root = that._parentArray ? that._parentArray.getPath(that) : (that._parent ? that._parent.getPath(that._propertyName) : '');
		return propName ? (root ? (root + '.' + propName) : propName) : root;
	}

	public getRoot(): ObservableObject {
		let that = this;
		return that._parent ? that._parent.getRoot() : that;
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
		that._createProperties();


	}
	protected createStates() { }
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

	public modelState(propName: string): any {
		let that = this;
		that._model.$states = that._model.$states || {};
		let ss = that._model.$states[propName];
		if (!ss) {
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
					that._children[propName] = value;
				}
			} else {
				if (isSet) {
					// set
					if (that._model[propName] !== value) {
						that._model[propName] = value;
						let rules = mm.rulesForPropChange(that.constructor, propName);
						if (rules.length) {
							for (let i = 0, len = rules.length; i < len; i++) {
								let rule = rules[i];
								await rule(that, eventInfo);
							}
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
	constructor(transaction: any, parent: ObservableObject, parentArray: ObservableArray, propertyName: string, value: any) {
		let that = this;
		that._propertyName = propertyName;
		that.init();
		that._setModel(value);
	}

	public dstroy() {
		let that = this;
		that._schema = null;
		that._model = null;
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
		that._parent = null;
		that._parentArray = null;
		that._propertyName = null;

	}
	public get states(): InstanceState {
		return <InstanceState>this._states;
	}
}

