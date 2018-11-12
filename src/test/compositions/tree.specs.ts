
import * as assert from 'assert';
import * as path from 'path';
import { Transaction, loadRules } from '../../index';
import { DbDriver, dbManager, DbManager, IStore } from 'histria-utils';

import { Tree } from './model/compositions-model';

async function testCreate(): Promise<void> {
    const transaction = new Transaction();
    const child01 = await transaction.create<Tree>(Tree);
    const child02 = await transaction.create<Tree>(Tree);
    const root01 = await transaction.create<Tree>(Tree);
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

    const root = await transaction.findOne<Tree>(Tree, { id: rootId });
    children = await root.leafs.toArray();

    assert.equal(children.length, 2, 'Root has 2 children (2)');
    transaction.clear();
}

async function testLoad(): Promise<void> {
    const transaction = new Transaction();

    const child01 = await transaction.load<Tree>(Tree, { id: 102, parentId: 100 });
    const child02 = await transaction.load<Tree>(Tree, { id: 101, parentId: 100 });
    const root01 = await transaction.load<Tree>(Tree, { id: 100 });

    let children = await root01.leafs.toArray();

    assert.equal(children.length, 2, 'Root has 2 children');
    const data1 = transaction.saveToJson();
    transaction.clear();
    await transaction.loadFromJson(data1, false);
    const data2 = transaction.saveToJson();
    assert.deepEqual(data1, data2, 'Restore test in restore');

    const root = await transaction.findOne<Tree>(Tree, { id: 100 });
    children = await root.leafs.toArray();

    assert.equal(children.length, 2, 'Root has 2 children (2)');
    transaction.clear();
}

async function testRestore(): Promise<void> {
    const transaction = new Transaction();

    const child01 = await transaction.load<Tree>(Tree, { id: 102, parentId: 100 });
    const child02 = await transaction.load<Tree>(Tree, { id: 101, parentId: 100 });
    const root01 = await transaction.load<Tree>(Tree, { id: 100 });

    const data1 = transaction.saveToJson();
    transaction.clear();
    await transaction.loadFromJson(data1, false);
    const data2 = transaction.saveToJson();
    assert.deepEqual(data1, data2, 'Restore test in restore');

    const root = await transaction.findOne<Tree>(Tree, { id: 100 });
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
