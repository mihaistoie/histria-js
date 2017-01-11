import { ObservableObject } from './interfaces';
import { Role } from './role';
import { updateRoleRefs } from '../schema/schema-utils';
import { DEFAULT_PARENT_NAME } from '../schema/schema-consts';


export class HasOne<T extends ObservableObject> extends Role<T> {
    protected _value: T;
    constructor(parent: ObservableObject, propertyName: string, relation: any) {
        super(parent, propertyName, relation)
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

export class HasOneRef<T extends ObservableObject> extends HasOne<T> {
    constructor(parent: ObservableObject, propertyName: string, relation: any) {
        super(parent, propertyName, relation);
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
            that._value = await that._parent.transaction.findOne<T>(query, that._refClass) || null;
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
            updateRoleRefs(that._relation, lmodel, fmodel, false);
        });
        return that._value;
    }

}

export class HasOneAC<T extends ObservableObject> extends HasOne<T> {
    protected async _setValue(value: T): Promise<T> {
        let that = this;
        value = value || null;
        let oldValue: any = await that._getValue();
        if (that._value === value)
            return that._value;
        let newValue: any = value;
        await that._parent.changeProperty(that._propertyName, oldValue, that._value, function () {
            that._value = value;
            if (that._relation.invRel) {
                let fmodel = that._parent.model(), lmodel;
                if (oldValue) {
                    lmodel = oldValue.model();
                    updateRoleRefs(that._relation, lmodel, null, true);
                }
                if (that._value) {
                    lmodel = that._value.model();
                    updateRoleRefs(that._relation, lmodel, fmodel, true);
                }
            }
        });
        await that._afterSetValue(newValue, oldValue);
        return that._value;
    }

    protected async _lazyLoad(): Promise<void> {
        let that = this;
        let lmodel = that._parent.model();
        let query: any = {}, valueIsNull = false;
        that._relation.localFields.forEach((field, index) => {
            let ff = that._relation.foreignFields[index];
            let value = lmodel[field];
            if (value === null || value === '' || value === undefined)
                valueIsNull = true;
            else
                query[ff] = value;
        });
        if (valueIsNull)
            that._value = null;
        else {
            that._value = await that._parent.transaction.findOne<T>(query, that._refClass);
            await that._updateInvSide(that._value);
        }
    }

    protected _afterSetValue(newValue: any, oldValue: any): Promise<void> {
        return Promise.resolve();
    }
    protected _updateInvSide(newValue: any): Promise<void> {
        return Promise.resolve();
    }

}

export class HasOneComposition<T extends ObservableObject> extends HasOneAC<T> {
    protected async _afterSetValue(newValue: any, oldValue: any): Promise<void> {
        let that = this;
        if (newValue) 
            await newValue.changeParent(that._parent, that._relation.invRel || DEFAULT_PARENT_NAME, true)
        if (oldValue)
            await oldValue.changeParent(null, that._relation.invRel || DEFAULT_PARENT_NAME, true)
    }
    protected async _updateInvSide(newValue: any): Promise<void> {
        let that = this;
        if (newValue) {
            await newValue.changeParent(that._parent, that._relation.invRel || DEFAULT_PARENT_NAME, false);
            
        }
    }
}


export class HasOneAggregation<T extends ObservableObject> extends HasOneAC<T> {
    constructor(parent: ObservableObject, propertyName: string, relation: any) {
        super(parent, propertyName, relation);
    }
    protected async _setValue(value: T): Promise<T> {
        let that = this;
        return super._setValue(value);
    }
    
    protected async _afterSetValue(newValue: any, oldValue: any): Promise<void> {
        let that = this;
        that._value = newValue;
        if (oldValue) {
            let r = that.invRole(oldValue);
            if (r) r.internalSetValue(null);
        }
        if (newValue) {
            let r = that.invRole(newValue);
            if (r) r.internalSetValue(that._parent);
        }
    }
    protected async _updateInvSide(newValue: any): Promise<void> {
        
    }
}