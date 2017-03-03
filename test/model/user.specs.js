"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const path = require("path");
const index_1 = require("../../index");
const model_model_1 = require("./model-model");
function testUser() {
    return __awaiter(this, void 0, void 0, function* () {
        let transaction = new index_1.Transaction();
        let user = yield transaction.create(model_model_1.User);
        yield user.setFirstName('John'); // user.firstName = 'John';
        let fullName = user.fullName;
        assert.equal(fullName, 'John', 'Rules call ');
        yield user.setAge(10.25);
        let age = user.age;
        assert.equal(age, 10, 'Age set/get');
        yield user.setLastName('Doe'); // user.lastName = 'Doe';
        let fn = user.firstName; // fn = user.firstName;
        let ln = user.lastName; // ln = user.lastName;
        fullName = user.fullName; // fullName = user.fullName;
        assert.equal(fn, 'John', 'First Name set/get');
        assert.equal(ln, 'Doe', 'Last Name set/get');
        assert.equal(fullName, 'John DOE', 'Rules call');
        assert.equal(user.$states.firstName.isMandatory, true, 'Init state (firstName.isMandatory) from schema');
        assert.equal(user.$states.fullName.isReadOnly, true, 'Init state (fullName.isReadOnly) from schema');
        assert.equal(user.$states.fullName.isHidden, false, 'Init state (fullName.isHidden) from schema');
        user = yield transaction.load(model_model_1.User, { firstName: 'Albert', lastName: 'Camus' });
        fullName = user.fullName;
        assert.equal(fullName, 'Albert CAMUS', 'Init rule called');
        yield user.setLastName('$Money');
        assert.equal(user.$errors.lastName.error, 'Last Name starts with $.', 'Has error ');
        yield user.setLastName('Doe');
        assert.equal('', '', 'Has error ');
        yield user.setFirstName('Doe');
        yield user.validate();
        assert.equal(user.$errors.$.error, 'FirstName === LastName', 'Has error ');
    });
}
describe('User Model Test', () => {
    before(function (done) {
        index_1.loadRules(path.join(__dirname, 'rules')).then(() => {
            done();
        }).catch((ex) => {
            done(ex);
        });
    });
    it('User test', function (done) {
        testUser().then(function () {
            done();
        }).catch(function (ex) {
            done(ex);
        });
    });
});
