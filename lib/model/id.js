"use strict";
class IdValue {
    constructor(parent, propertyName) {
        let that = this;
        that._parent = parent;
        that._propertyName = propertyName;
    }
    destroy() {
        let that = this;
        that._parent = null;
    }
    get value() {
        let that = this;
        return that._parent.getPropertyByName(that._propertyName);
    }
}
exports.IdValue = IdValue;
