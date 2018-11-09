import { ModelObject } from '../model-object';

export class IdValue {
    protected _parent: ModelObject;
    protected _propertyName: string;
    constructor(parent: ModelObject, propertyName: string) {
        this._parent = parent;
        this._propertyName = propertyName;
    }
    public destroy() {
        this._parent = null;
    }

    public get value(): any {
        return this._parent.getPropertyByName(this._propertyName);
    }

}