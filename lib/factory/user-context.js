"use strict";
const locale_1 = require("../locale/locale");
class TranContext {
    constructor() {
        let that = this;
        that._lang = 'en';
        that._country = 'US';
    }
    get lang() {
        return this._lang;
    }
    set lang(value) {
        let that = this;
        if (value !== that._lang) {
            let olu = (that._lang || '').toUpperCase();
            that._lang = value;
            if (that._country === olu)
                that._country = (that._lang || '').toUpperCase();
        }
    }
    get country() {
        return this._country;
    }
    set country(value) {
        this._country = value;
    }
    get locale() {
        let that = this;
        return locale_1.locale[that._lang + '_' + that._country];
    }
    formatNumber(value, decimals) {
        return value.toFixed(decimals);
    }
}
exports.TranContext = TranContext;
