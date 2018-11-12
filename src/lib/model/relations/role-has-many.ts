import { IObservableObject, IFrameworkObject, IObservableArray, IEventInfo, ObjectStatus, MessageServerity, IUserContext, ITransactionContainer, EventType, IFindOptions } from '../interfaces';
import { ObjectArray, BaseObjectArray } from './base-array';
import { schemaUtils, DEFAULT_PARENT_NAME } from 'histria-utils';

export class BaseHasMany<T extends IObservableObject> extends ObjectArray<T> {
    public enumChildren(cb: (value: IObservableObject) => void, recursive: boolean) {
        if (this._items)
            this._items.forEach(item => {
                if (recursive) item.enumChildren(cb, true);
                cb(item);
            });
    }

}

export class HasManyComposition<T extends IObservableObject> extends BaseHasMany<T> {
    constructor(parent: IObservableObject, propertyName: string, relation: any, model: any[]) {
        super(parent, propertyName, relation, model);
        const isRestore = this._parent.status === ObjectStatus.restoring;
        if (!this._isNull && !this._isUndefined) {
            const pmodel = this._parent.model();
            this._items = new Array(model.length);
            this._model.forEach((itemModel: any, index: number) => {
                const item = this._parent.transaction.createInstance<T>(this._refClass, this._parent, this._propertyName, itemModel, isRestore);
                this._items[index] = item;
                if (!isRestore)
                    schemaUtils.updateRoleRefs(this._relation, itemModel, pmodel, true);
            });
            if (!isRestore) {
                for (const item of this._items) {
                    parent.pushLoaded(() => this._notifyHooks(item, EventType.addItem));
                }
            }
        }
    }

    public async length(): Promise<number> {
        await this.lazyLoad();
        return this._items ? this._items.length : 0;
    }
    public async set(items: T[]): Promise<void> {
        await this.lazyLoad();
        for (const item of this._items) {
            await this._removed(item, false);
            await this._notifyHooks(item, EventType.removeItem);
        }
        this._items = [];
        if (items && items.length) {
            this._model = [];
            for (const item of items) {
                const imodel = this._itemModel(item);
                this._model.push(imodel);
                this._items.push(item);
                await this._added(item, false);
            }

        } else {
            this._model = null;
        }
        this._isNull = (this._model === null);
        this._parent.model()[this._propertyName] = this._model;
        await this._parent.notifyOperation(this._propertyName, EventType.setItems, null);
        for (const item of items) {
            await this._notifyHooks(item, EventType.addItem);
        }
    }
    public destroy() {
        if (this._items)
            this._items.forEach(item => {
                item.destroy();
            });
        this._items = null;
        super.destroy();
    }
    protected async _afterItemRemoved(item: T, ii: number): Promise<void> {
        this._model.splice(ii, 1);
        if (!this._model.length) {
            this._model = null;
            this._parent.model()[this._propertyName] = this._model;
        }
        if (item)
            await this._removed(item, true);
        this._isNull = (this._model === null);
    }
    protected async _afterItemAdded(item: T): Promise<void> {
        await this._added(item, true);

    }

    protected async lazyLoad(): Promise<void> {
        if (!this._parent) return;
        if (this._isUndefined) {
            const lmodel = this._parent.model();
            const query = schemaUtils.roleToQuery(this._relation, lmodel);
            if (query) {
                const opts: IFindOptions = { onlyInCache: this._parent.isNew || this.refIsPersistent };
                const items = await this._parent.transaction.find<T>(this._refClass, query, opts);
                if (items.length) {
                    this._model = new Array(items.length);
                    this._items = new Array(items.length);
                    for (let index = 0; index < items.length; index++) {
                        const item = items[index];
                        const model = item.model();
                        this._model[index] = model;
                        this._items[index] = item;
                        await item.changeParent(this._parent, this._propertyName, this._relation.invRel || DEFAULT_PARENT_NAME, false);
                    }
                } else
                    this._model = null;
            } else
                this._model = null;
            this._isUndefined = false;
            this._isNull = this._model === null;
            lmodel[this._propertyName] = this._model;
            for (const item of this._items) {
                await this._notifyHooks(item, EventType.addItem);
            }
        }

    }
    private async _notifyHooks(value: IObservableObject, eventType: EventType): Promise<void> {
        const inst: IFrameworkObject = this._parent as any;
        await inst.notifyHooks(this._propertyName, eventType, value);
    }
    private async _removed(item: T, notifyRemove: boolean): Promise<void> {
        const lmodel = item.model();
        schemaUtils.updateRoleRefs(this._relation, lmodel, null, true);
        await item.changeParent(null, this._propertyName, this._relation.invRel || DEFAULT_PARENT_NAME, true);
        if (notifyRemove) {
            await this._parent.notifyOperation(this._propertyName, EventType.removeItem, item);
            await this._notifyHooks(item, EventType.removeItem);
        }

    }
    private async _added(item: T, notifyAdd: boolean): Promise<void> {
        const lmodel = item.model();
        const rmodel = this._parent.model();
        schemaUtils.updateRoleRefs(this._relation, lmodel, rmodel, true);
        await item.changeParent(this._parent, this._propertyName, this._relation.invRel || DEFAULT_PARENT_NAME, true);
        if (notifyAdd) {
            await this._parent.notifyOperation(this._propertyName, EventType.addItem, item);
            await this._notifyHooks(item, EventType.addItem);
        }
    }

}

export class HasManyAggregation<T extends IObservableObject> extends BaseObjectArray<T> {
    private _loaded: boolean;

    public async set(items: T[]): Promise<void> {
        await this.lazyLoad();
        while (this._items && this._items.length)
            await this.remove(0);
        if (items) {
            for (const item of items)
                await this.add(item);
        }
    }

    protected async _afterItemRemoved(item: T, ii: number): Promise<void> {
        if (item) {
            const lmodel = item.model();
            schemaUtils.updateRoleRefs(this._relation, lmodel, null, true);
            const r = item.getRoleByName(this._relation.invRel);
            if (r) await r.internalSetValueAndNotify(null, item);
            await this._parent.notifyOperation(this._propertyName, EventType.removeItem, item);
        }
    }
    protected async _afterItemAdded(item: T): Promise<void> {
        const r = item.getRoleByName(this._relation.invRel);
        if (r) await r.internalSetValueAndNotify(this._parent, item);
        await this._parent.notifyOperation(this._propertyName, EventType.addItem, item);
    }

    protected async lazyLoad(): Promise<void> {
        if (!this._parent) return;
        if (!this._loaded) {
            this._loaded = true;
            const query = schemaUtils.roleToQuery(this._relation, this._parent.model());
            if (query) {
                const opts: IFindOptions = { onlyInCache: false };
                const items = await this._parent.transaction.find<T>(this._refClass, query);
                if (items.length) {
                    this._items = new Array(items.length);
                    for (let index = 0; index < items.length; index++) {
                        const item = items[index];
                        this._items[index] = item;
                        await this._updateInvSideAfterLazyLoading(item);
                    }
                }
            }
        }
    }
    private async _updateInvSideAfterLazyLoading(newValue: T): Promise<void> {
        // After lazy loading
        if (newValue) {
            // roleInv is AggregationBelongsTo
            const roleInv = newValue.getRoleByName(this._relation.invRel);
            if (roleInv) roleInv.internalSetValue(this._parent);
        }
    }
}

export class HasManyRefObject<T extends IObservableObject> extends BaseHasMany<T> {
    public async length(): Promise<number> {
        await this.lazyLoad();
        return this._items ? this._items.length : 0;
    }
    public restoreFromCache() {
        this._items = this._items || [];
        if (this._model && this._model.length && !this._items.length) {
            this._items = [];
            this._model.forEach((idItem: any) => {
                const item: any = this._parent.transaction.findOneInCache<T>(this._refClass, { id: idItem }) || null;
                this._items.push(item);
                this._subscribe(item);
            });
        }
        if (this._model && !this._model.length) {
            this._model = null;
            this._isNull = (this._model === null);
        }

    }
    // Called by ObservableObject (this._items) on destroy
    public unsubscribe(instance: T): void {
        if (this && this._items) {
            const ii = this._items.indexOf(instance);
            if (ii >= 0) {
                this._items.splice(ii, 1);
                // do not :
                // this._model.splice(ii, 1)
            }
        }
    }
    public async set(items: T[]): Promise<void> {
        await this.lazyLoad();
        for (const item of this._items) {
            await this._removed(item, false);
        }
        this._items = [];
        if (items && items.length) {
            this._model = [];
            for (const item of items) {
                const imodel = this._itemModel(item);
                this._model.push(imodel);
                this._items.push(item);
                await this._added(item, false);
            }

        } else {
            this._model = null;
        }
        this._isNull = (this._model === null);
        this._parent.model()[this._propertyName] = this._model;
        await this._parent.notifyOperation(this._propertyName, EventType.setItems, null);
    }

    public destroy() {
        if (this._items)
            this._items.forEach(item => {
                item.rmvListener(this);
            });
        super.destroy();
    }

    protected async _afterItemRemoved(item: T, ii: number): Promise<void> {
        this._model.splice(ii, 1);
        if (!this._model.length) {
            this._model = null;
            this._parent.model()[this._propertyName] = this._model;
        }
        if (item)
            await this._removed(item, true);
        this._isNull = (this._model === null);
    }
    protected async _afterItemAdded(item: T): Promise<void> {
        await this._added(item, true);
    }

    protected async lazyLoad(): Promise<void> {
        this._items = this._items || [];

        if (this._model && this._model.length && !this._items.length) {
            const promises: Array<Promise<T>> = [];
            this._model.forEach((idItem: any) => {
                promises.push(this._parent.transaction.findOne<T>(this._refClass, { id: idItem }));
            });
            const res = await Promise.all(promises);
            let model: any[] = [];
            res.forEach((item, index) => {
                if (item) {
                    model.push(this._model[index]);
                    this._items.push(item);
                    this._subscribe(item);
                }
            });
            if (!model.length) model = null;
            this._model = model;
            this._parent.model()[this._propertyName] = this._model;
            for (const item of this._items)
                await this._notifyHooks(item, EventType.addItem);

        }

    }
    protected _itemModel(item: T): any {
        return item.uuid;
    }
    private _subscribe(value: IObservableObject): void {
        if (value)
            value.addListener(this, this._parent, this._propertyName);
    }
    private async _notifyHooks(value: IObservableObject, eventType: EventType): Promise<void> {
        const inst: IFrameworkObject = this._parent as any;
        await inst.notifyHooks(this._propertyName, eventType, value);
    }

    private async _removed(item: T, notifyRemove: boolean): Promise<void> {
        item.rmvListener(this);
        if (notifyRemove)
            await this._parent.notifyOperation(this._propertyName, EventType.removeItem, item);
        await this._notifyHooks(item, EventType.removeItem);
    }

    private async _added(item: T, notifyAdd: boolean): Promise<void> {
        this._subscribe(item);
        if (notifyAdd)
            await this._parent.notifyOperation(this._propertyName, EventType.addItem, item);
        await this._notifyHooks(item, EventType.addItem);
    }
}
