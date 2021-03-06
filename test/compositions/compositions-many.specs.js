"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const path = require("path");
const index_1 = require("../../index");
const histria_utils_1 = require("histria-utils");
const compositions_model_1 = require("./model/compositions-model");
async function testCreate() {
    const transaction = new index_1.Transaction();
    const order = await transaction.create(compositions_model_1.Order);
    const item1 = await transaction.create(compositions_model_1.OrderItem);
    const item2 = await transaction.create(compositions_model_1.OrderItem);
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
async function testLoad() {
    const transaction = new index_1.Transaction();
    const order = await transaction.create(compositions_model_1.Order);
    const item1 = await transaction.load(compositions_model_1.OrderItem, { orderId: order.uuid });
    const item2 = await transaction.load(compositions_model_1.OrderItem, { orderId: order.uuid });
    const children = await order.items.toArray();
    assert.equal(children.length, 2, '(1) Order has 2 items');
    assert.deepEqual(children.map(ii => ii.uuid).sort(), [item1.uuid, item2.uuid].sort(), '(2) Order has 2 items');
    const order2 = await transaction.load(compositions_model_1.Order, { id: 101, items: [{ id: 1, amount: 0 }, { id: 2, amount: 0 }, { id: 3, amount: 0 }] });
    const children2 = await order2.items.toArray();
    assert.equal(children2.length, 3, 'Order has 3 items');
    const oi2 = await transaction.findOne(compositions_model_1.OrderItem, { id: 2 });
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
async function testRestore() {
    const transaction = new index_1.Transaction();
    const order1 = await transaction.load(compositions_model_1.Order, { id: 101, totalAmount: 0, items: [{ id: 1, amount: 0 }, { id: 2, amount: 0 }, { id: 3, amount: 0 }] });
    const children1 = await order1.items.toArray();
    assert.equal(children1[1].loaded, true, '(1) Loaded = true Init rule called');
    await children1[1].setLoaded(false);
    assert.equal(children1[1].loaded, false, '(1) Loaded = false');
    await children1[2].amount.setValue(10);
    assert.equal(order1.totalAmount.value, 10, '(1) Rule called');
    const saved = JSON.parse(JSON.stringify(order1.model()));
    const transaction2 = new index_1.Transaction();
    const order2 = await transaction.restore(compositions_model_1.Order, saved, false);
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
async function testRules() {
    const transaction = new index_1.Transaction();
    const order = await transaction.create(compositions_model_1.Order);
    const item1 = await transaction.create(compositions_model_1.OrderItem);
    const item2 = await transaction.create(compositions_model_1.OrderItem);
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
    const o = await index_1.serializeInstance(order, pattern1);
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
async function testRemove() {
    let transaction = new index_1.Transaction();
    let order = await transaction.create(compositions_model_1.Order);
    let item1 = await transaction.create(compositions_model_1.OrderItem);
    let item2 = await transaction.create(compositions_model_1.OrderItem);
    await order.items.add(item1);
    await order.items.add(item2);
    await item2.remove();
    const items = await order.items.toArray();
    assert.equal(items.length, 1, 'Order has 1 item');
    transaction.destroy();
    transaction = new index_1.Transaction();
    order = await transaction.create(compositions_model_1.Order);
    item1 = await transaction.create(compositions_model_1.OrderItem);
    item2 = await transaction.create(compositions_model_1.OrderItem);
    const uuid = item1.id;
    await order.items.add(item1);
    await order.items.add(item2);
    await order.remove();
    const oi = await transaction.findOne(compositions_model_1.OrderItem, { id: uuid });
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
        histria_utils_1.serialization.check(pattern1);
        const dm = histria_utils_1.dbManager();
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
        return index_1.loadRules(path.join(__dirname, 'model', 'rules'));
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

//# sourceMappingURL=compositions-many.specs.js.map
