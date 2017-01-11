import { ObservableObject } from './interfaces';
import { Role } from './role';
import { AGGREGATION_KIND } from '../schema/schema-consts';
import { updateRoleRefs } from '../schema/schema-utils';





export class BaseBelongsTo<T extends ObservableObject> extends Role<T> {
    protected _value: T;

    constructor(parent: ObservableObject, propertyName: string, relation: any) {
        super(parent, propertyName, relation);

    }
    protected async _lazyLoad(): Promise<T> {
        let that = this;
        let lmodel = that._parent.model();
        let query: any = {}, valueIsNull = false;
        that._relation.foreignFields.forEach((field, index) => {
            let ff = that._relation.localFields[index];
            let value = lmodel[ff];
            if (value === null || value === '' || value === undefined)
                valueIsNull = true;
            else
                query[field] = value;
        });
        let res = null;
        if (!valueIsNull)
            res = await that._parent.transaction.findOne<T>(query, that._refClass);
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
        updateRoleRefs(that._relation, that._parent.model(), value ? value.model() : null, false);
    }
    protected async _setValue(value: T): Promise<T> {
        let that = this;
        let oldValue: any = that._value;
        let newValue: any = value;
        if (oldValue === newValue)
            return oldValue;
        if (oldValue) {
            let refRole = that.invRole(oldValue);
            if (refRole) {
                if (refRole.value)
                    await refRole.value(null); //HasOne
                else
                    await refRole.value(that._parent); //HasMany
            }
        }
        if (newValue) {
            let refRole = that.invRole(newValue);
            if (refRole) {
                if (refRole.value)
                    await refRole.value(that._parent); //HasOne
                else
                    await refRole.add(that._parent); //HasMany
            }
        }
        await that._parent.changeProperty(that._propertyName, oldValue, newValue, () => {
            that.internalSetValue(value);
        });
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
            await p.changeParent(res, that._propertyName, false);
            let refRole = that.invRole(res);
            if (refRole)
                refRole.internalSetValue(that._parent);
        }
        return res;
    }
    public internalSetValue(value: any) {
    }
    protected async _setValue(value: T): Promise<T> {
        let that = this;
        let oldParent: any = await that._getValue();
        let newParent: any = value;
        if (oldParent === newParent)
            return oldParent;
        let changeParentCalled = false;
        if (that._relation.invRel) {
            if (oldParent && oldParent.removeChild) {
                changeParentCalled = true;
                await oldParent.removeChild(that._relation.invRel, that._parent);
            }
            if (newParent && newParent.addChild) {
                changeParentCalled = true;
                await newParent.addChild(that._relation.invRel, that._parent);
            }
        }
        if (!changeParentCalled) {
            let p: any = that._parent;
            updateRoleRefs(that._relation, that._parent.model(), newParent ? newParent.model() : null, false);
            await p.changeParent(newParent, that._propertyName, true);
        }
        let res: any = that._parent.parent;
        return res;
    }

}

