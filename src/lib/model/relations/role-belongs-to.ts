import { ObservableObject, FindOptions } from '../interfaces';
import { Role } from './role';
import { AGGREGATION_KIND, DEFAULT_PARENT_NAME } from 'histria-utils';
import { schemaUtils } from 'histria-utils';






export class BaseBelongsTo<T extends ObservableObject> extends Role<T> {
    protected _value: T;

    constructor(parent: ObservableObject, propertyName: string, relation: any) {
        super(parent, propertyName, relation);

    }
    protected async _lazyLoad(): Promise<T> {
        let that = this;
        let lmodel = that._parent.model();
        let query: any = {}, valueIsNull = false;
        that._relation.foreignFields.forEach((field: string, index: number) => {
            let ff = that._relation.localFields[index];
            let value = lmodel[ff];
            if (value === null || value === '' || value === undefined)
                valueIsNull = true;
            else
                query[field] = value;
        });
        let res = null;
        if (!valueIsNull) {
            let opts: FindOptions = { onlyInCache: false };
            res = await that._parent.transaction.findOne<T>(that._refClass, query, opts);
        }
        return res || null;
    }
    public destroy() {
        let that = this;
        that._value = null;
        super.destroy();
    }
}

export class AggregationBelongsTo<T extends ObservableObject> extends BaseBelongsTo<T> {
    protected async _getValue(): Promise<T> {
        let that = this;
        let res: any = that._value;
        if (res === undefined) {
            res = await that._lazyLoad() || null;
            that._value = res;
            //TODO: update side
            //that._updateInvSide()
        }
        return res;
    }
    public internalSetValue(value: any) {
        let that = this;
        that._value = value;
    }
    public async internalSetValueAndNotify(newValue: any, oldValue: any): Promise<void> {
        let that = this;
        await that._parent.changeProperty(that._propertyName, oldValue, newValue, () => {
            that.internalSetValue(newValue);
            schemaUtils.updateRoleRefs(that._relation, that._parent.model(), newValue ? newValue.model() : null, false);
        });
    }
    protected async _setValue(value: T): Promise<T> {
        let that = this;
        let oldValue = that._value;
        let newValue = value;
        if (oldValue === newValue)
            return oldValue;
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
        return that._value;
    }

}

export class CompositionBelongsTo<T extends ObservableObject> extends BaseBelongsTo<T> {
    protected async _getValue(): Promise<T> {
        let that = this;
        let res: any = that._parent.parent;
        if (res === undefined) {
            res = await that._lazyLoad() || null;
            let p: any = that._parent;
            // parent of p is res
            await p.changeParent(res, that._relation.invRel, that._propertyName || DEFAULT_PARENT_NAME, false );
        }
        return res;
    }
    public internalSetValue(value: any) {
    }
    protected async _setValue(value: T): Promise<T> {
        let that = this;
        let oldParent = await that._getValue();
        let newParent = value;
        if (oldParent === newParent)
            return oldParent;
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
        let res: any = that._parent.parent;
        return res;
    }

}

