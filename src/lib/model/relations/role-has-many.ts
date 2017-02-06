import { ObservableObject, ObservableArray, EventInfo, ObjectStatus, MessageServerity, UserContext, TransactionContainer, EventType } from '../interfaces';
import { ObjectArray, BaseObjectArray } from './base-array';
import { schemaUtils } from 'histria-utils';
import { DEFAULT_PARENT_NAME } from 'histria-utils';

export class HasManyComposition<T extends ObservableObject> extends ObjectArray<T> {
    constructor(parent: ObservableObject, propertyName: string, relation: any, model: any[]) {
        super(parent, propertyName, relation, model);
        let that = this;
        let isRestore = that._parent.status === ObjectStatus.restoring;
        if (!that._isNull && !that._isUndefined) {
            let pmodel = that._parent.model();
            that._items = new Array(model.length);
            that._model.forEach((itemModel: any , index: number) => {
                let item = that._parent.transaction.createInstance<T>(that._refClass, that._parent, that._propertyName, itemModel, isRestore);
                that._items[index] = item;
                if (!isRestore)
                    schemaUtils.updateRoleRefs(that._relation, itemModel, pmodel, true);
            })
        }
    }
    public enumChildren(cb: (value: ObservableObject) => void) {
        let that = this;
        that._items && that._items.forEach(item => {
            item.enumChildren(cb)
            cb(item)
        });
    }
    private async _afterRemoveItem(item: T, notifyRemove: boolean): Promise<void> {
        let that = this;
        let lmodel = item.model();
        schemaUtils.updateRoleRefs(that._relation, lmodel, null, true);
        await item.changeParent(null, that._propertyName, that._relation.invRel || DEFAULT_PARENT_NAME, true);
        if (notifyRemove)
            await that._parent.notifyOperation(that._propertyName, EventType.removeItem, item);

    }
    private async _afterAddItem(item: T, notifyAdd: boolean): Promise<void> {
        let that = this;
        let lmodel = item.model();
        let rmodel = that._parent.model();
        schemaUtils.updateRoleRefs(that._relation, lmodel, rmodel, true);
        await item.changeParent(that._parent, that._propertyName, that._relation.invRel || DEFAULT_PARENT_NAME, true);
        if (notifyAdd)
            await that._parent.notifyOperation(that._propertyName, EventType.addItem, item);

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
        that._model.splice(ii, 1);
        if (!that._model.length) {
            that._model = null;
            that._parent.model()[that._propertyName] = that._model;
        }
        if (item)
            await that._afterRemoveItem(item, true);
        that._isNull = (that._model === null);
        return item;
    }
    public async add(item: T, index?: number): Promise<T> {
        let that = this;
        if (!item) return;
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
        let imodel = item.model();
        if (index >= 0) {
            that._items.splice(index, 0, item);
            that._model.splice(index, 0, imodel);
        } else {
            that._items.push(item);
            that._model.push(that._model);
        }
        if (item)
            await that._afterAddItem(item, true);

        return item;
    }
    public async set(items: T[]): Promise<void> {
        let that = this;
        await that.lazyLoad();
        for (let item of that._items) {
            await that._afterRemoveItem(item, false);
        }
        that._items = [];
        if (items && items.length) {
            that._model = [];
            for (let item of items) {
                let imodel = item.model();
                that._model.push(imodel);
                that._items.push(item);
                await that._afterAddItem(item, false);
            }

        } else {
            that._model = null
        }
        that._isNull = (that._model === null);
        that._parent.model()[that._propertyName] = that._model;
        await that._parent.notifyOperation(that._propertyName, EventType.setItems, null);
    }

    protected async lazyLoad(): Promise<void> {
        let that = this;
        if (!that._parent) return;
        if (that._isUndefined) {
            let lmodel = that._parent.model();
            let query: any = {}, valueIsNull = false;
            that._relation.localFields.forEach((field:string, index: number) => {
                let ff = that._relation.foreignFields[index];
                let value = lmodel[field];
                if (value === null || value === '' || value === undefined)
                    valueIsNull = true;
                else
                    query[ff] = value;
            });
            if (valueIsNull) {
                that._model = null;
            } else {
                let items = await that._parent.transaction.find<T>(that._refClass, query);
                if (items.length) {
                    that._model = new Array(items.length);
                    that._items = new Array(items.length);
                    for (let index = 0; index < items.length; index++) {
                        let item = items[index];
                        let model = item.model();
                        that._model[index] = model;
                        that._items[index] = item;
                        await item.changeParent(that._parent, that._propertyName, that._relation.invRel || DEFAULT_PARENT_NAME, false);
                    }
                } else
                    that._model = null;
            }
            that._isUndefined = false;
            that._isNull = that._model === null;
            lmodel[that._propertyName] = that._model;
        }

    }

}

export class HasManyAggregation<T extends ObservableObject> extends BaseObjectArray<T> {
    private _loaded: boolean;
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
        if (item) {
            let lmodel = item.model();
            schemaUtils.updateRoleRefs(that._relation, lmodel, null, true);
            let r = item.getRoleByName(that._relation.invRel, );
            if (r) await r.internalSetValueAndNotify(null, item);
            await that._parent.notifyOperation(that._propertyName, EventType.removeItem, item);
        }
        return item;
    }
    public async add(item: T, index?: number): Promise<T> {
        let that = this;
        if (!item) return;
        await that.lazyLoad();
        if (that._items.indexOf(item) >= 0)
            return item;
        if (index === undefined || (index < 0 && index >= that._items.length))
            index = -1;
        if (index >= 0)
            that._items.splice(index, 0, item);
        else
            that._items.push(item);
        if (item) {
            let lmodel = item.model();
            let rmodel = that._parent.model();
            let r = item.getRoleByName(that._relation.invRel);
            if (r) await r.internalSetValueAndNotify(that._parent, item);
            await that._parent.notifyOperation(that._propertyName, EventType.addItem, item);
        }
        return item;
    }
    protected async lazyLoad(): Promise<void> {
        let that = this;
        if (!that._parent) return;
        if (!that._loaded) {
            that._loaded = true;
            let lmodel = that._parent.model();
            let query: any = {}, valueIsNull = false;
            that._relation.localFields.forEach((field: string , index: number) => {
                let ff = that._relation.foreignFields[index];
                let value = lmodel[field];
                if (value === null || value === '' || value === undefined)
                    valueIsNull = true;
                else
                    query[ff] = value;
            });
            if (!valueIsNull) {
                let items = await that._parent.transaction.find<T>(that._refClass, query);
                if (items.length) {
                    that._items = new Array(items.length);
                    for (let index = 0; index < items.length; index++) {
                        let item = items[index];
                        that._items[index] = item;
                        await that._updateInvSideAfterLazyLoading(item);
                    }
                }
            }
        }

    }

    protected async _updateInvSideAfterLazyLoading(newValue: T): Promise<void> {
        //after lazy loading
        let that = this;
        if (newValue) {
            //roleInv is AggregationBelongsTo
            let roleInv = newValue.getRoleByName(that._relation.invRel);
            if (roleInv) roleInv.internalSetValue(that._parent);

        }

    }

}