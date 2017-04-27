"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const index_1 = require("../../index");
const cyclicreferences_model_1 = require("./model/cyclicreferences-model");
async function testCreate() {
    let transaction = new index_1.Transaction();
    let child01 = await transaction.create(cyclicreferences_model_1.Item);
    let child02 = await transaction.create(cyclicreferences_model_1.Item);
    let rootGroup = await transaction.create(cyclicreferences_model_1.Group);
    let group = await transaction.create(cyclicreferences_model_1.Group);
    let item02 = await transaction.create(cyclicreferences_model_1.Item);
    let rootId = rootGroup.id;
    await rootGroup.items.add(child01);
    await rootGroup.items.add(child02);
    await child02.groups.add(group);
    await group.items.add(item02);
    let children = await rootGroup.items.toArray();
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
describe('Cyclic References', () => {
    it('Cyclic References - Basic tests', function (done) {
        testCreate().then(function () {
            done();
        }).catch(function (ex) {
            done(ex);
        });
    });
});