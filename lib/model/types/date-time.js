"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DateTimeValue {
    constructor(parent, propertyName) {
        let that = this;
        that._parent = parent;
        that._propertyName = propertyName;
        that.init();
    }
    init() {
        const that = this;
    }
    destroy() {
        const that = this;
        that._parent = null;
    }
    get value() {
        const that = this;
        return that._parent.getPropertyByName(that._propertyName);
    }
    _setValue(value) {
        let that = this;
        return that._parent.setPropertyByName(that._propertyName, value);
    }
}
exports.DateTimeValue = DateTimeValue;

//# sourceMappingURL=date-time.js.map