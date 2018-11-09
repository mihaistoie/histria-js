"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DateTimeValue {
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
    // tslint:disable-next-line:no-empty
    init() {
    }
    _setValue(value) {
        return this._parent.setPropertyByName(this._propertyName, value);
    }
}
exports.DateTimeValue = DateTimeValue;

//# sourceMappingURL=date-time.js.map
