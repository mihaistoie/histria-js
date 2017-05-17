import { ObservableObject, FindOptions } from '../interfaces';
import { Role } from './role';
import { AGGREGATION_KIND, DEFAULT_PARENT_NAME } from 'histria-utils';
import { schemaUtils } from 'histria-utils';


export class BaseBelongsTo<T extends ObservableObject> extends Role<T> {
    protected async _lazyLoad(): Promise<T> {
        const that = this;
        const query = schemaUtils.roleToQueryInv(that._relation, that._parent.model());
        if (query) {
            let opts: FindOptions = { onlyInCache: !that.refIsPersistent };
            return await that._parent.transaction.findOne<T>(that._refClass, query, opts);
        }
        return null;
    }
}

export class AggregationBelongsTo<T extends ObservableObject> extends BaseBelongsTo<T> {
    protected async _getValue(): Promise<T> {
        const that = this;
        let res: any = that._value;
        if (res === undefined) {
            res = await that._lazyLoad() || null;
            that._value = res;
            // TODO: update side
            // that._updateInvSide()
        }
        return res;
    }
    public internalSetValue(value: any) {
        this._value = value;
    }

    public async internalSetValueAndNotify(newValue: any, oldValue: any): Promise<void> {
        const that = this;
        await that._parent.changeProperty(that._propertyName, oldValue, newValue, () => {
            that.internalSetValue(newValue);
            schemaUtils.updateRoleRefs(that._relation, that._parent.model(), newValue ? newValue.model() : null, false);
        }, { isLazyLoading: false });
    }

    protected async _setValue(value: T): Promise<void> {
        const that = this;
        that._checkValueBeforeSet(value);
        const oldValue = that._value;
        const newValue = value;
        if (oldValue === newValue)
            return ;
        let notified = false;
        if (oldValue) {
            notified = true;
            await oldValue.rmvObjectFromRole(that._relation.invRel, that._parent);
        }
        if (newValue) {
            notified = true;
            await newValue.addObjectToRole(that._relation.invRel, that._parent);
        }
        if (!notified) {
            await that.internalSetValueAndNotify(newValue, oldValue);
        }
    }

}

export class CompositionBelongsTo<T extends ObservableObject> extends BaseBelongsTo<T> {
    protected async _getValue(): Promise<T> {
        const that = this;
        let res: any = that._parent.owner;
        if (res === undefined) {
            res = await that._lazyLoad() || null;
            let p: any = that._parent;
            // parent of p is res
            await p.changeParent(res, that._relation.invRel, that._propertyName || DEFAULT_PARENT_NAME, false);
        }
        return res;
    }

    public internalSetValue(value: any) {
    }

    protected async _setValue(value: T): Promise<void> {
        const that = this;
        const oldParent = await that._getValue();
        const newParent = value;
        if (oldParent === newParent)
            return;
        let changeParentCalled = false;
        if (that._relation.invRel) {
            if (oldParent) {
                changeParentCalled = true;
                await oldParent.rmvObjectFromRole(that._relation.invRel, that._parent);
            }
            if (newParent) {
                changeParentCalled = true;
                await newParent.addObjectToRole(that._relation.invRel, that._parent);
            }
        }
        if (!changeParentCalled) {
            let p: any = that._parent;
            schemaUtils.updateRoleRefs(that._relation, that._parent.model(), newParent ? newParent.model() : null, false);
            // parent of p is newParent
            await p.changeParent(newParent, that._relation.invRel, that._propertyName || DEFAULT_PARENT_NAME, true);
        }
    }

}

