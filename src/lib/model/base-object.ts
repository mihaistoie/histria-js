import { ObservableObject, ObservableArray } from './instance';
import { ApplicationError } from '../utils/errors';
import * as util from 'util';

export class Instance implements ObservableObject {
    protected _parent: ObservableObject;
    protected _parentArray: ObservableObject;
    protected _schema: any;
    protected _model: any;
    protected _propertyName: string;


    public propertyChanged(propName: string, value: any, oldValue: any, callStackInfo?: any) {
    }
    public stateChanged(propName: string, value: any, oldValue: any, callStackInfo?: any) {
    }


    protected init() { }

    public modelState(propName: string): any {
        return null;
    }


    protected getOrSetProperty(propName: string, value?: any): Promise<any> {
        let that = this;
        let propSchema = that._schema.properties[propName];
        if (!propSchema) return Promise.reject(new ApplicationError(util.format('Property not found: "%s".', propName)));
        if (value === 'undefined') {
            // get
            return Promise.resolve(that._model[propSchema]);
        } else {
            // set
            that._model[propSchema] = value;
            return Promise.resolve(that._model[propSchema]);
        }
    }
    constructor(parent: ObservableObject, parentArray: ObservableArray, propertyName: string, schema: any) {
        let that = this;
        that._schema = schema;
        that.init();

    }
}
