"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
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
    assert.notEqual(user, null, '(2) User Found');
    transaction.destroy();
}
async function testFindMany() {
    let transaction = new index_1.Transaction();
    let user1 = await transaction.create(persistence_query_model_1.User);
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
                }
            ]
        });
        done();
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
