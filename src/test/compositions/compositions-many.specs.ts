
import * as assert from 'assert';
import * as path from 'path';
import { Transaction, loadRules, serializeInstance } from '../../index';
import { DbDriver, dbManager, DbManager, IStore, serialization } from 'histria-utils';

import { Order, OrderItem } from './model/compositions-model';

async function testCreate(): Promise<void> {
    const transaction = new Transaction();
    const order = await transaction.create<Order>(Order);
    const item1 = await transaction.create<OrderItem>(OrderItem);
    const item2 = await transaction.create<OrderItem>(OrderItem);
    await order.items.add(item1);
    const parent = await item1.order();
    assert.equal(order, parent, '(1) Owner of orderItem1 is order');
    assert.equal(item1.orderId, order.uuid, '(2) Owner of orderItem1 is order');
    let children = await order.items.toArray();
    assert.deepEqual(children.map(ii => ii.uuid), [item1.uuid], '(3) Owner of orderItem1 is order');

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

    await order.items.remove(item2);
    children = await order.items.toArray();
    assert.equal(children.length, 1, '(4) Order has 1 items');
    assert.deepEqual(children.map(ii => ii.uuid), [item1.uuid], '(5) Order has 1 items');
    assert.equal(await item2.order(), null, '(6) Parent is null');

    const data1 = transaction.saveToJson();
    transaction.clear();
    await transaction.loadFromJson(data1, false);
    const data2 = transaction.saveToJson();
    assert.deepEqual(data1, data2, 'Restore test in create');
    transaction.destroy();
}

async function testLoad(): Promise<void> {
    const transaction = new Transaction();

    const order = await transaction.create<Order>(Order);
    const item1 = await transaction.load<OrderItem>(OrderItem, { orderId: order.uuid });
    const item2 = await transaction.load<OrderItem>(OrderItem, { orderId: order.uuid });
    const children = await order.items.toArray();
    assert.equal(children.length, 2, '(1) Order has 2 items');
    assert.deepEqual(children.map(ii => ii.uuid).sort(), [item1.uuid, item2.uuid].sort(), '(2) Order has 2 items');

    const order2 = await transaction.load<Order>(Order, { id: 101, items: [{ id: 1, amount: 0 }, { id: 2, amount: 0 }, { id: 3, amount: 0 }] });
    const children2 = await order2.items.toArray();

    assert.equal(children2.length, 3, 'Order has 3 items');
    const oi2 = await transaction.findOne<OrderItem>(OrderItem, { id: 2 });

    assert.equal(oi2.orderId, order2.id, 'item.orderId === order.id');
    assert.equal(children2[1], oi2, 'order.items[1] == oi');
    let i = 0;
    order2.enumChildren(ec => {
        i++;
    }, true);
    assert.equal(i, 3, 'Order has 3 children');

    assert.equal(children2[0].loaded, true, '(1)Init rule called');
    assert.equal(children2[1].loaded, true, '(2) Init rule called');
    assert.equal(children2[2].loaded, true, '(3)Init rule called');

    const data1 = transaction.saveToJson();
    transaction.clear();
    await transaction.loadFromJson(data1, false);
    const data2 = transaction.saveToJson();
    assert.deepEqual(data1, data2, 'Restore test in load');

    transaction.destroy();
}

async function testRestore(): Promise<void> {
    const transaction = new Transaction();
    const order1 = await transaction.load<Order>(Order, { id: 101, totalAmount: 0, items: [{ id: 1, amount: 0 }, { id: 2, amount: 0 }, { id: 3, amount: 0 }] });
    const children1 = await order1.items.toArray();
    assert.equal(children1[1].loaded, true, '(1) Loaded = true Init rule called');
    await children1[1].setLoaded(false);
    assert.equal(children1[1].loaded, false, '(1) Loaded = false');

    await children1[2].amount.setValue(10);
    assert.equal(order1.totalAmount.value, 10, '(1) Rule called');

    const saved = JSON.parse(JSON.stringify(order1.model()));

    const transaction2 = new Transaction();
    const order2 = await transaction.restore<Order>(Order, saved, false);
    const children2 = await order2.items.toArray();

    assert.equal(children2.length, 3, 'Order has 3 items');
    assert.equal(children2[1].loaded, false, '(2) Loaded = false');
    await children2[0].amount.setValue(10);
    assert.equal(order2.totalAmount.value, 20, '(2) Rule called');

    const data1 = transaction.saveToJson();
    transaction.clear();
    await transaction.loadFromJson(data1, false);
    const data2 = transaction.saveToJson();
    assert.deepEqual(data1, data2, 'Restore test in restore');

    transaction.destroy();

}

async function testRules(): Promise<void> {
    const transaction = new Transaction();
    const order = await transaction.create<Order>(Order);
    const item1 = await transaction.create<OrderItem>(OrderItem);
    const item2 = await transaction.create<OrderItem>(OrderItem);
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
    order.$states.totalAmount.isDisabled = true;

    const o = await serializeInstance(order, pattern1);
    const excepted = {
        id: order.id,
        totalAmount: 15,
        items: [
            { amount: 5, id: item1.id },
            { amount: 10, id: item2.id }
        ],
        $states: {
            totalAmount: {
                isDisabled: true
            }
        }

    };
    assert.deepEqual(o, excepted, 'Serialization rules 1');

    const data1 = transaction.saveToJson();
    transaction.clear();
    await transaction.loadFromJson(data1, false);
    const data2 = transaction.saveToJson();
    assert.deepEqual(data1, data2, 'Restore test in rules');

    transaction.destroy();
}

async function testRemove(): Promise<void> {
    let transaction = new Transaction();
    let order = await transaction.create<Order>(Order);
    let item1 = await transaction.create<OrderItem>(OrderItem);
    let item2 = await transaction.create<OrderItem>(OrderItem);
    await order.items.add(item1);
    await order.items.add(item2);
    await item2.remove();
    const items = await order.items.toArray();
    assert.equal(items.length, 1, 'Order has 1 item');
    transaction.destroy();

    transaction = new Transaction();
    order = await transaction.create<Order>(Order);
    item1 = await transaction.create<OrderItem>(OrderItem);
    item2 = await transaction.create<OrderItem>(OrderItem);
    const uuid = item1.id;
    await order.items.add(item1);
    await order.items.add(item2);
    await order.remove();

    const oi = await transaction.findOne<OrderItem>(OrderItem, { id: uuid });
    assert.equal(oi, null, 'Order item removed');

    transaction.destroy();
}

const pattern1 = {
    properties: [
        'totalAmount',
        {
            items: 'items',
            $ref: '#/definitions/orderitem'
        },
    ],
    definitions: {
        orderitem: {
            properties: [
                'amount'
            ]
        }
    }
};

describe('Relation One to many, Composition', () => {
    before(() => {
        serialization.check(pattern1);

        const dm: DbManager = dbManager();
        dm.registerNameSpace('compositions', 'memory', { compositionsInParent: true });
        const store = dm.store('compositions');
        store.initNameSpace('compositions', {
            order: [
                {
                    id: 1001,
                    totalAmount: 100,
                    items: [{
                        id: 2001,
                        amount: 50,
                        orderId: 1001,
                        loaded: true

                    },
                    {
                        id: 2002,
                        amount: 50,
                        orderId: 1001,
                        loaded: true

                    }
                    ]
                },
                {
                    id: 1002,
                    totalAmount: 100,
                    items: [{
                        id: 2003,
                        amount: 50,
                        orderId: 1002,
                        loaded: true

                    },
                    {
                        id: 2004,
                        amount: 50,
                        orderId: 1002,
                        loaded: true
                    }
                    ]
                },

            ]
        });
        return loadRules(path.join(__dirname, 'model', 'rules'));
    });
    it('One to many composition - create', () => {
        return testCreate();
    });
    it('One to many composition - load', () => {
        return testLoad();
    });
    it('One to many composition - rules', () => {
        return testRules();
    });

    it('One to one Many composition - restore', () => {
        return testRestore();
    });
    it('One to one Many composition - remove', () => {
        return testRemove();
    });
});
