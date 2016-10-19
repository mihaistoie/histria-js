
class BaseHasMany<T> { 
    protected _parent;
    protected _items;
    protected _model;
    public isNull: boolean;
    public isUndefined: boolean;
    constructor(parent: any, model: T[])  {
        let that = this;
        that.setValue(model);
        that._model = [];
        that._items = [];
        that.setValue(model);

    }
    protected destroyItems() {
       let that = this
        that._items.forEach(item => {
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