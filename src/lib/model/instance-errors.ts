import { ErrorState } from './error-state';
import { ObservableObject } from './interfaces';
import * as helper from '../utils/helper';

export class InstanceErrors {
    protected _messages: any;
    private _schema: any;
    private _parent: ObservableObject;

    constructor(parent: ObservableObject, schema: any) {
        let that = this;
        that._messages = {};
        that._schema = schema;
        that._parent = parent;
        that._messages.$ = new ErrorState(that._parent, '$');
        schema && schema.properties && Object.keys(schema.properties).forEach(propName => {
            that._messages[propName] = new ErrorState(that._parent, propName);
        });

    }
    public destroy() {
        let that = this;
        if (that._messages) {
            helper.destroy(that._messages);
            that._messages = null;
        }
        that._schema = null;
        that._parent = null;
    }
}
