"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const role_1 = require("./role");
class BaseHasOne extends role_1.Role {
    constructor(parent, propertyName, relation) {
        super(parent, propertyName, relation);
    }
    destroy() {
        this._value = null;
        super.destroy();
    }
    value(value) {
        return __awaiter(this, void 0, void 0, function* () {
            let that = this;
            if (value === undefined)
                return that._getValue();
            else
                return that._setValue(value);
        });
    }
    _getValue() {
        return __awaiter(this, void 0, void 0, function* () {
            let that = this;
            if (that._value !== undefined)
                return that._value;
            yield that._lazyLoad();
            return that._value;
        });
    }
    _setValue(value) {
        return __awaiter(this, void 0, void 0, function* () {
            let that = this;
            value = value || null;
            let oldValue = yield that._getValue();
            if (that._value === value)
                return that._value;
            yield that._parent.changeProperty(that._propertyName, oldValue, that._value, function () {
                that._value = value;
                that._updateParentRefs();
            });
            that._notifyInvRel(that._value, oldValue);
            if (oldValue)
                yield that._recyleRefInstance(oldValue);
            return that._value;
        });
    }
    _lazyLoad() {
        return __awaiter(this, void 0, void 0, function* () {
            let that = this;
            let lmodel = that._parent.model();
            let query = {}, valueIsNull = false;
            that._relation.foreignFields.forEach((field, index) => {
                let ff = that._relation.localFields[index];
                let value = lmodel[ff];
                if (value === null || value === '' || value === undefined)
                    valueIsNull = true;
                else
                    query[field] = value;
            });
            if (valueIsNull)
                that._value = null;
            else
                that._value = yield that._parent.transaction.findOne(query, that._refClass);
            that._afterSetValue();
        });
    }
    _notifyInvRel(value, oldValue) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    _recyleRefInstance(value) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    _afterSetValue() {
    }
    _updateParentRefs() {
        let that = this;
        let pmodel = that._parent.model();
        let nmodel = that._value ? that._value.model() : null;
        that._relation.localFields.forEach((field, index) => {
            let ff = that._relation.foreignFields[index];
            if (that._value)
                pmodel[field] = nmodel[ff];
            else
                delete pmodel[field];
        });
    }
}
exports.BaseHasOne = BaseHasOne;
class HasOneRef extends BaseHasOne {
    constructor(parent, propertyName, relation) {
        super(parent, propertyName, relation);
    }
}
exports.HasOneRef = HasOneRef;
class HasOneComposition extends BaseHasOne {
    constructor(parent, propertyName, relation) {
        super(parent, propertyName, relation);
    }
}
exports.HasOneComposition = HasOneComposition;
class HasOneAggregation extends BaseHasOne {
    constructor(parent, propertyName, relation) {
        super(parent, propertyName, relation);
    }
}
exports.HasOneAggregation = HasOneAggregation;
