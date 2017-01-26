
import * as assert from 'assert';
import * as path from 'path';
import * as mochaUtils from 'mocha';
import { Transaction, loadRules } from '../../src/index';

import { Order } from './model/order';
import { OrderItem } from './model/order-item';
import { test as test1 } from './model/rules/order-rules';

async function testCreate(): Promise<void> {
    let transaction = new Transaction();
    let order = await transaction.create<Order>(Order);
    let item1 = await transaction.create<OrderItem>(OrderItem);
    let item2 = await transaction.create<OrderItem>(OrderItem);
    await order.items.add(item1);
    let parent = await item1.order();
    assert.equal(order, parent, '(1) Owner of orderItem1 is order');
    assert.equal(item1.orderId, order.uuid, '(2) Owner of orderItem1 is order');
    let children = await order.items.toArray();
    assert.deepEqual(children.map(ii => { return ii.uuid }), [item1.uuid], '(3) Owner of orderItem1 is order');

    await item2.setOrder(order);
    children = await order.items.toArray();

    assert.equal(children.length, 2, '(1) Order has 2 items');
    assert.deepEqual(children.map(ii => ii.uuid), [item1.uuid, item2.uuid], '(2) Order has 2 items');

    await item1.setOrder(null);
    children = await order.items.toArray();
    assert.deepEqual(children.map(ii => ii.uuid), [item2.uuid], '(1) Order has 1 items');

    await order.items.add(item1, 0);
    children = await order.items.toArray();
    assert.equal(children.length, 2, '(1) Order has 2 items');
    assert.deepEqual(children.map(ii => ii.uuid), [item1.uuid, item2.uuid], '(2) Order has 2 items');

    await order.items.remove(item2)
    children = await order.items.toArray();
    assert.equal(children.length, 1, '(4) Order has 1 items');
    assert.deepEqual(children.map(ii => ii.uuid), [item1.uuid], '(5) Order has 1 items');
    assert.equal(await item2.order(), null, '(6) Parent is null');


}


async function testLoad(): Promise<void> {
    let transaction = new Transaction();

    let order = await transaction.create<Order>(Order);
    let item1 = await transaction.load<OrderItem>(OrderItem, { orderId: order.uuid });
    let item2 = await transaction.load<OrderItem>(OrderItem, { orderId: order.uuid });
    let children = await order.items.toArray();
    assert.equal(children.length, 2, '(1) Order has 2 items');
    assert.deepEqual(children.map(ii => ii.uuid).sort(), [item1.uuid, item2.uuid].sort(), '(2) Order has 2 items');

    let order2 = await transaction.load<Order>(Order, { id: 101, items: [{ id: 1, amount: 0 }, { id: 2, amount: 0 }, { id: 3, amount: 0 }] });
    let children2 = await order2.items.toArray();

    assert.equal(children2.length, 3, 'Order has 3 items');
    let oi2 = await transaction.findOne<OrderItem>(OrderItem, { id: 2 });


    assert.equal(oi2.orderId, order2.id, 'item.orderId === order.id');
    assert.equal(children2[1], oi2, 'order.items[1] == oi');
    let i = 0
    order2.enumChildren(children => {
        i++;
    });
    assert.equal(i, 3, 'Order has 3 children');

    assert.equal(children2[0].loaded, true, '(1)Init rule called');
    assert.equal(children2[1].loaded, true, '(2) Init rule called');
    assert.equal(children2[2].loaded, true, '(3)Init rule called');


}


async function testRestore(): Promise<void> {
    let transaction1 = new Transaction();
    let order1 = await transaction1.load<Order>(Order, { id: 101, totalAmount: 0, items: [{ id: 1, amount: 0 }, { id: 2, amount: 0 }, { id: 3, amount: 0 }] });
    let children1 = await order1.items.toArray();
    assert.equal(children1[1].loaded, true, '(1) Loaded = true Init rule called');
    await children1[1].setLoaded(false);
    assert.equal(children1[1].loaded, false, '(1) Loaded = false');
    
    await children1[2].amount.setValue(10);
    assert.equal(order1.totalAmount.value, 10, '(1) Rule called');

    let saved = JSON.parse(JSON.stringify(order1.model()));

    let transaction2 = new Transaction();
    let order2 = await transaction1.restore<Order>(Order, saved);
    let children2 = await order2.items.toArray();

    assert.equal(children2.length, 3, 'Order has 3 items');
    assert.equal(children2[1].loaded, false, '(2) Loaded = false');
    await children2[0].amount.setValue(10);
    assert.equal(order2.totalAmount.value, 20, '(2) Rule called');

}

async function testRules(): Promise<void> {
    let transaction = new Transaction();
    let order = await transaction.create<Order>(Order);
    let item1 = await transaction.create<OrderItem>(OrderItem);
    let item2 = await transaction.create<OrderItem>(OrderItem);
    await order.items.add(item1);
    await order.items.add(item2);
    await item1.amount.setValue(10);
    assert.equal(order.totalAmount.value, 10, 'Total amount  = 10');
    await item2.amount.setValue(10);
    assert.equal(order.totalAmount.value, 20, 'Total amount  = 20');
    await item1.amount.setValue(5);
    assert.equal(order.totalAmount.value, 15, 'Total amount  = 15');
    await order.items.remove(item2);
    assert.equal(order.totalAmount.value, 5, 'Total amount  = 5');
    await item1.setOrder(null);
    assert.equal(order.totalAmount.value, 0, 'Total amount  = 0');
    await order.items.set([item1, item2]);
    assert.equal(order.totalAmount.value, 15, 'Total amount  = 15');
}


describe('Relation One to many, Composition', () => {
    before(function (done) {
        assert.equal(test1, 1);
        loadRules(path.join(__dirname, 'model', 'rules')).then(() => {
            done();
        }).catch((ex) => {
            done(ex);
        });

    });
    it('One to many composition - create', function (done) {
        testCreate().then(function () {
            done();
        }).catch(function (ex) {
            done(ex);
        })


    });
    it('One to many composition - load', function (done) {
        testLoad().then(function () {
            done();
        }).catch(function (ex) {
            done(ex);
        })


    });
    it('One to many composition - rules', function (done) {
        testRules().then(function () {
            done();
        }).catch(function (ex) {
            done(ex);
        })


    });

    it('One to one Many composition - restore', function (done) {
        testRestore().then(function () {
            done();
        }).catch(function (ex) {
            done(ex);
        })

    });


    it('One to one Many composition - states errors', function (done) {
        done();

    });


});
