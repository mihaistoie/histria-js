import { Instance } from './base-object';
import { ApplicationError } from '../utils/errors';
import { messages } from '../locale/messages';

export class IdValue {
    protected _parent: Instance;
    protected _propertyName: string;
    constructor(parent: Instance, propertyName: string) {
        let that = this;
        that._parent = parent;
        that._propertyName = propertyName;
    }
    public destroy() {
        let that = this;
        that._parent = null;
    }

    public get value(): any {
        let that = this;
        return that._parent.getPropertyByName(that._propertyName);
    }

}