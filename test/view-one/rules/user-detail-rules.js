"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../../index");
const VAT_TAX = 0.193;
class UserDetailRules {
    static async updateFullName(ud, user, eventInfo) {
        let fn = user.firstName;
        let ln = user.lastName;
        let fullName = [];
        if (fn)
            fullName.push(fn);
        if (ln)
            fullName.push(ln.toUpperCase());
        await ud.setFullName(fullName.join(' '));
    }
}
__decorate([
    index_1.propChanged(UserDetailRules, 'user.firstName', 'user.lastName'),
    index_1.title(UserDetailRules, 'Calculate:  FullName = FirstName + LastName')
], UserDetailRules, "updateFullName", null);
exports.UserDetailRules = UserDetailRules;
