import { ObservableObject, ObservableArray, EventInfo, ObjectStatus, MessageServerity, UserContext, TransactionContainer, EventType } from '../interfaces';
import { modelManager } from '../model-manager';
import { RoleBase } from './role';

export class BaseObjectArray<T extends ObservableObject> extends RoleBase<T> {
    protected _items: T[];
    constructor(parent: ObservableObject, propertyName: string, relation: any) {
        super(parent, propertyName, relation)
        const that = this;
        that._items = [];
    }
    public destroy() {
        const that = this;
        that._items = null;
        super.destroy();
    }
    protected _checkValueBeforeAdd(value: T) {
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

    public async remove(element: T | number): Promise<T> {
        let that = this;
        await that.lazyLoad();
        let ii: number, item: T;
        if (typeof element === 'number') {
            ii = <number>element;
            if (ii >= 0 && ii < that._items.length) {
                item = that._items[ii];
            } else {
                ii = -1;
                item = null;
            }
        } else {
            item = <T>element;
            ii = that._items.indexOf(item);
            if (ii < 0)
                item = null;
        }
        if (!item) return null;
        that._items.splice(ii, 1);
        await that._afterRemoveItem(item, ii);
        return item;
    }
    public async add(item: T, index?: number): Promise<T> {
        let that = this;
        if (!item) return null;
        await that.lazyLoad();
        if (that._items.indexOf(item) >= 0)
            return item;
        if (index === undefined || (index < 0 && index >= that._items.length))
            index = -1;
        if (index >= 0)
            that._items.splice(index, 0, item);
        else
            that._items.push(item);
        await that._afterAddItem(item);
        return item;
    }
    protected async _afterRemoveItem(item: T, ii: number): Promise<void> { }
    protected async _afterAddItem(item: T): Promise<void> { }


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
        that._items = null;
    }
    protected setValue(value?: T[]) {
        let that = this;
        that.destroyItems();
        that._items = [];
        that._isNull = value === null;
        that._isUndefined = value === undefined;
        that._model = value;
    }
    protected _itemModel(item: T): any {
        return item.model()
    }

    public async add(item: T, index?: number): Promise<T> {
        let that = this;
        that._checkValueBeforeAdd(item);
        if (!item) return null;
        await that.lazyLoad();
        if (that._items.indexOf(item) >= 0)
            return item;
        if (index === undefined || (index < 0 && index >= that._items.length))
            index = -1;
        if (!that._model) {
            that._model = [];
            that._isNull = false;
            that._parent.model()[that._propertyName] = that._model;
        }
        let imodel = that._itemModel(item);
        if (index >= 0) {
            that._items.splice(index, 0, item);
            that._model.splice(index, 0, imodel);
        } else {
            that._items.push(item);
            that._model.push(imodel);
        }
        await that._afterAddItem(item);
        return item;
    }



}

