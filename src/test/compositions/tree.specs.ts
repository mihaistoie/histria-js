
import * as assert from 'assert';
import * as path from 'path';
import { Transaction, loadRules } from '../../index';
import { DbDriver, dbManager, DbManager, IStore } from 'histria-utils';

import { Tree } from './model/compositions-model';

async function testCreate(): Promise<void> {
    let transaction = new Transaction();
    let child01 = await transaction.create<Tree>(Tree);
    let child02 = await transaction.create<Tree>(Tree);
    let root01 = await transaction.create<Tree>(Tree);
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

    let root = await transaction.findOne<Tree>(Tree, { id: rootId })
    children = await root.leafs.toArray();

    assert.equal(children.length, 2, 'Root has 2 children (2)');
    transaction.clear();
}


async function testLoad(): Promise<void> {
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
}


async function testRestore(): Promise<void> {
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

}


describe('Tree, Composition', () => {
    it('Tree - create', function (done) {
        testCreate().then(function () {
            done();
        }).catch(function (ex) {
            done(ex);
        })


    });
    it('Tree - load', function (done) {
        testLoad().then(function () {
            done();
        }).catch(function (ex) {
            done(ex);
        })


    });
    it('Tree - restore', function (done) {
        testRestore().then(function () {
            done();
        }).catch(function (ex) {
            done(ex);
        })

    });

});
