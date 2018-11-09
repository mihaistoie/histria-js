import { IObservableObject } from '../interfaces';
import { modelManager } from '../model-manager';

export class RoleBase<T extends IObservableObject> {
    protected _parent: IObservableObject;
    protected _relation: any;
    protected _propertyName: any;
    protected _refClass: any;
    constructor(parent: IObservableObject, propertyName: string, relation: any) {
        this._propertyName = propertyName;
        this._relation = relation;
        this._parent = parent;
        this._refClass = modelManager().classByName(this._relation.model, this._relation.nameSpace);
    }

    public destroy() {
        this._relation = null;
        this._parent = null;
        this._refClass = null;
    }
    public get refIsPersistent(): boolean {
        return this._refClass.isPersistent;
    }
}

// tslint:disable-next-line:max-classes-per-file
export class Role<T extends IObservableObject> extends RoleBase<T> {
    protected _value: T;
    public internalSetValue(value: T) {
        this._value = value;
    }

    public getValue(): Promise<T> {
        return this._getValue();
    }
    public setValue(value: T): Promise<void> {
        return this._setValue(value);
    }
    public destroy() {
        this._value = null;
        super.destroy();
    }
    protected async _getValue(): Promise<T> {
        return Promise.resolve(this._value);
    }
    protected async _setValue(value: T): Promise<void> {
        return Promise.resolve();
    }
    // tslint:disable-next-line:no-empty
    protected _checkValueBeforeSet(value: T) {
    }
}
