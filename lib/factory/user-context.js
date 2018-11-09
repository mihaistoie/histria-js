"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const histria_utils_1 = require("histria-utils");
class TranContext {
    constructor() {
        this._lang = 'en';
        this._country = 'US';
    }
    get lang() {
        return this._lang;
    }
    set lang(value) {
        if (value !== this._lang) {
            const olu = (this._lang || '').toUpperCase();
            this._lang = value;
            if (this._country === olu)
                this._country = (this._lang || '').toUpperCase();
        }
    }
    get country() {
        return this._country;
    }
    set country(value) {
        this._country = value;
    }
    get locale() {
        return histria_utils_1.locale(this._lang + '_' + this._country);
    }
    formatNumber(value, decimals) {
        return value.toFixed(decimals);
    }
}
exports.TranContext = TranContext;

//# sourceMappingURL=user-context.js.map
