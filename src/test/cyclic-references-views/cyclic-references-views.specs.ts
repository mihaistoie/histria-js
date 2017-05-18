
import * as assert from 'assert';
import * as path from 'path';
import { Transaction, loadRules } from '../../index';
import { DbDriver, dbManager, DbManager, IStore } from 'histria-utils';

import { Item, Group } from './model/cyclicreferencesviews-model';

async function testCreate(): Promise<void> {
    let transaction = new Transaction();
    let child01 = await transaction.create<Item>(Item);
    let child02 = await transaction.create<Item>(Item);
    let rootGroup = await transaction.create<Group>(Group);
    let group = await transaction.create<Group>(Group);
    let item02 = await transaction.create<Item>(Item);
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

    let root = await transaction.findOne<Group>(Group, { id: rootId })
    children = await root.items.toArray();

    assert.equal(children.length, 2, 'Root group  has 2 items (2)');
    transaction.clear();
}



describe('Cyclic References Views', () => {
    it('Cyclic References - Basic tests', function (done) {
        testCreate().then(function () {
            done();
        }).catch(function (ex) {
            done(ex);
        })


    });
});
