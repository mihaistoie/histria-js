import { ObservableObject, ObservableArray, EventInfo, ObjectStatus, MessageServerity, UserContext, TransactionContainer, EventType } from './interfaces';



class ObjectArray<T> implements ObservableArray {
    protected _parent: ObservableObject;
    protected _items: ObservableObject[];
    protected _propertyName: string;
    protected _model: any;
    protected _rootCache: ObservableObject;
    public isNull: boolean;
    public isUndefined: boolean;
    constructor(parent: ObservableObject, propertyName: string, model: any[]) {
        let that = this;
        that._model = [];
        that._items = [];
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
        that._model = null;
        that._items = null;
        that._rootCache = null;
    }

    protected destroyItems() {
        let that = this
        that._items && that._items.forEach(item => {
            item.destroy();
        });
        that._items = [];
    }
    protected setValue(value?: T[]) {
        let that = this;
        that.destroyItems();
        that.isNull = value === null;
        that.isUndefined = value === undefined;
        that._model = value;
    }
}