
import * as assert from 'assert';
import * as path from 'path';
import { Transaction, loadRules } from '../../index';
import { DbDriver, dbManager, DbManager, IStore } from 'histria-utils';

import { Item, Group } from './model/cyclicreferences-model';

async function testCreate(): Promise<void> {
    const transaction = new Transaction();
    const child01 = await transaction.create<Item>(Item);
    const child02 = await transaction.create<Item>(Item);
    const rootGroup = await transaction.create<Group>(Group);
    const group = await transaction.create<Group>(Group);
    const item02 = await transaction.create<Item>(Item);
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

    const root = await transaction.findOne<Group>(Group, { id: rootId });
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
