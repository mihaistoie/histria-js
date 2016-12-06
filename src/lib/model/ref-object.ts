
class BaseHasOne<T> {
    protected _parent;
    protected _items;
    protected _model;
    public isNull: boolean;
    public isUndefined: boolean;
    constructor(parent: any, model: T[]) {
        let that = this;
        that._model = [];
        that._items = [];
    }
    public destroy() {
        let that = this
        that._items.forEach(item => {
            item.destroy();
        });
        that._items = [];
    }
}