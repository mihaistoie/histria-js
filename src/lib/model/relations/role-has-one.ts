import { IObservableObject, IFrameworkObject, ObjectStatus, IFindOptions, EventType } from '../interfaces';
import { Role } from './role';
import { schemaUtils, DEFAULT_PARENT_NAME, AGGREGATION_KIND } from 'histria-utils';

export class HasOne<T extends IObservableObject> extends Role<T> {
    protected _value: T;
    constructor(parent: IObservableObject, propertyName: string, relation: any) {
        super(parent, propertyName, relation);
    }
    protected async _getValue(): Promise<T> {
        if (this._value !== undefined)
            return this._value;
        await this._lazyLoad();
        return this._value;
    }

    protected async _lazyLoad(): Promise<void> {
        this._value = null;
        return Promise.resolve();
    }

}

export class HasOneRef<T extends IObservableObject> extends HasOne<T> {
    constructor(parent: IObservableObject, propertyName: string, relation: any) {
        super(parent, propertyName, relation);
    }
    protected async _lazyLoad(): Promise<void> {
        const query: any = schemaUtils.roleToQueryInv(this._relation, this._parent.model());
        if (query) {
            const opts: IFindOptions = { onlyInCache: false };
            this._value = await this._parent.transaction.findOne<T>(this._refClass, query, opts) || null;
        } else
            this._value = null;
    }

    protected async _setValue(value: T): Promise<void> {
        value = value || null;
        const oldValue = await this._getValue();
        if (this._value === value)
            return;
        await this._parent.changeProperty(this._propertyName, oldValue, value, () => {
            this._value = value;
            const lmodel = this._parent.model();
            const fmodel = this._value ? this._value.model() : null;
            schemaUtils.updateRoleRefs(this._relation, lmodel, fmodel, false);
        }, { isLazyLoading: false });
    }

}

export class HasOneAC<T extends IObservableObject> extends HasOne<T> {
    public async remove(instance: T): Promise<void> {
        const oldValue = await this.getValue();
        if (oldValue === instance)
            await this.setValue(null);
    }
    protected async _notifyHooks(value: IObservableObject, eventType: EventType): Promise<void> {
        const inst: IFrameworkObject = this._parent as any;
        await inst.notifyHooks(this._propertyName, eventType, value);
    }
    protected async _setValue(value: T): Promise<void> {
        value = value || null;
        this._checkValueBeforeSet(value);
        const oldValue = await this._getValue();
        if (this._value === value)
            return;
        const newValue = value;
        await this._parent.changeProperty(this._propertyName, oldValue, value, () => {
            this._value = value;
            if (this._relation.invRel) {
                const useInv = (this.refIsPersistent || this._parent.isPersistent);
                const fmodel = this._parent.model();
                let lmodel;
                if (oldValue && useInv) {
                    lmodel = oldValue.model();
                    schemaUtils.updateRoleRefs(this._relation, lmodel, null, true);
                }
                if (this._value) {
                    lmodel = this._value.model();
                    if (useInv)
                        schemaUtils.updateRoleRefs(this._relation, lmodel, fmodel, useInv);
                    else
                        schemaUtils.updateRoleRefs(this._relation, fmodel, lmodel, useInv);
                } else {
                    if (!useInv) {
                        schemaUtils.updateRoleRefs(this._relation, fmodel, null, useInv);
                    }

                }

            }

        }, { isLazyLoading: false });
        await this._afterSetValue(newValue, oldValue);
    }

    protected async _lazyLoad(): Promise<void> {
        const query: any = schemaUtils.roleToQuery(this._relation, this._parent.model());
        if (query) {
            this._value = null;
            const opts: IFindOptions = { onlyInCache: this.refIsPersistent };
            this._value = await this._parent.transaction.findOne<T>(this._refClass, query, opts);
            await this._updateInvSideAfterLazyLoading(this._value);
        } else
            this._value = null;
    }

    protected _afterSetValue(newValue: T, oldValue: T): Promise<void> {
        return Promise.resolve();
    }
    protected _updateInvSideAfterLazyLoading(newValue: T): Promise<void> {
        return Promise.resolve();
    }

}

export class HasOneComposition<T extends IObservableObject> extends HasOneAC<T> {
    constructor(parent: IObservableObject, propertyName: string, relation: any) {
        super(parent, propertyName, relation);
        const isRestore = this._parent.status === ObjectStatus.restoring;

        const pmodel = this._parent.model();
        const childModel = pmodel[propertyName];
        if (childModel === null)
            this._value = null;
        else if (childModel) {
            this._value = this._parent.transaction.createInstance<T>(this._refClass, this._parent, this._propertyName, childModel, isRestore);
            if (!isRestore) {
                const useInv = (this.refIsPersistent || this._parent.isPersistent);
                if (useInv)
                    schemaUtils.updateRoleRefs(this._relation, childModel, pmodel, useInv);
                else
                    schemaUtils.updateRoleRefs(this._relation, pmodel, childModel, useInv);
            }
            if (!isRestore && this._value) {
                parent.pushLoaded(() => this._notifyHooks(this._value, EventType.addItem));
            }

        }
    }

    public enumChildren(cb: (value: IObservableObject) => void, recursive: boolean) {
        if (this._value) {
            if (recursive) this._value.enumChildren(cb, true);
            cb(this._value);
        }
    }
    public destroy() {
        if (this._value) {
            this._value.destroy();
            this._value = null;
        }
        super.destroy();
    }
    protected async _afterSetValue(newValue: T, oldValue: T): Promise<void> {
        if (newValue) {
            await newValue.changeParent(this._parent, this._propertyName, this._relation.invRel || DEFAULT_PARENT_NAME, true);
            this._parent.model()[this._propertyName] = newValue.model();
        }
        if (oldValue) {
            await oldValue.changeParent(null, this._propertyName, this._relation.invRel || DEFAULT_PARENT_NAME, true);
        }
        if (!newValue) {
            this._parent.model()[this._propertyName] = null;
        }
        if (oldValue)
            await this._notifyHooks(oldValue, EventType.removeItem);
        if (newValue)
            await this._notifyHooks(newValue, EventType.addItem);
    }
    protected async _updateInvSideAfterLazyLoading(newValue: T): Promise<void> {
        if (newValue)
            await newValue.changeParent(this._parent, this._propertyName, this._relation.invRel || DEFAULT_PARENT_NAME, false);
    }
}
export class HasOneAggregation<T extends IObservableObject> extends HasOneAC<T> {
    constructor(parent: IObservableObject, propertyName: string, relation: any) {
        super(parent, propertyName, relation);
    }

    protected async _afterSetValue(newValue: T, oldValue: T): Promise<void> {
        this._value = newValue;
        if (oldValue) {
            const r = oldValue.getRoleByName(this._relation.invRel);
            if (r) await r.internalSetValueAndNotify(null, oldValue);
        }
        if (newValue) {
            const r = newValue.getRoleByName(this._relation.invRel);
            if (r) await r.internalSetValueAndNotify(this._parent, newValue);
        }
    }
    protected async _updateInvSideAfterLazyLoading(newValue: T): Promise<void> {
        // After lazy loading
        if (newValue) {
            // roleInv is AggregationBelongsTo
            const roleInv = newValue.getRoleByName(this._relation.invRel);
            if (roleInv) roleInv.internalSetValue(this._parent);

        }

    }
}
export class HasOneRefObject<T extends IObservableObject> extends HasOne<T> {

    public get syncValue(): T {
        return this._value;
    }
    protected _value: T;
    constructor(parent: IObservableObject, propertyName: string, relation: any) {
        super(parent, propertyName, relation);
    }
    // Called by ObservableObject (this._value) on destroy
    public unsubscribe(instance: T): void {
        if (this._relation.aggregationKind === AGGREGATION_KIND.composite) {
            this._value = undefined;
        }

    }
    public enumChildren(cb: (value: IObservableObject) => void, recursive: boolean) {
        const parentIsPersistent = this._parent.isPersistent;
        if (this._relation.aggregationKind === AGGREGATION_KIND.composite && this._value) {
            if (parentIsPersistent && !this._value.isPersistent) {
                if (recursive)
                    this._value.enumChildren(cb, true);
                cb(this._value);
            }
        }
    }
    public restoreFromCache() {
        const query: any = schemaUtils.roleToQueryInv(this._relation, this._parent.model());
        const value: any = this._parent.transaction.findOneInCache<T>(this._refClass, query) || null;
        if (value) {
            this._value = value;
            this._subscribe();
        }
    }

    public destroy() {
        if (this._value && this._relation.aggregationKind === AGGREGATION_KIND.composite) {
            this._value.rmvListener(this);
            this._value = null;
        }
        super.destroy();
    }
    public async remove(instance: T): Promise<void> {
        const oldValue = await this.getValue();
        if (oldValue === instance)
            await this.setValue(null);
    }

    protected async _setValue(value: T): Promise<void> {
        this._checkValueBeforeSet(value);
        value = value || null;
        const oldValue = await this._getValue();
        if (this._value === value)
            return;
        await this._parent.changeProperty(this._propertyName, oldValue, value, () => {
            if (oldValue && this._relation.aggregationKind === AGGREGATION_KIND.composite)
                oldValue.rmvListener(this);
            this._value = value;
            this._subscribe();
            const lmodel = this._parent.model();
            const fmodel = this._value ? this._value.model() : null;
            schemaUtils.updateRoleRefs(this._relation, lmodel, fmodel, false);
        }, { isLazyLoading: false });
        if (this._relation.aggregationKind === AGGREGATION_KIND.composite) {
            if (oldValue)
                await this._notifyHooks(oldValue, EventType.removeItem);
            if (this._value)
                await this._notifyHooks(this._value, EventType.addItem);
        }
    }

    protected async _lazyLoad(): Promise<void> {
        const query: any = schemaUtils.roleToQueryInv(this._relation, this._parent.model());
        if (query) {
            const opts: IFindOptions = { onlyInCache: false };
            this._value = await this._parent.transaction.findOne<T>(this._refClass, query, opts) || null;
            if (this._relation.aggregationKind === AGGREGATION_KIND.composite)
                // tslint:disable-next-line:no-empty
                await this._parent.changeProperty(this._propertyName, undefined, this._value, () => { }, { isLazyLoading: true });
            this._subscribe();
        } else
            this._value = null;
        if (this._value && this._relation.aggregationKind === AGGREGATION_KIND.composite) {
            await this._notifyHooks(this._value, EventType.addItem);
        }
    }
    private async _notifyHooks(value: IObservableObject, eventType: EventType): Promise<void> {
        const inst: IFrameworkObject = this._parent as any;
        await inst.notifyHooks(this._propertyName, eventType, value);
    }
    private _subscribe(): void {
        if (this._value && this._relation.aggregationKind === AGGREGATION_KIND.composite) {
            this._value.addListener(this, this._parent, this._propertyName);
        }
    }

}