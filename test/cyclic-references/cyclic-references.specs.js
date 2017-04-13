"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const index_1 = require("../../index");
const cyclicreferences_model_1 = require("./model/cyclicreferences-model");
async function testCreate() {
    let transaction = new index_1.Transaction();
    let child01 = await transaction.create(cyclicreferences_model_1.Item);
    let child02 = await transaction.create(cyclicreferences_model_1.Item);
    let root01 = await transaction.create(cyclicreferences_model_1.Group);
    let rootId = root01.id;
    await root01.items.add(child01);
    await root01.items.add(child02);
    let children = await root01.items.toArray();
    assert.equal(children.length, 2, 'Root group  has 2 items');
    let data1 = transaction.saveToJson();
    transaction.clear();
    await transaction.loadFromJson(data1, false);
    let data2 = transaction.saveToJson();
    assert.deepEqual(data1, data2, 'Restore test in restore');
    let root = await transaction.findOne(cyclicreferences_model_1.Group, { id: rootId });
    children = await root.items.toArray();
    assert.equal(children.length, 2, 'Root group  has 2 items (2)');
    transaction.clear();
}
async function testLoad() {
    /*
        let transaction = new Transaction();
    
        let child01 = await transaction.load<Tree>(Tree, { id: 102, parentId: 100 });
        let child02 = await transaction.load<Tree>(Tree, { id: 101, parentId: 100 });
        let root01 = await transaction.load<Tree>(Tree, { id: 100 });
    
    
        let children = await root01.leafs.toArray();
    
        assert.equal(children.length, 2, 'Root has 2 children');
        let data1 = transaction.saveToJson();
        transaction.clear();
        await transaction.loadFromJson(data1, false);
        let data2 = transaction.saveToJson();
        assert.deepEqual(data1, data2, 'Restore test in restore');
    
        let root = await transaction.findOne<Tree>(Tree, { id: 100 })
        children = await root.leafs.toArray();
    
        assert.equal(children.length, 2, 'Root has 2 children (2)');
        transaction.clear();
    */
}
async function testRestore() {
    /*
        let transaction = new Transaction();
    
        let child01 = await transaction.load<Tree>(Tree, { id: 102, parentId: 100 });
        let child02 = await transaction.load<Tree>(Tree, { id: 101, parentId: 100 });
        let root01 = await transaction.load<Tree>(Tree, { id: 100 });
    
    
        let data1 = transaction.saveToJson();
        transaction.clear();
        await transaction.loadFromJson(data1, false);
        let data2 = transaction.saveToJson();
        assert.deepEqual(data1, data2, 'Restore test in restore');
    
        let root = await transaction.findOne<Tree>(Tree, { id: 100 })
        let children = await root.leafs.toArray();
    
        assert.equal(children.length, 2, 'Root has 2 children (2)');
        transaction.clear();
    */
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
