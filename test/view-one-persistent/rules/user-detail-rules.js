"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const view_one_model_1 = require("../view-one-model");
const index_1 = require("../../../index");
const VAT_TAX = 0.193;
class UserDetailRules {
    static async userNameChanged(ud, user, eventInfo) {
        await UserDetailRules.updateFullName(ud, user);
    }
    static async userChanged(ud, eventInfo, newValue, oldValue) {
        await UserDetailRules.updateFullName(ud, newValue);
    }
    static async updateFullName(ud, user) {
        if (user) {
            const fn = user.firstName;
            const ln = user.lastName;
            const fullName = [];
            if (fn)
                fullName.push(fn);
            if (ln)
                fullName.push(ln.toUpperCase());
            await ud.setFullName(fullName.join(' '));
        }
        else {
            await ud.setFullName('');
        }
    }
}
__decorate([
    index_1.propChanged(view_one_model_1.UserDetail, 'user.firstName', 'user.lastName')
], UserDetailRules, "userNameChanged", null);
__decorate([
    index_1.propChanged(view_one_model_1.UserDetail, 'user')
], UserDetailRules, "userChanged", null);
__decorate([
    index_1.title(view_one_model_1.UserDetail, 'Calculate:  FullName = FirstName + LastName')
], UserDetailRules, "updateFullName", null);
exports.UserDetailRules = UserDetailRules;

//# sourceMappingURL=user-detail-rules.js.map
