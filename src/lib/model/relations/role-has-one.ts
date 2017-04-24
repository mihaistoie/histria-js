import { ObservableObject, ObjectStatus, FindOptions } from '../interfaces';
import { Role } from './role';
import { schemaUtils, DEFAULT_PARENT_NAME, AGGREGATION_KIND } from 'histria-utils';



export class HasOne<T extends ObservableObject> extends Role<T> {
    protected _value: T;
    constructor(parent: ObservableObject, propertyName: string, relation: any) {
        super(parent, propertyName, relation);
    }
    protected async _getValue(): Promise<T> {
        const that = this;
        if (that._value !== undefined)
            return that._value;
        await that._lazyLoad();
        return that._value;
    }

    protected async _lazyLoad(): Promise<void> {
        this._value = null;
        return Promise.resolve();
    }

}

export class HasOneRef<T extends ObservableObject> extends HasOne<T> {
    constructor(parent: ObservableObject, propertyName: string, relation: any) {
        super(parent, propertyName, relation);
    }
    protected async _lazyLoad(): Promise<void> {
        const that = this;
        const query: any = schemaUtils.roleToQueryInv(that._relation, that._parent.model());
        if (query) {
            let opts: FindOptions = { onlyInCache: false };
            that._value = await that._parent.transaction.findOne<T>(that._refClass, query, opts) || null;
        } else
            that._value = null;
    }

    protected async _setValue(value: T): Promise<void> {
        const that = this;
        value = value || null;
        let oldValue = await that._getValue();
        if (that._value === value)
            return;
        await that._parent.changeProperty(that._propertyName, oldValue, value, () => {
            that._value = value;
            let lmodel = that._parent.model();
            let fmodel = that._value ? that._value.model() : null;
            schemaUtils.updateRoleRefs(that._relation, lmodel, fmodel, false);
        }, { isLazyLoading: false });
    }

}

export class HasOneAC<T extends ObservableObject> extends HasOne<T> {
    protected async _setValue(value: T): Promise<void> {
        const that = this;
        value = value || null;
        that._checkValueBeforeSet(value);
        let oldValue = await that._getValue();
        if (that._value === value)
            return;
        const newValue = value;
        await that._parent.changeProperty(that._propertyName, oldValue, value, () => {
            that._value = value;
            if (that._relation.invRel) {
                let fmodel = that._parent.model(), lmodel;
                if (oldValue) {
                    lmodel = oldValue.model();
                    schemaUtils.updateRoleRefs(that._relation, lmodel, null, true);
                }
                if (that._value) {
                    lmodel = that._value.model();
                    schemaUtils.updateRoleRefs(that._relation, lmodel, fmodel, true);
                }
            }
        }, { isLazyLoading: false });
        await that._afterSetValue(newValue, oldValue);
    }

    protected async _lazyLoad(): Promise<void> {
        const that = this;
        const query: any = schemaUtils.roleToQuery(that._relation, that._parent.model());
        if (query) {
            that._value = null;
            const opts: FindOptions = { onlyInCache: false };
            that._value = await that._parent.transaction.findOne<T>(that._refClass, query, opts);
            await that._updateInvSideAfterLazyLoading(that._value);
        } else
            that._value = null;
    }

    protected _afterSetValue(newValue: T, oldValue: T): Promise<void> {
        return Promise.resolve();
    }
    protected _updateInvSideAfterLazyLoading(newValue: T): Promise<void> {
        return Promise.resolve();
    }

}

export class HasOneComposition<T extends ObservableObject> extends HasOneAC<T> {
    constructor(parent: ObservableObject, propertyName: string, relation: any) {
        super(parent, propertyName, relation);
        const that = this;
        const isRestore = that._parent.status === ObjectStatus.restoring;

        const pmodel = that._parent.model();
        const childModel = pmodel[propertyName];
        if (childModel === null)
            that._value = null;
        else if (childModel) {
            that._value = that._parent.transaction.createInstance<T>(that._refClass, that._parent, that._propertyName, childModel, isRestore);
            if (!isRestore)
                schemaUtils.updateRoleRefs(that._relation, childModel, pmodel, true);

        }
    }
    public enumChildren(cb: (value: ObservableObject) => void, recursive: boolean) {
        const that = this;
        if (that._value) {
            if (recursive) that._value.enumChildren(cb, true);
            cb(that._value);
        }
    }
    protected async _afterSetValue(newValue: T, oldValue: T): Promise<void> {
        const that = this;
        if (newValue) {
            await newValue.changeParent(that._parent, that._propertyName, that._relation.invRel || DEFAULT_PARENT_NAME, true);
            that._parent.model()[that._propertyName] = newValue.model();
        }
        if (oldValue) {
            await oldValue.changeParent(null, that._propertyName, that._relation.invRel || DEFAULT_PARENT_NAME, true)
        }
        if (!newValue) {
            that._parent.model()[that._propertyName] = null;
        }
    }
    protected async _updateInvSideAfterLazyLoading(newValue: T): Promise<void> {
        const that = this;
        if (newValue)
            await newValue.changeParent(that._parent, that._propertyName, that._relation.invRel || DEFAULT_PARENT_NAME, false);
    }
    public destroy() {
        const that = this;
        if (that._value) {
            that._value.destroy();
            that._value = null;
        }
        super.destroy();
    }
}


export class HasOneAggregation<T extends ObservableObject> extends HasOneAC<T> {
    constructor(parent: ObservableObject, propertyName: string, relation: any) {
        super(parent, propertyName, relation);
    }

    protected async _afterSetValue(newValue: T, oldValue: T): Promise<void> {
        const that = this;
        that._value = newValue;
        if (oldValue) {
            const r = oldValue.getRoleByName(that._relation.invRel, );
            if (r) await r.internalSetValueAndNotify(null, oldValue);
        }
        if (newValue) {
            const r = newValue.getRoleByName(that._relation.invRel);
            if (r) await r.internalSetValueAndNotify(that._parent, newValue);
        }
    }
    protected async _updateInvSideAfterLazyLoading(newValue: T): Promise<void> {
        // After lazy loading
        const that = this;
        if (newValue) {
            // roleInv is AggregationBelongsTo
            const roleInv = newValue.getRoleByName(that._relation.invRel);
            if (roleInv) roleInv.internalSetValue(that._parent);

        }

    }
}


export class HasOneRefObject<T extends ObservableObject> extends HasOne<T> {
    protected _value: T;
    constructor(parent: ObservableObject, propertyName: string, relation: any) {
        super(parent, propertyName, relation);
    }
    private _subscribe(): void {
        const that = this;
        if (that._value && that._relation.aggregationKind === AGGREGATION_KIND.composite) {
            that._value.addListener(that, that._parent, that._propertyName);
        }

    }
    // Called by that._value on destroy
    public unsubscribe(): void {
        const that = this;
        if (that._relation.aggregationKind === AGGREGATION_KIND.composite) {
            that._value = undefined;
        }

    }
    public enumChildren(cb: (value: ObservableObject) => void, recursive: boolean) {
        const that = this;
        const parentIsPersistent = that._parent.isPersistent;
        if (that._relation.aggregationKind === AGGREGATION_KIND.composite && that._value) {
            if (parentIsPersistent && !that._value.isPersistent) {
                if (recursive)
                    that._value.enumChildren(cb, true);
                cb(that._value);
            }
        }
    }

    public get syncValue(): T {
        return this._value;
    }
    public restoreFromCache() {
        const that = this;
        const query: any = schemaUtils.roleToQueryInv(that._relation, that._parent.model());
        let value: any = that._parent.transaction.findOneInCache<T>(that._refClass, query) || null;
        if (value) {
            that._value = value;
            that._subscribe();
        }
    }

    public destroy() {
        const that = this;
        if (that._value && that._relation.aggregationKind === AGGREGATION_KIND.composite) {
            that._value.rmvListener(that);
            that._value = null;
        }
        super.destroy();
    }

    protected async _setValue(value: T): Promise<void> {
        const that = this;
        that._checkValueBeforeSet(value);
        value = value || null;
        let oldValue = await that._getValue();
        if (that._value === value)
            return;
        await that._parent.changeProperty(that._propertyName, oldValue, value, () => {
            if (oldValue && that._relation.aggregationKind === AGGREGATION_KIND.composite)
                oldValue.rmvListener(that);
            that._value = value;
            that._subscribe();
            let lmodel = that._parent.model();
            let fmodel = that._value ? that._value.model() : null;
            schemaUtils.updateRoleRefs(that._relation, lmodel, fmodel, false);
        }, { isLazyLoading: false });
    }


    protected async _lazyLoad(): Promise<void> {
        const that = this;
        const query: any = schemaUtils.roleToQueryInv(that._relation, that._parent.model());
        if (query) {
            const opts: FindOptions = { onlyInCache: false };
            that._value = await that._parent.transaction.findOne<T>(that._refClass, query, opts) || null;
            if (that._relation.aggregationKind === AGGREGATION_KIND.composite)
                await that._parent.changeProperty(that._propertyName, undefined, that._value, () => { }, { isLazyLoading: true });
            that._subscribe()
        } else
            that._value = null;
    }

}