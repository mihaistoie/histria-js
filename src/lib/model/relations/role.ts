import { ObservableObject } from '../interfaces';
import { modelManager } from '../model-manager';

export class RoleBase<T extends ObservableObject> {
    protected _parent: ObservableObject;
    protected _relation: any;
    protected _propertyName: any;
    protected _refClass: any;
    constructor(parent: ObservableObject, propertyName: string, relation: any) {
        const that = this;
        that._propertyName = propertyName;
        that._relation = relation;
        that._parent = parent;
        that._refClass = modelManager().classByName(that._relation.model, that._relation.nameSpace);
    }

    public destroy() {
        const that = this;
        that._relation = null;
        that._parent = null;
        that._refClass = null;
    }
    public get refIsPersistent(): boolean {
        const that = this;
        return that._refClass.isPersistent;
    }
}

export class Role<T extends ObservableObject> extends RoleBase<T> {
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
    protected async _getValue(): Promise<T> {
        let that = this;
        return Promise.resolve(that._value);
    }
    protected async _setValue(value: T): Promise<void> {
        return Promise.resolve();
    }
    protected _checkValueBeforeSet(value: T) {
    }

    public destroy() {
        const that = this;
        that._value = null;
        super.destroy();
    }
}
