import { ObservableObject, ObservableArray, EventInfo, ObjectStatus, MessageServerity, UserContext, TransactionContainer, EventType } from './interfaces';

export class BaseHasOne<T extends ObservableObject> {
    protected _value: T;
    protected _relation: any;
    protected _propertyName: any;
    protected _parent: ObservableObject;

    constructor(parent: any, propertyName: string, relation: any) {
        let that = this;
        that._propertyName = propertyName;
        that._relation = relation;
        that._parent = parent;
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
        if (that._value) {
            //TODO
            // --> move to deleted objects list
        }
        that._parent.changeProperty(that._propertyName, oldValue, that._value, function () {
            that._value = value;
            that._updateParentRefs()
        });
        return that._value;
    }

    private async _lazyLoad(): Promise<void> {
        let that = this;
        //Todo load from db        
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
}