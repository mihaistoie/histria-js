import { ObservableObject, ObservableArray, EventInfo, ObjectStatus, MessageServerity, UserContext, TransactionContainer, EventType } from './interfaces';
import { ModelManager } from '../model-manager';

export class BaseObjectArray<T extends ObservableObject> {
    protected _parent: ObservableObject;
    protected _items: T[];
    protected _propertyName: string;
    protected _relation: any;
    protected _refClass: any;
    constructor(parent: ObservableObject, propertyName: string, relation: any) {
        let that = this;
        that._parent = parent;
        that._propertyName = propertyName;
        that._relation = relation;
        that._items = [];
        that._refClass = new ModelManager().classByName(that._relation.model, that._relation.nameSpace);
    }
    public destroy() {
        let that = this;
        that._items = null;
        that._relation = null;
        that._parent = null;
        that._refClass = null;
    }
    protected async lazyLoad(): Promise<void> {
        return Promise.resolve();
    }
    public async toArray(): Promise<T[]> {
        let that = this;
        await that.lazyLoad();
        return that._items.slice();
    }
    public async indexOf(item: T): Promise<number> {
        let that = this;
        await that.lazyLoad();
        return (that._items || []).indexOf(item);
    }


}

export class ObjectArray<T extends ObservableObject> extends BaseObjectArray<T> implements ObservableArray {
    protected _model: any;
    protected _isNull: boolean;
    protected _isUndefined: boolean;
    constructor(parent: ObservableObject, propertyName: string, relation: any, model: any[]) {
        super(parent, propertyName, relation)
        let that = this;
        that.setValue(model);

    }
    public getRoot(): ObservableObject {
        return this._parent.getRoot();


    }
    public destroy() {
        let that = this;
        that._model = null;
        that.destroyItems();
        super.destroy();
    }

    protected destroyItems() {
        let that = this
        that._items && that._items.forEach(item => {
            //TODO: remove item from cache
            //item.destroy();
        });
        that._items = [];
    }
    protected setValue(value?: T[]) {
        let that = this;
        that.destroyItems();
        that._isNull = value === null;
        that._isUndefined = value === undefined;
        that._model = value;
    }

}

