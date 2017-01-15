import { ObservableObject, ObservableArray, EventInfo, ObjectStatus, MessageServerity, UserContext, TransactionContainer, EventType } from './interfaces';


export class BaseObjectArray<T extends ObservableObject> {
    protected _parent: ObservableObject;
    protected _items: T[];
    protected _propertyName: string;
    protected _relation: any;
    constructor(parent: ObservableObject, propertyName: string, relation: any) {
        let that = this;
        that._parent = parent;
        that._propertyName = propertyName;
        that._relation = relation;
        that._items = [];
    }

    public destroy() {
        let that = this;
        that._items = null;
        that._relation = null;
        that._parent = null;
    }
    protected async lazyLoad(): Promise<void> {
        return Promise.resolve();
    }

}

export class ObjectArray<T extends ObservableObject> extends BaseObjectArray<T> implements ObservableArray {
    protected _model: any;
    protected _rootCache: ObservableObject;
    protected _isNull: boolean;
    protected _isUndefined: boolean;
    constructor(parent: ObservableObject, propertyName: string, relation: any, model: any[]) {
        super(parent, propertyName, relation)
        let that = this;
        that.setValue(model);

    }
    public getRoot(): ObservableObject {
        let that = this;
        if (!that._rootCache)
            that._rootCache = that._parent ? that._parent.getRoot() : null;
        return that._rootCache;

    }
   public getPath(item?: ObservableObject): string {
        let that = this;
        return that._parent ? that._parent.getPath(that._propertyName) : that._propertyName;
    }
    public propertyChanged(propName: string, value: any, oldValue: any, eventInfo: EventInfo) {
    }
    public stateChanged(propName: string, value: any, oldValue: any, eventInfo: EventInfo) {
    }
    public destroy() {
        let that = this;
        that.destroyItems();
        super.destroy();
    }

    protected destroyItems() {
        let that = this
        that._items && that._items.forEach(item => {
            //TODO: remove item from cache
            //item.destroy();
        });
        that._items = [];
    }
    protected setValue(value?: T[]) {
        let that = this;
        that.destroyItems();
        that._isNull = value === null;
        that._isUndefined = value === undefined;
        that._model = value;
    }

}

