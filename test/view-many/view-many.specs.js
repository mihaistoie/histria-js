"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const path = require("path");
const index_1 = require("../../index");
const view_many_model_1 = require("./view-many-model");
const histria_utils_1 = require("histria-utils");
async function testCreate() {
    let transaction = new index_1.Transaction();
    let userList = await transaction.create(view_many_model_1.UserList);
    let user1 = await transaction.create(view_many_model_1.User);
    let user2 = await transaction.create(view_many_model_1.User);
    await userList.users.set([user1, user2]);
    assert.equal(userList.userCount, 2, '(0) Rules');
    transaction.destroy();
    transaction = new index_1.Transaction();
    userList = await transaction.create(view_many_model_1.UserList);
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
    transaction.destroy();
    /*
    let transaction = new Transaction();
    let userDetail = await transaction.create<UserDetail>(UserDetail);
    let user1 = await transaction.findOne<User>(User, { id: 101 });
    let user2 = await transaction.findOne<User>(User, { id: 101 });
    let user3 = await transaction.findOne<User>(User, { id: 101 }, { onlyInCache: true });
    assert.equal(user1, user2, 'Same User (1)');
    assert.equal(user1, user3, 'Same User (2)');


    let user = await transaction.create<User>(User);
    await userDetail.setUser(user);
    await user.setFirstName('John');

    assert.equal(userDetail.fullName, 'John', 'After user name changed');
    await user.setLastName('Doe');

    assert.equal(userDetail.fullName, 'John DOE', 'After  name and lastName changed');

    await userDetail.setUser(null);
    assert.equal(userDetail.fullName, '', 'User is null');

    await userDetail.setUser(user);
    assert.equal(userDetail.fullName, 'John DOE', 'User is not null');

    let det = await transaction.load<UserDetail>(UserDetail, { id: 10, userId: 101 });
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
    let cuser = await transaction.findOne<User>(User, { id: userId })
    let duser = await transaction.findOne<UserDetail>(UserDetail, { id: userDetId })

    assert.equal(!!cuser, true, 'User found');
    assert.equal(!!duser, true, 'User Detail found');
    user1 = await transaction.findOne<User>(User, { id: 101 });

    await user1.setLastName('Doe');
    assert.equal(duser.fullName, 'John DOE', 'User suser.user is loaded after transection restore');


    transaction.destroy();
    */
}
async function testRestore() {
    let transaction = new index_1.Transaction();
    let userList = await transaction.create(view_many_model_1.UserList);
    let user1 = await transaction.create(view_many_model_1.User);
    let user2 = await transaction.create(view_many_model_1.User);
    await userList.users.add(user1);
    await userList.users.add(user2);
    let users = await userList.users.toArray();
    assert.equal(users.length, 2, '(1) Two users');
    let data = transaction.saveToJson();
    transaction.destroy();
    transaction = new index_1.Transaction();
    await transaction.loadFromJson(data, false);
    users = await userList.users.toArray();
    assert.equal(users.length, 2, '(2) Two users');
}
async function testRemove() {
    /*
    let transaction = new Transaction();
    let userDetail = await transaction.create<UserDetail>(UserDetail);
    let user = await transaction.create<User>(User);
    await userDetail.setUser(user);
    assert.notEqual(await userDetail.user(), null, '(1) User is not null');

    await user.remove();
    assert.equal(await userDetail.user(), null, '(1) User is null');
    transaction.destroy();

    transaction = new Transaction();
    userDetail = await transaction.create<UserDetail>(UserDetail);
    user = await transaction.findOne<User>(User, { id: 100 })
    await userDetail.setUser(user);
    assert.notEqual(await userDetail.user(), null, '(2) User is not null');

    await user.remove();
    assert.equal(await userDetail.user(), null, '(2) User is null');
    transaction.destroy();

    // remove view
    */
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
        // testRestore().then(function () {
        //     done();
        // }).catch(function (ex) {
        //     done(ex);
        // })
        done();
    });
});
