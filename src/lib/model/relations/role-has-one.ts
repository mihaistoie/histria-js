import { ObservableObject, ObjectStatus, FindOptions } from '../interfaces';
import { Role } from './role';
import { schemaUtils, DEFAULT_PARENT_NAME } from 'histria-utils';



export class HasOne<T extends ObservableObject> extends Role<T> {
    protected _value: T;
    constructor(parent: ObservableObject, propertyName: string, relation: any) {
        super(parent, propertyName, relation);
    }
    protected async _getValue(): Promise<T> {
        let that = this;
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
        let that = this;
        let query: any = schemaUtils.roleToQueryInv(that._relation, that._parent.model());
        if (query) {
            let opts: FindOptions = { onlyInCache: false };
            that._value = await that._parent.transaction.findOne<T>(that._refClass, query, opts) || null;
        } else
            that._value = null;
    }

    protected async _setValue(value: T): Promise<T> {
        let that = this;
        value = value || null;
        let oldValue = await that._getValue();
        if (that._value === value)
            return that._value;
        await that._parent.changeProperty(that._propertyName, oldValue, that._value, function () {
            that._value = value;
            let lmodel = that._parent.model();
            let fmodel = that._value ? that._value.model() : null;
            schemaUtils.updateRoleRefs(that._relation, lmodel, fmodel, false);
        });
        return that._value;
    }

}

export class HasOneAC<T extends ObservableObject> extends HasOne<T> {
    protected async _setValue(value: T): Promise<T> {
        let that = this;
        value = value || null;
        let oldValue = await that._getValue();
        if (that._value === value)
            return that._value;
        let newValue = value;
        await that._parent.changeProperty(that._propertyName, oldValue, that._value, function () {
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
        });
        await that._afterSetValue(newValue, oldValue);
        return that._value;
    }

    protected async _lazyLoad(): Promise<void> {
        let that = this;
        let query: any = schemaUtils.roleToQuery(that._relation, that._parent.model());
        if (query) {
            that._value = null;
            let opts: FindOptions = { onlyInCache: false };
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
        let that = this;
        let isRestore = that._parent.status === ObjectStatus.restoring;

        let pmodel = that._parent.model();
        let childModel = pmodel[propertyName];
        if (childModel === null)
            that._value = null;
        else if (childModel) {
            that._value = that._parent.transaction.createInstance<T>(that._refClass, that._parent, that._propertyName, childModel, isRestore);
            if (!isRestore)
                schemaUtils.updateRoleRefs(that._relation, childModel, pmodel, true);

        }
    }
    public enumChildren(cb: (value: ObservableObject) => void) {
        let that = this;
        if (that._value) {
            that._value.enumChildren(cb);
            cb(that._value);
        }
    }
    protected async _afterSetValue(newValue: T, oldValue: T): Promise<void> {
        let that = this;
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
        let that = this;
        if (newValue)
            await newValue.changeParent(that._parent, that._propertyName, that._relation.invRel || DEFAULT_PARENT_NAME, false);
    }
    public destroy() {
        let that = this;
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
        let that = this;
        that._value = newValue;
        if (oldValue) {
            let r = oldValue.getRoleByName(that._relation.invRel, );
            if (r) await r.internalSetValueAndNotify(null, oldValue);
        }
        if (newValue) {
            let r = newValue.getRoleByName(that._relation.invRel);
            if (r) await r.internalSetValueAndNotify(that._parent, newValue);
        }
    }
    protected async _updateInvSideAfterLazyLoading(newValue: T): Promise<void> {
        // After lazy loading
        let that = this;
        if (newValue) {
            // roleInv is AggregationBelongsTo
            let roleInv = newValue.getRoleByName(that._relation.invRel);
            if (roleInv) roleInv.internalSetValue(that._parent);

        }

    }
}