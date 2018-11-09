"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const path = require("path");
const index_1 = require("../../index");
const persistence_query_model_1 = require("./persistence-query-model");
const histria_utils_1 = require("histria-utils");
async function testFindOne() {
    let transaction = new index_1.Transaction();
    let user = await transaction.findOne(persistence_query_model_1.User, { id: 100 });
    assert.notEqual(user, null, '(1) User Found');
    user = await transaction.findOne(persistence_query_model_1.User, { firstName: 'Joe' });
    assert.notEqual(user, null, '(2) User Found');
    await user.remove();
    user = await transaction.findOne(persistence_query_model_1.User, { id: 100 });
    assert.equal(user, null, '(1) User not found');
    user = await transaction.findOne(persistence_query_model_1.User, { firstName: 'Joe' });
    assert.equal(user, null, '(2) User not found');
    user = await transaction.findOne(persistence_query_model_1.User, { firstName: 'John' });
    await user.setFirstName('Jack');
    user = await transaction.findOne(persistence_query_model_1.User, { firstName: 'John' });
    assert.equal(user, null, '(3) User not found');
    user = await transaction.findOne(persistence_query_model_1.User, { firstName: 'Jack' });
    assert.notEqual(user, null, '(4) User Found');
    await user.remove();
    user = await transaction.findOne(persistence_query_model_1.User, { firstName: 'Jack' });
    assert.notEqual(user, null, 'Rule removing called : can\'t remove Jack');
    user = await transaction.findOne(persistence_query_model_1.User, { firstName: 'Albert' });
    assert.notEqual(user, null, '(5) User Found');
    await user.setFirstName('Jack');
    assert.equal(user.firstName, 'Albert', 'Rule editing called : can\'t modify Albert');
    transaction.destroy();
}
async function testFindMany() {
    let transaction = new index_1.Transaction();
    let users = await transaction.find(persistence_query_model_1.User, { id: 100 });
    assert.notEqual(users.length, 0, '(1) User Found');
    users = await transaction.find(persistence_query_model_1.User, { firstName: 'Joe' });
    assert.notEqual(users.length, 0, '(2) User Found');
    await users[0].remove();
    users = await transaction.find(persistence_query_model_1.User, { id: 100 });
    assert.equal(users.length, 0, '(1) User not found');
    users = await transaction.find(persistence_query_model_1.User, { firstName: 'Joe' });
    assert.equal(users.length, 0, '(2) User not found');
    users = await transaction.find(persistence_query_model_1.User, { firstName: 'John' });
    await users[0].setFirstName('Jack');
    users = await transaction.find(persistence_query_model_1.User, { firstName: 'John' });
    assert.equal(users.length, 0, '(3) User not found');
    users = await transaction.find(persistence_query_model_1.User, { firstName: 'Jack' });
    assert.notEqual(users.length, 0, '(4) User Found');
    transaction.destroy();
    transaction = new index_1.Transaction();
    users = await transaction.find(persistence_query_model_1.User, { firstName: 'Joe' });
    assert.equal(users.length, 1, '(5) User Found');
    await users[0].setFirstName('John');
    users = await transaction.find(persistence_query_model_1.User, { firstName: 'John' });
    assert.equal(users.length, 2, '(6) User Found');
    transaction.destroy();
}
describe('Persistence Test', () => {
    before(function (done) {
        let dm = histria_utils_1.dbManager();
        dm.registerNameSpace('persistence-query', 'memory', { compositionsInParent: true });
        let store = dm.store('persistence-query');
        store.initNameSpace('persistence-query', {
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
                },
                {
                    id: 103,
                    firstName: 'Albert',
                    lastName: 'Camus',
                }
            ]
        });
        index_1.loadRules(path.join(__dirname, 'rules')).then(() => {
            done();
        }).catch((ex) => {
            done(ex);
        });
    });
    it('Persistence Find One', function (done) {
        testFindOne().then(function () {
            done();
        }).catch(function (ex) {
            done(ex);
        });
    });
    it('Persistence Find Many', function (done) {
        testFindMany().then(function () {
            done();
        }).catch(function (ex) {
            done(ex);
        });
    });
});

//# sourceMappingURL=persistence-query.specs.js.map
