"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DateValue {
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
    _setValue(dateAsString) {
        let that = this;
        return that._parent.setPropertyByName(that._propertyName, dateAsString);
    }
    async today() {
        const that = this;
        const today = new Date();
        await that._setValue(today.toISOString().substr(0, 10));
    }
}
exports.DateValue = DateValue;

//# sourceMappingURL=date.js.map
