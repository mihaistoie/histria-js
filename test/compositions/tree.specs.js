"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const index_1 = require("../../index");
const compositions_model_1 = require("./model/compositions-model");
async function testCreate() {
    let transaction = new index_1.Transaction();
    let child01 = await transaction.create(compositions_model_1.Tree);
    let child02 = await transaction.create(compositions_model_1.Tree);
    let root01 = await transaction.create(compositions_model_1.Tree);
    let rootId = root01.id;
    await root01.leafs.add(child01);
    await root01.leafs.add(child02);
    let children = await root01.leafs.toArray();
    assert.equal(children.length, 2, 'Root has 2 children');
    let data1 = transaction.saveToJson();
    transaction.clear();
    await transaction.loadFromJson(data1, false);
    let data2 = transaction.saveToJson();
    assert.deepEqual(data1, data2, 'Restore test in restore');
    let root = await transaction.findOne(compositions_model_1.Tree, { id: rootId });
    children = await root.leafs.toArray();
    assert.equal(children.length, 2, 'Root has 2 children (2)');
    transaction.clear();
}
async function testLoad() {
    let transaction = new index_1.Transaction();
    let child01 = await transaction.load(compositions_model_1.Tree, { id: 102, parentId: 100 });
    let child02 = await transaction.load(compositions_model_1.Tree, { id: 101, parentId: 100 });
    let root01 = await transaction.load(compositions_model_1.Tree, { id: 100 });
    let children = await root01.leafs.toArray();
    assert.equal(children.length, 2, 'Root has 2 children');
    let data1 = transaction.saveToJson();
    transaction.clear();
    await transaction.loadFromJson(data1, false);
    let data2 = transaction.saveToJson();
    assert.deepEqual(data1, data2, 'Restore test in restore');
    let root = await transaction.findOne(compositions_model_1.Tree, { id: 100 });
    children = await root.leafs.toArray();
    assert.equal(children.length, 2, 'Root has 2 children (2)');
    transaction.clear();
}
async function testRestore() {
    let transaction = new index_1.Transaction();
    let child01 = await transaction.load(compositions_model_1.Tree, { id: 102, parentId: 100 });
    let child02 = await transaction.load(compositions_model_1.Tree, { id: 101, parentId: 100 });
    let root01 = await transaction.load(compositions_model_1.Tree, { id: 100 });
    let data1 = transaction.saveToJson();
    transaction.clear();
    await transaction.loadFromJson(data1, false);
    let data2 = transaction.saveToJson();
    assert.deepEqual(data1, data2, 'Restore test in restore');
    let root = await transaction.findOne(compositions_model_1.Tree, { id: 100 });
    let children = await root.leafs.toArray();
    assert.equal(children.length, 2, 'Root has 2 children (2)');
    transaction.clear();
}
describe('Tree, Composition', () => {
    it('Tree - create', function (done) {
        testCreate().then(function () {
            done();
        }).catch(function (ex) {
            done(ex);
        });
    });
    it('Tree - load', function (done) {
        testLoad().then(function () {
            done();
        }).catch(function (ex) {
            done(ex);
        });
    });
    it('Tree - restore', function (done) {
        testRestore().then(function () {
            done();
        }).catch(function (ex) {
            done(ex);
        });
    });
});
