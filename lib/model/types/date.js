"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DateValue {
    constructor(parent, propertyName) {
        this._parent = parent;
        this._propertyName = propertyName;
        this.init();
    }
    destroy() {
        this._parent = null;
    }
    get value() {
        return this._parent.getPropertyByName(this._propertyName);
    }
    async today() {
        const today = new Date();
        await this._setValue(today.toISOString().substr(0, 10));
    }
    // tslint:disable-next-line:no-empty
    init() {
    }
    _setValue(dateAsString) {
        return this._parent.setPropertyByName(this._propertyName, dateAsString);
    }
}
exports.DateValue = DateValue;

//# sourceMappingURL=date.js.map
