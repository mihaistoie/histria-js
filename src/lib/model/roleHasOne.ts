import { ObservableObject } from './interfaces';
import { Role } from './role';
import { updateRoleRefs } from '../schema/schema-utils';


export class BaseHasOne<T extends ObservableObject> extends Role<T> {
    protected _value: T;
    constructor(parent: ObservableObject, propertyName: string, relation: any) {
        super(parent, propertyName, relation)
    }
    public destroy() {
        this._value = null;
        super.destroy();
    }
    protected async _getValue(): Promise<T> {
        let that = this;
        if (that._value !== undefined)
            return that._value;
        await that._lazyLoad();
        return that._value;
    }

    protected async _lazyLoad(): Promise<void> {
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
        if (valueIsNull)
            that._value = null;
        else
            that._value = await that._parent.transaction.findOne<T>(query, that._refClass);
        that._afterSetValue();
    }


    protected async _notifyInvRel(value: ObservableObject, oldValue: ObservableObject): Promise<void> {
    }

    protected async _recyleRefInstance(value: any): Promise<void> {
    }

    protected _afterSetValue() {

    }

    private _updateParentRefs() {
        let that = this;
        let pmodel = that._parent.model();
        let nmodel = that._value ? that._value.model() : null;
        that._relation.localFields.forEach((field, index) => {
            let ff = that._relation.foreignFields[index];
            if (that._value)
                pmodel[field] = nmodel[ff]
            else
                delete pmodel[field];
        });
    }

}

export class HasOneRef<T extends ObservableObject> extends BaseHasOne<T> {
    constructor(parent: ObservableObject, propertyName: string, relation: any) {
        super(parent, propertyName, relation);
    }
    
    protected async _setValue(value: T): Promise<T> {
        let that = this;
        value = value || null;
        let oldValue = await that._getValue();
        if (that._value === value)
            return that._value;
        await that._parent.changeProperty(that._propertyName, oldValue, that._value, function () {
            that._value = value;
            let lmidel = that._parent.model();
            let fmodel = that._value ? that._value.model() : null;
            updateRoleRefs(that._relation, lmidel, fmodel);
        });
        that._notifyInvRel(that._value, oldValue)
        if (oldValue)
            await that._recyleRefInstance(oldValue);
        return that._value;
    }
    
}

export class HasOneComposition<T extends ObservableObject> extends BaseHasOne<T> {
    constructor(parent: ObservableObject, propertyName: string, relation: any) {
        super(parent, propertyName, relation);
    }
    protected _afterSetValue() {
        // after 
        let that = this;
        if (that._value)
            that._value.changeParent(that._parent, false);
    }
}

export class HasOneAggregation<T extends ObservableObject> extends BaseHasOne<T> {
    constructor(parent: ObservableObject, propertyName: string, relation: any) {
        super(parent, propertyName, relation);
    }
}