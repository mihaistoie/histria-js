"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const path = require("path");
const index_1 = require("../../index");
const view_many_view_model_1 = require("./view-many-view-model");
const histria_utils_1 = require("histria-utils");
async function testCreate() {
    let transaction = new index_1.Transaction();
    let userList = await transaction.create(view_many_view_model_1.UserList);
    let user1 = await transaction.create(view_many_view_model_1.User);
    let user2 = await transaction.create(view_many_view_model_1.User);
    await userList.users.set([user1, user2]);
    assert.equal(userList.userCount, 2, '(0) Rules');
    transaction.destroy();
    transaction = new index_1.Transaction();
    userList = await transaction.create(view_many_view_model_1.UserList);
    user1 = await transaction.create(view_many_view_model_1.User);
    user2 = await transaction.create(view_many_view_model_1.User);
    await userList.users.add(user1);
    await userList.users.add(user2);
    let users = await userList.users.toArray();
    assert.equal(users.length, 2, 'Two users');
    assert.equal(userList.userCount, 2, '(1) Rules');
    await userList.users.remove(user2);
    users = await userList.users.toArray();
    assert.equal(users.length, 1, 'One user');
    assert.equal(userList.userCount, 1, '(2) Rules');
    transaction.destroy();
}
async function testRestore() {
    let transaction = new index_1.Transaction();
    let userList = await transaction.create(view_many_view_model_1.UserList);
    const user1 = await transaction.create(view_many_view_model_1.User);
    const user2 = await transaction.create(view_many_view_model_1.User);
    await userList.users.add(user1);
    await userList.users.add(user2);
    let users = await userList.users.toArray();
    assert.equal(users.length, 2, '(1) Two users');
    const data = transaction.saveToJson();
    const idView = userList.uuid;
    transaction.destroy();
    transaction = new index_1.Transaction();
    await transaction.loadFromJson(data, false);
    userList = await transaction.findOne(view_many_view_model_1.UserList, { id: idView });
    users = await userList.users.toArray();
    assert.equal(users.length, 2, '(2) Two users');
}
async function testRemove() {
    const transaction = new index_1.Transaction();
    const userList = await transaction.create(view_many_view_model_1.UserList);
    const user = await transaction.create(view_many_view_model_1.User);
    await userList.users.add(user);
    let users = await userList.users.toArray();
    assert.equal(users.length, 1, '(1-1) One users');
    await user.remove();
    users = await userList.users.toArray();
    assert.equal(users.length, 0, '(2-2) No users');
    transaction.destroy();
}
describe('View Many <View> Model Test', () => {
    before((done) => {
        const dm = histria_utils_1.dbManager();
        dm.registerNameSpace('view-many-view', 'memory', { compositionsInParent: true });
        const store = dm.store('view-many-view');
        store.initNameSpace('view-many-view', {});
        index_1.loadRules(path.join(__dirname, 'rules')).then(() => {
            done();
        }).catch((ex) => {
            done(ex);
        });
    });
    it('View of users (view) test', (done) => {
        testCreate().then(() => {
            done();
        }).catch((ex) => {
            done(ex);
        });
    });
    it('View of users (view) test remove', (done) => {
        testRemove().then(() => {
            done();
        }).catch((ex) => {
            done(ex);
        });
    });
    it('View of users (view) test restore', (done) => {
        testRestore().then(() => {
            done();
        }).catch((ex) => {
            done(ex);
        });
    });
});

//# sourceMappingURL=view-many-view.specs.js.map
