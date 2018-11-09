"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const persistence_query_model_1 = require("../persistence-query-model");
const index_1 = require("../../../index");
class UserRules {
    static async canRemoveUser(user, eventInfo) {
        if (user.firstName === 'Jack')
            return false;
        return true;
    }
    static async canModifyUser(user, eventInfo) {
        if (user.firstName === 'Albert')
            return false;
        return true;
    }
}
__decorate([
    index_1.removing(persistence_query_model_1.User)
], UserRules, "canRemoveUser", null);
__decorate([
    index_1.editing(persistence_query_model_1.User)
], UserRules, "canModifyUser", null);
exports.UserRules = UserRules;

//# sourceMappingURL=persistence.js.map
