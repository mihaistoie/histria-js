class BaseHasOne {
    constructor(parent, model) {
        let that = this;
        that._model = [];
        that._items = [];
    }
    destroy() {
        let that = this;
        that._items.forEach(item => {
            item.destroy();
        });
        that._items = [];
    }
}
