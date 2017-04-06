"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const path = require("path");
const index_1 = require("../../index");
const view_one_model_1 = require("./view-one-model");
const histria_utils_1 = require("histria-utils");
async function viewOfUserTest() {
    let transaction = new index_1.Transaction();
    let userDetail = await transaction.create(view_one_model_1.UserDetail);
    let user = await transaction.create(view_one_model_1.User);
    await userDetail.setUser(user);
    await user.setFirstName('John');
    let fullName = userDetail.fullName;
    assert.equal(fullName, 'John', 'After user name changed');
    await user.setLastName('Doe');
    fullName = userDetail.fullName;
    assert.equal(fullName, 'John DOE', 'After  name and lastName changed');
    await userDetail.setUser(null);
    fullName = userDetail.fullName;
    assert.equal(fullName, '', 'User is null');
    await userDetail.setUser(user);
    fullName = userDetail.fullName;
    assert.equal(fullName, 'John DOE', 'User is not null');
    let det = await transaction.load(view_one_model_1.UserDetail, { id: 10, userId: 101 });
    user = await det.user();
    assert.notEqual(user, null, 'Lazy loading (1)');
    assert.equal(user.firstName, 'John', 'Lazy loading (2)');
    assert.equal(det.fullName, 'John SMITH', 'Rule called after lazy loading');
}
describe('ViewOne Model Test', () => {
    before(function (done) {
        let dm = histria_utils_1.dbManager();
        dm.registerNameSpace('view-one', 'memory', { compositionsInParent: true });
        let store = dm.store('view-one');
        store.initNameSpace('view-one', {
            user: [
                {
                    id: 100,
                    firstName: 'Joe',
                    lastName: 'Doe',
                },
                {
                    id: 101,
                    firstName: 'John',
                    lastName: 'Smith',
                }
            ]
        });
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
