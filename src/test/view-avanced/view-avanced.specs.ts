
import * as assert from 'assert';
import * as path from 'path';
import { Transaction, loadRules, serializeInstance } from '../../index';
import { DbDriver, dbManager, DbManager, IStore, serialization } from 'histria-utils';

import { VAOrder, VAOrderItem, VAOrderView, VAOrderItemView } from './model/view-avanced-model';

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

describe('View Avanced', () => {
    before(() => {
        serialization.check(pattern1);

        const dm: DbManager = dbManager();
        dm.registerNameSpace('view-avanced', 'memory', { compositionsInParent: true });
        const store = dm.store('view-avanced');
        store.initNameSpace('view-avanced', {
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
    it('View avanced - autocreate - simple', async () => {

        const transaction = new Transaction();
        let order = await transaction.create<VAOrder>(VAOrder);
        const orderId = order.id;
        const viewOfOrder = await transaction.create<VAOrderView>(VAOrderView, { external: true });
        await viewOfOrder.setOrder(order);
        let item1 = await transaction.create<VAOrderItem>(VAOrderItem);
        await order.items.add(item1);
        let item1Id = item1.id;
        let viewOfOrderItem = await transaction.findOne<VAOrderItemView>(VAOrderItemView, { orderItemId: item1Id });
        assert.notEqual(viewOfOrderItem, null, '(1) View of OrderItem found');

        // Restore transaction
        const data1 = transaction.saveToJson();
        transaction.clear();
        await transaction.loadFromJson(data1, false);
        const data2 = transaction.saveToJson();
        assert.deepEqual(data1, data2, 'Restore test 1');

        viewOfOrderItem = await transaction.findOne<VAOrderItemView>(VAOrderItemView, { orderItemId: item1Id });
        assert.notEqual(viewOfOrderItem, null, '(2) View of OrderItem found');

        let list = await transaction.find<VAOrderItemView>(VAOrderItemView, {});
        assert.equal(list.length, 1, '(1) #VAOrderItemView === 1');

        // Remove orderItem
        order = await transaction.findOne<VAOrder>(VAOrder, { id: orderId });
        const items = await order.items.toArray();
        item1 = items[0];
        await item1.remove();

        viewOfOrderItem = await transaction.findOne<VAOrderItemView>(VAOrderItemView, { orderItemId: item1Id });
        assert.equal(viewOfOrderItem, null, '(1) View of OrderItem not found');

        list = await transaction.find<VAOrderItemView>(VAOrderItemView, {});
        assert.equal(list.length, 0, '(1) #VAOrderItemView === 0');

        item1 = await transaction.create<VAOrderItem>(VAOrderItem);
        item1Id = item1.id;
        await order.items.add(item1);
        viewOfOrderItem = await transaction.findOne<VAOrderItemView>(VAOrderItemView, { orderItemId: item1Id });
        assert.notEqual(viewOfOrderItem, null, '(3) View of OrderItem found');
        list = await transaction.find<VAOrderItemView>(VAOrderItemView, {});
        assert.equal(list.length, 1, '(2) #VAOrderItemView === 1');

        await order.items.remove(item1);

        viewOfOrderItem = await transaction.findOne<VAOrderItemView>(VAOrderItemView, { orderItemId: item1Id });
        assert.equal(viewOfOrderItem, null, '(2) View of OrderItem not found');

        list = await transaction.find<VAOrderItemView>(VAOrderItemView, {});
        assert.equal(list.length, 0, '(2) #VAOrderItemView === 0');

        transaction.destroy();

    });

    it('View avanced - autocreate - complex', async () => {

        const transaction = new Transaction();
        let order = await transaction.create<VAOrder>(VAOrder);
        const orderId = order.id;
        let viewOfOrder = await transaction.create<VAOrderView>(VAOrderView, { external: true });
        const viewOrderId = viewOfOrder.id;
        const item1 = await transaction.create<VAOrderItem>(VAOrderItem);
        const item2 = await transaction.create<VAOrderItem>(VAOrderItem);
        await order.items.add(item1);
        await order.items.add(item2);
        const item1Id = item1.id;
        await viewOfOrder.setOrder(order);

        const viewOfOrderItem = item1.viewOfMe<VAOrderItemView>(VAOrderItemView);
        assert.notEqual(viewOfOrderItem, null, '(1) View of OrderItem found');

        let list = await transaction.find<VAOrderItemView>(VAOrderItemView, {});
        assert.equal(list.length, 2, '(1) #VAOrderItemView === 2');

        const data1 = transaction.saveToJson();
        transaction.clear();
        await transaction.loadFromJson(data1, false);
        const data2 = transaction.saveToJson();
        assert.deepEqual(data1, data2, 'Restore test 1');

        list = await transaction.find<VAOrderItemView>(VAOrderItemView, {});
        assert.equal(list.length, 2, '(2) #VAOrderItemView === 2');

        viewOfOrder = await transaction.findOneInCache<VAOrderView>(VAOrderView, { id: viewOrderId });
        await viewOfOrder.setOrder(null);

        list = await transaction.find<VAOrderItemView>(VAOrderItemView, {});
        assert.equal(list.length, 0, '(3) #VAOrderItemView === 0');

        transaction.clear();
        await transaction.loadFromJson(data2, false);

        list = await transaction.find<VAOrderItemView>(VAOrderItemView, {});
        assert.equal(list.length, 2, '(4) #VAOrderItemView === 2');

        order = await transaction.findOneInCache<VAOrder>(VAOrder, { id: orderId });
        await order.remove();

        viewOfOrder = await transaction.findOneInCache<VAOrderView>(VAOrderView, { id: viewOrderId });
        order = await viewOfOrder.order();

        assert.equal(order, null, 'Order is null');

        list = await transaction.find<VAOrderItemView>(VAOrderItemView, {});
        assert.equal(list.length, 0, '(5) #VAOrderItemView === 0');

        transaction.destroy();

    });
    // TODO load from db view autocreate
    // TODO serialize view
});
