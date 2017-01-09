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
class BaseBelongsTo extends role_1.Role {
    constructor(parent, propertyName, relation) {
        super(parent, propertyName, relation);
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
        return Promise.resolve(null);
    }
    _setValue(value) {
        return __awaiter(this, void 0, void 0, function* () {
            return Promise.resolve(null);
        });
    }
    destroy() {
        let that = this;
        that._value = null;
        super.destroy();
    }
}
exports.BaseBelongsTo = BaseBelongsTo;
class CompositionBelongsTo extends BaseBelongsTo {
    constructor(parent, propertyName, relation) {
        super(parent, propertyName, relation);
    }
    _getValue() {
        let that = this;
        let res = that._parent.parent;
        return Promise.resolve(res);
    }
    _setValue(value) {
        return __awaiter(this, void 0, void 0, function* () {
            let that = this;
            let oldParent = that._parent.parent;
            let newParent = value;
            if (oldParent && oldParent.removeChild) {
                yield oldParent.removeChild(that._relation.invRel, that._parent);
            }
            else if (newParent && newParent.addChild) {
                yield newParent.addChild(that._relation.invRel, that._parent);
            }
            else if (!value) {
                yield that.updateParent(null);
            }
            let res = that._parent.parent;
            return res;
        });
    }
    destroy() {
        let that = this;
        that._value = null;
        super.destroy();
    }
    updateParent(value) {
        return __awaiter(this, void 0, void 0, function* () {
            //todo 
            let that = this;
            // notify
            let cp = that._parent;
            cp._parent = value;
        });
    }
}
exports.CompositionBelongsTo = CompositionBelongsTo;
