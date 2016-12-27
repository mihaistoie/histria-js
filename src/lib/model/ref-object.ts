import { ObservableObject, ObservableArray, EventInfo, ObjectStatus, MessageServerity, UserContext, TransactionContainer, EventType } from './interfaces';

class BaseHasOne<T> {
    protected _value: T;
    protected _relation: any;
    protected _propertyName: any;

    protected _parent: ObservableObject;


    private async _lazyLoad(): Promise<void> {
        let that = this;
        //Todo load from db        
        that._value = null;

    }
    private _updateParentRefs() {
        let that = this;
        let model = that._parent.model();
        that._relation.localFields(field => {
            if (that._value)
                model[field] = that._value[field]
            else
                delete model[field]
        });
    }

    constructor(parent: any, propertyName: string, relation: any) {
        let that = this;
        that._propertyName = propertyName;
        that._relation = relation;
        that._parent = parent;
    }

    public async getValue(): Promise<T> {
        let that = this;
        if (that._value !== undefined)
            return that._value;
        await that._lazyLoad();
        return that._value;
    }
    public async setValue(value: T): Promise<void> {
        let that = this;
        value = value || null;
        let oldValue = that.getValue();
        if (that._value === value) return;
        if (that._value) {
            //TODO
            // --> move to deleted objects list
        }
        that._parent.changeProperty(that._propertyName, oldValue, that._value, function () {
            that._value = value;
            that._updateParentRefs()
        });
    }

    public destroy() {
        let that = this
        that._relation = null;
        that._parent = null;
    }
}

class RefOne<T> extends BaseHasOne<T> {
}