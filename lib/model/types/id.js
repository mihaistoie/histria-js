"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class IdValue {
    constructor(parent, propertyName) {
        this._parent = parent;
        this._propertyName = propertyName;
    }
    destroy() {
        this._parent = null;
    }
    get value() {
        return this._parent.getPropertyByName(this._propertyName);
    }
}
exports.IdValue = IdValue;

//# sourceMappingURL=id.js.map
