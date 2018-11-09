import { ErrorState } from './error-state';
import { IObservableObject } from '../interfaces';
import { helper } from 'histria-utils';

export class InstanceErrors {
    protected _messages: any;
    private _schema: any;
    private _parent: IObservableObject;

    constructor(parent: IObservableObject, schema: any) {
        this._messages = {};
        this._schema = schema;
        this._parent = parent;
        this._messages.$ = new ErrorState(this._parent, '$');
        if (schema && schema.properties)
            Object.keys(schema.properties).forEach(propName => {
                this._messages[propName] = new ErrorState(this._parent, propName);
            });
        if (schema && schema.relations)
            Object.keys(schema.relations).forEach(relName => {
                this._messages[relName] = new ErrorState(this._parent, relName);
            });

    }
    public destroy() {
        if (this._messages) {
            helper.destroy(this._messages);
            this._messages = null;
        }
        this._schema = null;
        this._parent = null;
    }
}
