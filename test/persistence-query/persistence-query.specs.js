"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
const persistence_query_model_1 = require("./persistence-query-model");
const histria_utils_1 = require("histria-utils");
async function testFindOne() {
    let transaction = new index_1.Transaction();
    let user1 = await transaction.create(persistence_query_model_1.User);
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
