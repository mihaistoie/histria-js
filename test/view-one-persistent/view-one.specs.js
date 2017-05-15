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
    let user1 = await transaction.findOne(view_one_model_1.User, { id: 101 });
    let user2 = await transaction.findOne(view_one_model_1.User, { id: 101 });
    let user3 = await transaction.findOne(view_one_model_1.User, { id: 101 }, { onlyInCache: true });
    assert.equal(user1, user2, 'Same User (1)');
    assert.equal(user1, user3, 'Same User (2)');
    let user = await transaction.create(view_one_model_1.User);
    await userDetail.setUser(user);
    await user.setFirstName('John');
    assert.equal(userDetail.fullName, 'John', 'After user name changed');
    await user.setLastName('Doe');
    assert.equal(userDetail.fullName, 'John DOE', 'After  name and lastName changed');
    await userDetail.setUser(null);
    assert.equal(userDetail.fullName, '', 'User is null');
    await userDetail.setUser(user);
    assert.equal(userDetail.fullName, 'John DOE', 'User is not null');
    let det = await transaction.load(view_one_model_1.UserDetail, { id: 10, userId: 101 });
    user = await det.user();
    assert.notEqual(user, null, 'Lazy loading (1)');
    assert.equal(user.firstName, 'John', 'Lazy loading (2)');
    assert.equal(det.fullName, 'John SMITH', 'Rule called after lazy loading');
    let userDetId = det.id;
    let userId = det.userId;
    let transactionData = transaction.saveToJson();
    transaction.clear();
    await transaction.loadFromJson(transactionData, false);
    let data2 = transaction.saveToJson();
    assert.deepEqual(transactionData, data2, 'Restore Test');
    // Test that det.user is loaded
    let cuser = await transaction.findOne(view_one_model_1.User, { id: userId });
    let duser = await transaction.findOne(view_one_model_1.UserDetail, { id: userDetId });
    assert.equal(!!cuser, true, 'User found');
    assert.equal(!!duser, true, 'User Detail found');
    user1 = await transaction.findOne(view_one_model_1.User, { id: 101 });
    await user1.setLastName('Doe');
    assert.equal(duser.fullName, 'John DOE', 'User suser.user is loaded after transection restore');
    transaction.destroy();
}
async function viewOfUserTestRemove() {
    let transaction = new index_1.Transaction();
    let userDetail = await transaction.create(view_one_model_1.UserDetail);
    let user = await transaction.create(view_one_model_1.User);
    await userDetail.setUser(user);
    assert.notEqual(await userDetail.user(), null, '(1) User is not null');
    await user.remove();
    assert.equal(await userDetail.user(), null, '(1) User is null');
    transaction.destroy();
    transaction = new index_1.Transaction();
    userDetail = await transaction.create(view_one_model_1.UserDetail);
    user = await transaction.findOne(view_one_model_1.User, { id: 100 });
    await userDetail.setUser(user);
    assert.notEqual(await userDetail.user(), null, '(2) User is not null');
    await user.remove();
    assert.equal(await userDetail.user(), null, '(2) User is null');
    transaction.destroy();
    // remove view
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
    it('View of User test remove', function (done) {
        viewOfUserTestRemove().then(function () {
            done();
        }).catch(function (ex) {
            done(ex);
        });
    });
});
