"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const index_1 = require("../../index");
const cyclicreferences_model_1 = require("./model/cyclicreferences-model");
async function testCreate() {
    const transaction = new index_1.Transaction();
    const child01 = await transaction.create(cyclicreferences_model_1.Item);
    const child02 = await transaction.create(cyclicreferences_model_1.Item);
    const rootGroup = await transaction.create(cyclicreferences_model_1.Group);
    const group = await transaction.create(cyclicreferences_model_1.Group);
    const item02 = await transaction.create(cyclicreferences_model_1.Item);
    const rootId = rootGroup.id;
    await rootGroup.items.add(child01);
    await rootGroup.items.add(child02);
    await child02.groups.add(group);
    await group.items.add(item02);
    let children = await rootGroup.items.toArray();
    assert.equal(children.length, 2, 'Root group  has 2 items');
    const data1 = transaction.saveToJson();
    transaction.clear();
    await transaction.loadFromJson(data1, false);
    const data2 = transaction.saveToJson();
    assert.deepEqual(data1, data2, 'Restore test in restore');
    const root = await transaction.findOne(cyclicreferences_model_1.Group, { id: rootId });
    children = await root.items.toArray();
    assert.equal(children.length, 2, 'Root group  has 2 items (2)');
    transaction.clear();
}
describe('Cyclic References', () => {
    it('Cyclic References - Basic tests', (done) => {
        testCreate().then(() => {
            done();
        }).catch((ex) => {
            done(ex);
        });
    });
});

//# sourceMappingURL=cyclic-references.specs.js.map
