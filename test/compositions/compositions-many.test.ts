
import * as assert from 'assert';
import * as path from 'path';
import * as mochaUtils from 'mocha';
import { Transaction, loadRules } from '../../src/index';

import { Order } from './model/order';
import { OrderItem } from './model/orderItem';
import { test as test1 } from './model/rules/order-rules';

async function testCreate(): Promise<void> {
    let transaction = new Transaction();
    let order = await transaction.create<Order>(Order);
    let item1 = await transaction.create<OrderItem>(OrderItem);
    let item2 = await transaction.create<OrderItem>(OrderItem);
    await order.items.add(item1);
    let parent = await item1.order();
    assert.equal(order, parent, '(1) Owner of orderItem1 is order');
    assert.equal(await item1.orderId, order.uuid, '(2) Owner of orderItem1 is order');
    let children = await order.items.toArray();
    assert.deepEqual(children.map(ii => { return ii.uuid }), [item1.uuid], '(3) Owner of orderItem1 is order');

    await item2.order(order);
    children = await order.items.toArray();

    assert.equal(children.length, 2, '(1) Order has 2 items');
    assert.deepEqual(children.map(ii => ii.uuid), [item1.uuid, item2.uuid], '(2) Order has 2 items');

    await item1.order(null);
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

}

async function testRules(): Promise<void> {
    let transaction = new Transaction();
    let order = await transaction.create<Order>(Order);
    let item1 = await transaction.create<OrderItem>(OrderItem);
    let item2 = await transaction.create<OrderItem>(OrderItem);
    await order.items.add(item1);
    await order.items.add(item2);

    await item1.amount.value(10);
    assert.equal(await order.totalAmount.value(), 10, 'Total amount  = 10');
    await item2.amount.value(10);
    assert.equal(await order.totalAmount.value(), 20, 'Total amount  = 20');
    await item1.amount.value(5);
    assert.equal(await order.totalAmount.value(), 15, 'Total amount  = 15');
    await order.items.remove(item2);
    assert.equal(await order.totalAmount.value(), 5, 'Total amount  = 5');
    await item1.order(null);
    assert.equal(await order.totalAmount.value(), 0, 'Total amount  = 0');
    await order.items.set([item1, item2]);
    assert.equal(await order.totalAmount.value(), 15, 'Total amount  = 15');


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
    it('One to many - rules', function (done) {
        testRules().then(function () {
            done();
        }).catch(function (ex) {
            done(ex);
        })


    });

    it('One to one Many - states errors', function (done) {
        done();

    });


});
