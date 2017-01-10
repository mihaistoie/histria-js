import { ObservableObject } from './interfaces';
import { Role } from './role';
import { AGGREGATION_KIND } from '../schema/schema-consts';
import { updateRoleRefs } from '../schema/schema-utils';





export class BaseBelongsTo<T extends ObservableObject> extends Role<T> {
    protected _value: T;

    constructor(parent: ObservableObject, propertyName: string, relation: any) {
        super(parent, propertyName, relation);

    }
    public destroy() {
        let that = this;
        that._value = null;
        super.destroy();
    }
}

export class AggregationBelongsTo<T extends ObservableObject> extends BaseBelongsTo<T> {
}

export class CompositionBelongsTo<T extends ObservableObject> extends BaseBelongsTo<T> {
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
    protected async _getValue(): Promise<T> {
        let that = this;
        let res: any = that._parent.parent;
        if (res === undefined) {
            res = await that._lazyLoad() || null;
            let p: any = that._parent;
            await p.changeParent(res, that._propertyName, false);
        }
        return res;
    }
    protected async _setValue(value: T): Promise<T> {
        let that = this;
        let oldParent: any = that._parent.parent;
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

    public destroy() {
        let that = this;
        that._value = null;
        super.destroy();
    }
}

