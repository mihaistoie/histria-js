"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const path = require("path");
const index_1 = require("../../index");
const view_many_model_1 = require("./view-many-model");
const histria_utils_1 = require("histria-utils");
async function testCreate() {
    let transaction = new index_1.Transaction();
    let userList = await transaction.create(view_many_model_1.UserList, { external: true });
    let user1 = await transaction.create(view_many_model_1.User);
    let user2 = await transaction.create(view_many_model_1.User);
    await userList.users.set([user1, user2]);
    assert.equal(userList.userCount, 2, '(0) Rules');
    transaction.destroy();
    transaction = new index_1.Transaction();
    userList = await transaction.create(view_many_model_1.UserList, { external: true });
    user1 = await transaction.create(view_many_model_1.User);
    user2 = await transaction.create(view_many_model_1.User);
    await userList.users.add(user1);
    await userList.users.add(user2);
    let users = await userList.users.toArray();
    assert.equal(users.length, 2, 'Two users');
    assert.equal(userList.userCount, 2, '(1) Rules');
    await userList.users.remove(user2);
    users = await userList.users.toArray();
    assert.equal(users.length, 1, 'One user');
    assert.equal(userList.userCount, 1, '(2) Rules');
    let data = transaction.saveToJson();
    assert.equal(data.instances[2].data.users[0], user1.id, 'Model of view');
    transaction.destroy();
}
async function testRestore() {
    let transaction = new index_1.Transaction();
    let userList = await transaction.create(view_many_model_1.UserList, { external: true });
    let user1 = await transaction.create(view_many_model_1.User);
    let user2 = await transaction.create(view_many_model_1.User);
    await userList.users.add(user1);
    await userList.users.add(user2);
    let users = await userList.users.toArray();
    assert.equal(users.length, 2, '(1) Two users');
    let data = transaction.saveToJson();
    let idView = userList.uuid;
    transaction.destroy();
    transaction = new index_1.Transaction();
    await transaction.loadFromJson(data, false);
    userList = await transaction.findOne(view_many_model_1.UserList, { id: idView });
    users = await userList.users.toArray();
    assert.equal(users.length, 2, '(2) Two users');
}
async function testRemove() {
    let transaction = new index_1.Transaction();
    let userList = await transaction.create(view_many_model_1.UserList);
    let user = await transaction.create(view_many_model_1.User);
    await userList.users.add(user);
    let users = await userList.users.toArray();
    assert.equal(users.length, 1, '(1) One users');
    await user.remove();
    users = await userList.users.toArray();
    assert.equal(users.length, 0, '(2) No users');
    transaction.destroy();
    transaction = new index_1.Transaction();
    userList = await transaction.create(view_many_model_1.UserList, { external: true });
    user = await transaction.findOne(view_many_model_1.User, { id: 100 });
    await userList.users.add(user);
    users = await userList.users.toArray();
    assert.equal(users.length, 1, '(3) One users');
    await user.remove();
    users = await userList.users.toArray();
    assert.equal(users.length, 0, '(4) No users');
    transaction.destroy();
    transaction = new index_1.Transaction();
    userList = await transaction.create(view_many_model_1.UserList, { external: true });
    user = await transaction.findOne(view_many_model_1.User, { id: 100 });
    await userList.users.add(user);
    await userList.remove();
    user = await transaction.findOne(view_many_model_1.User, { id: 100 });
    assert.notEqual(user, null, 'User found');
    transaction.destroy();
}
describe('View Many Model Test', () => {
    before(function (done) {
        let dm = histria_utils_1.dbManager();
        dm.registerNameSpace('view-many', 'memory', { compositionsInParent: true });
        let store = dm.store('view-many');
        store.initNameSpace('view-many', {
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
    it('View of users test', function (done) {
        testCreate().then(function () {
            done();
        }).catch(function (ex) {
            done(ex);
        });
    });
    it('View of users test remove', function (done) {
        testRemove().then(function () {
            done();
        }).catch(function (ex) {
            done(ex);
        });
    });
    it('View of users test restore', function (done) {
        testRestore().then(function () {
            done();
        }).catch(function (ex) {
            done(ex);
        });
    });
});

//# sourceMappingURL=view-many.specs.js.map
