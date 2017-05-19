"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const view_many_view_model_1 = require("../view-many-view-model");
const index_1 = require("../../../index");
class UserListRules {
    static async afterAddIUser(users, eventInfo, user) {
        await users.setUserCount(users.userCount + 1);
    }
    static async afterRmvUser(users, eventInfo, user) {
        await users.setUserCount(users.userCount - 1);
    }
    static async afterSetUsers(users, eventInfo, user) {
        await users.setUserCount(await users.users.length());
    }
}
__decorate([
    index_1.addItem(view_many_view_model_1.UserList, 'users')
], UserListRules, "afterAddIUser", null);
__decorate([
    index_1.rmvItem(view_many_view_model_1.UserList, 'users')
], UserListRules, "afterRmvUser", null);
__decorate([
    index_1.setItems(view_many_view_model_1.UserList, 'users')
], UserListRules, "afterSetUsers", null);
exports.UserListRules = UserListRules;
