import { IObservableObject, IObservableArray, IEventInfo, ObjectStatus, MessageServerity, IUserContext, ITransactionContainer, EventType } from '../interfaces';
import { modelManager } from '../model-manager';
import { RoleBase } from './role';

export class BaseObjectArray<T extends IObservableObject> extends RoleBase<T> {
    protected _items: T[];
    constructor(parent: IObservableObject, propertyName: string, relation: any) {
        super(parent, propertyName, relation);
        this._items = [];
    }
    public destroy() {
        this._items = null;
        super.destroy();
    }
    public async toArray(): Promise<T[]> {
        await this.lazyLoad();
        return this._items.slice();
    }
    public async indexOf(item: T): Promise<number> {
        await this.lazyLoad();
        return (this._items || []).indexOf(item);
    }

    public async remove(element: T | number): Promise<T> {
        await this.lazyLoad();
        let ii: number;
        let item: T;
        if (typeof element === 'number') {
            ii = element as number;
            if (ii >= 0 && ii < this._items.length) {
                item = this._items[ii];
            } else {
                ii = -1;
                item = null;
            }
        } else {
            item = element as T;
            ii = this._items.indexOf(item);
            if (ii < 0)
                item = null;
        }
        if (!item) return null;
        this._items.splice(ii, 1);
        await this._afterItemRemoved(item, ii);
        return item;
    }
    public async add(item: T, index?: number): Promise<T> {
        if (!item) return null;
        await this.lazyLoad();
        if (this._items.indexOf(item) >= 0)
            return item;
        if (index === undefined || (index < 0 && index >= this._items.length))
            index = -1;
        if (index >= 0)
            this._items.splice(index, 0, item);
        else
            this._items.push(item);
        await this._afterItemAdded(item);
        return item;
    }
    // tslint:disable-next-line:no-empty
    protected _checkValueBeforeAdd(value: T) { }
    protected async lazyLoad(): Promise<void> {
        return Promise.resolve();
    }
    // tslint:disable-next-line:no-empty
    protected async _afterItemRemoved(item: T, ii: number): Promise<void> { }
    // tslint:disable-next-line:no-empty
    protected async _afterItemAdded(item: T): Promise<void> { }

}

export class ObjectArray<T extends IObservableObject> extends BaseObjectArray<T> implements IObservableArray {
    protected _model: any;
    protected _isNull: boolean;
    protected _isUndefined: boolean;
    constructor(parent: IObservableObject, propertyName: string, relation: any, model: any[]) {
        super(parent, propertyName, relation);
        this.setValue(model);

    }
    public getRoot(): IObservableObject {
        return this._parent.getRoot();
    }
    public async add(item: T, index?: number): Promise<T> {
        this._checkValueBeforeAdd(item);
        if (!item) return null;
        await this.lazyLoad();
        if (this._items.indexOf(item) >= 0)
            return item;
        if (index === undefined || (index < 0 && index >= this._items.length))
            index = -1;
        if (!this._model) {
            this._model = [];
            this._isNull = false;
            this._parent.model()[this._propertyName] = this._model;
        }
        const imodel = this._itemModel(item);
        if (index >= 0) {
            this._items.splice(index, 0, item);
            this._model.splice(index, 0, imodel);
        } else {
            this._items.push(item);
            this._model.push(imodel);
        }
        await this._afterItemAdded(item);
        return item;
    }

    public destroy() {
        this._model = null;
        this.destroyItems();
        super.destroy();

    }

    protected destroyItems() {
        this._items = null;
    }
    protected setValue(value?: T[]) {
        this.destroyItems();
        this._items = [];
        this._isNull = value === null;
        this._isUndefined = value === undefined;
        this._model = value;
    }
    protected _itemModel(item: T): any {
        return item.model();
    }

}
