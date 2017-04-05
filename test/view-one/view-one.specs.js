"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const path = require("path");
const index_1 = require("../../index");
const view_one_model_1 = require("./view-one-model");
async function viewOfUserTest() {
    let transaction = new index_1.Transaction();
    let userDetail = await transaction.create(view_one_model_1.UserDetail);
    let user = await transaction.create(view_one_model_1.User);
    await userDetail.setUser(user);
    await user.setFirstName('John');
    let fullName = userDetail.fullName;
    assert.equal(fullName, 'John', 'Rules call ');
    await user.setLastName('Doe');
    let fn = user.firstName;
    let ln = user.lastName;
    fullName = userDetail.fullName;
    assert.equal(fn, 'John', 'First Name set/get');
    assert.equal(ln, 'Doe', 'Last Name set/get');
    assert.equal(fullName, 'John DOE', 'Rules call');
}
describe('ViewOne Model Test', () => {
    before(function (done) {
        index_1.loadRules(path.join(__dirname, 'rules')).then(() => {
            done();
        }).catch((ex) => {
            done(ex);
        });
    });
    it('View of User test', function (done) {
        viewOfUserTest().then(function () {
            done();
        }).catch(function (ex) {
            done(ex);
        });
    });
});
