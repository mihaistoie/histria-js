class BaseHasMany {
    constructor(parent, model) {
        let that = this;
        that.setValue(model);
        that._model = [];
        that._items = [];
        that.setValue(model);
    }
    destroyItems() {
        let that = this;
        that._items.forEach(item => {
            item.destroy();
        });
        that._items = [];
    }
    setValue(value) {
        let that = this;
        that.destroyItems();
        that.isNull = value === null;
        that.isUndefined = value === undefined;
        that._model = value;
    }
}
