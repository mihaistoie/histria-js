"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const model_model_1 = require("../model-model");
const index_1 = require("../../../index");
class UserRules {
    static updateFullName(user, eventInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            let fn = user.firstName;
            let ln = user.lastName;
            let fullName = [];
            if (fn)
                fullName.push(fn);
            if (ln)
                fullName.push(ln.toUpperCase());
            yield user.setFullName(fullName.join(' '));
        });
    }
    static init(user, eventInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!user.isNew) {
                yield UserRules.updateFullName(user, eventInfo);
            }
        });
    }
    static check(user, eventInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            let fn = user.firstName;
            let ln = user.lastName;
            if (fn === ln) {
                throw new Error('FirstName === LastName');
            }
        });
    }
    static checkLastName(user, eventInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            let ln = user.lastName;
            if (ln && ln.charAt(0) === '$')
                user.$errors.lastName.error = 'Last Name starts with $.';
        });
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
