"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const index_1 = require("../../index");
const compositions_model_1 = require("./model/compositions-model");
async function testCreate() {
    const transaction = new index_1.Transaction();
    const child01 = await transaction.create(compositions_model_1.Tree);
    const child02 = await transaction.create(compositions_model_1.Tree);
    const root01 = await transaction.create(compositions_model_1.Tree);
    const rootId = root01.id;
    await root01.leafs.add(child01);
    await root01.leafs.add(child02);
    let children = await root01.leafs.toArray();
    assert.equal(children.length, 2, 'Root has 2 children');
    const data1 = transaction.saveToJson();
    transaction.clear();
    await transaction.loadFromJson(data1, false);
    const data2 = transaction.saveToJson();
    assert.deepEqual(data1, data2, 'Restore test in restore');
    const root = await transaction.findOne(compositions_model_1.Tree, { id: rootId });
    children = await root.leafs.toArray();
    assert.equal(children.length, 2, 'Root has 2 children (2)');
    transaction.clear();
}
async function testLoad() {
    const transaction = new index_1.Transaction();
    const child01 = await transaction.load(compositions_model_1.Tree, { id: 102, parentId: 100 });
    const child02 = await transaction.load(compositions_model_1.Tree, { id: 101, parentId: 100 });
    const root01 = await transaction.load(compositions_model_1.Tree, { id: 100 });
    let children = await root01.leafs.toArray();
    assert.equal(children.length, 2, 'Root has 2 children');
    const data1 = transaction.saveToJson();
    transaction.clear();
    await transaction.loadFromJson(data1, false);
    const data2 = transaction.saveToJson();
    assert.deepEqual(data1, data2, 'Restore test in restore');
    const root = await transaction.findOne(compositions_model_1.Tree, { id: 100 });
    children = await root.leafs.toArray();
    assert.equal(children.length, 2, 'Root has 2 children (2)');
    transaction.clear();
}
async function testRestore() {
    const transaction = new index_1.Transaction();
    const child01 = await transaction.load(compositions_model_1.Tree, { id: 102, parentId: 100 });
    const child02 = await transaction.load(compositions_model_1.Tree, { id: 101, parentId: 100 });
    const root01 = await transaction.load(compositions_model_1.Tree, { id: 100 });
    const data1 = transaction.saveToJson();
    transaction.clear();
    await transaction.loadFromJson(data1, false);
    const data2 = transaction.saveToJson();
    assert.deepEqual(data1, data2, 'Restore test in restore');
    const root = await transaction.findOne(compositions_model_1.Tree, { id: 100 });
    const children = await root.leafs.toArray();
    assert.equal(children.length, 2, 'Root has 2 children (2)');
    transaction.clear();
}
describe('Tree, Composition', () => {
    it('Tree - create', (done) => {
        testCreate().then(() => {
            done();
        }).catch((ex) => {
            done(ex);
        });
    });
    it('Tree - load', (done) => {
        testLoad().then(() => {
            done();
        }).catch((ex) => {
            done(ex);
        });
    });
    it('Tree - restore', (done) => {
        testRestore().then(() => {
            done();
        }).catch((ex) => {
            done(ex);
        });
    });
});

//# sourceMappingURL=tree.specs.js.map
