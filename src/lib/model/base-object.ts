import { ObservableObject, ObservableArray } from './instance';
import { ApplicationError } from '../utils/errors';
import { ModelManager } from './model-manager';
import * as schemaUtils from '../schema/schema-utils';

import * as util from 'util';

export class Instance implements ObservableObject {
	protected _parent: ObservableObject;
	protected _parentArray: ObservableObject;
	protected _children: any;
	protected _schema: any;
	protected _model: any;
	protected _state: any;
	protected _propertyName: string;


	public propertyChanged(propName: string, value: any, oldValue: any, callStackInfo?: any) {
	}
	public stateChanged(propName: string, value: any, oldValue: any, callStackInfo?: any) {
	}
	protected init() {
	}
	//called only on create or on load 
	protected _setModel(value: any) {
		let that = this;
		let states = value.$states;
		that._model = value;
		that._children = {};
	}
	public modelState(propName: string): any {
		return null;
	}


	protected async getOrSetProperty(propName: string, value?: any): Promise<any> {
		let that = this;
		let propSchema = that._schema.properties[propName];
		let mm = new ModelManager();
		if (!propSchema)
			throw new ApplicationError(util.format('Property not found: "%s".', propName));
		if (schemaUtils.isComplex(propSchema)) {
			if (value === undefined) {
			} else {
				if (schemaUtils.isArray(propSchema))
					throw new ApplicationError(util.format('Can\'t set "%s", because is an array.', propName));
				that._children[propName] = value;
			}
			return Promise.resolve(that._children[propName]);
		} else {
			if (value === undefined) {
				// get
			} else {
				// set
				if (that._model[propName] !== value) {
					that._model[propName] = value;
					let rules = mm.rulesForPropChange(that.constructor, propName);
					if (rules.length) {
						for (let i = 0, len = rules.length; i < len; i++) {
							let rule = rules[i];
							await rule(that, null);
						}
					}
				}
			}
		}
		return that._model[propName];

	}
	constructor(transaction: any, parent: ObservableObject, parentArray: ObservableArray, propertyName: string, value: any) {
		let that = this;
		that._propertyName = propertyName;
		that.init();
		that._setModel(value);
	}

	public finalize() {
		let that = this;
		that._schema = null;
		that._model = null;
		that._state = null;
		that._parent = null;
		that._parentArray = null;
		that._propertyName = null;

	}
}
