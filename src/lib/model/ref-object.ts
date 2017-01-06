import { ObservableObject, ObservableArray, EventInfo, ObjectStatus, MessageServerity, UserContext, TransactionContainer, EventType } from './interfaces';
import { ModelManager } from './model-manager';

export class BaseHasOne<T extends ObservableObject> {
    protected _value: T;
    protected _relation: any;
    protected _propertyName: any;
    protected _parent: ObservableObject;
    protected _refClass: any;

    constructor(parent: any, propertyName: string, relation: any) {
        let that = this;
        that._propertyName = propertyName;
        that._relation = relation;
        that._parent = parent;
        that._refClass = new ModelManager().classByName(that._relation.model);
    }

    public async value(value?: T): Promise<T> {
        let that = this;
        if (value === undefined)
            return that._getValue();
        else
            return that._setValue(value);
    }
    public destroy() {
        let that = this;
        that._relation = null;
        that._parent = null;
        that._refClass = null;
    }
    private async _getValue(): Promise<T> {
        let that = this;
        if (that._value !== undefined)
            return that._value;
        await that._lazyLoad();
        return that._value;
    }
    private async _setValue(value: T): Promise<T> {
        let that = this;
        value = value || null;
        let oldValue = that._getValue();
        if (that._value === value)
            return that._value;
        await that._parent.changeProperty(that._propertyName, oldValue, that._value, function () {
            that._value = value;
            that._updateParentRefs()
        });
        if (oldValue)  
            await that._recyleRefInstance(oldValue);
        return that._value;
    }

    protected  async _recyleRefInstance(value: any): Promise<void> {
    }

    protected async _lazyLoad(): Promise<void> {
        let that = this;
        that._value = null;
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
    constructor(parent: any, propertyName: string, relation: any) {
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
            that._value = await that._parent.transaction.findOne<T>(query, that._refClass);
    }
    protected  async _recyleRefInstance(value: any): Promise<void> {
        //nothing to do
    }

}