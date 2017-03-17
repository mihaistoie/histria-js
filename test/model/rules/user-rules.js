"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const model_model_1 = require("../model-model");
const index_1 = require("../../../index");
class UserRules {
    static async updateFullName(user, eventInfo) {
        let fn = user.firstName;
        let ln = user.lastName;
        let fullName = [];
        if (fn)
            fullName.push(fn);
        if (ln)
            fullName.push(ln.toUpperCase());
        await user.setFullName(fullName.join(' '));
    }
    static async init(user, eventInfo) {
        if (!user.isNew) {
            await UserRules.updateFullName(user, eventInfo);
        }
    }
    static async check(user, eventInfo) {
        let fn = user.firstName;
        let ln = user.lastName;
        if (fn === ln) {
            throw new Error('FirstName === LastName');
        }
    }
    static async checkLastName(user, eventInfo) {
        let ln = user.lastName;
        if (ln && ln.charAt(0) === '$')
            user.$errors.lastName.error = 'Last Name starts with $.';
    }
}
__decorate([
    index_1.propChanged(model_model_1.User, 'firstName', 'lastName'),
    index_1.title(model_model_1.User, 'Calculate:  FullName = FirstName + LastName')
], UserRules, "updateFullName", null);
__decorate([
    index_1.init(model_model_1.User)
], UserRules, "init", null);
__decorate([
    index_1.validate(model_model_1.User)
], UserRules, "check", null);
__decorate([
    index_1.validate(model_model_1.User, 'lastName')
], UserRules, "checkLastName", null);
exports.UserRules = UserRules;
exports.test = 1;
