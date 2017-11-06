
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

        let dm: DbManager = dbManager();
        dm.registerNameSpace('view-avanced', 'memory', { compositionsInParent: true });
        let store = dm.store('view-avanced');
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
    it('View avanced - create', async () => {

        const transaction = new Transaction();
        let order = await transaction.create<VAOrder>(VAOrder);
        let orderId = order.id;
        let viewOfOrder = await transaction.create<VAOrderView>(VAOrderView);
        await viewOfOrder.setOrder(order);
        let item1 = await transaction.create<VAOrderItem>(VAOrderItem);
        let item2 = await transaction.create<VAOrderItem>(VAOrderItem);
        await order.items.add(item1);
        let item1Id = item1.id;
        let viewOfOrderItem = await transaction.findOne<VAOrderItemView>(VAOrderItemView, { orderItemId: item1Id });
        assert.notEqual(viewOfOrderItem, null, '(1) View of OrderItem found');

        // Restore transaction
        let data1 = transaction.saveToJson();
        transaction.clear();
        await transaction.loadFromJson(data1, false);
        let data2 = transaction.saveToJson();
        assert.deepEqual(data1, data2, 'Restore test 1');

        viewOfOrderItem = await transaction.findOne<VAOrderItemView>(VAOrderItemView, { orderItemId: item1Id });
        assert.notEqual(viewOfOrderItem, null, '(2) View of OrderItem found');

        // Remove orderItem
        order = await transaction.findOne<VAOrder>(VAOrder, { id: orderId });
        let items = await order.items.toArray();
        item1 = items[0];
        await item1.remove();

        viewOfOrderItem = await transaction.findOne<VAOrderItemView>(VAOrderItemView, { orderItemId: item1Id });
        assert.equal(viewOfOrderItem, null, '(1) View of OrderItem not found');


        item1 = await transaction.create<VAOrderItem>(VAOrderItem);
        item1Id = item1.id;
        await order.items.add(item1);
        viewOfOrderItem = await transaction.findOne<VAOrderItemView>(VAOrderItemView, { orderItemId: item1Id });
        assert.notEqual(viewOfOrderItem, null, '(3) View of OrderItem found');

        await order.items.remove(item1);

        viewOfOrderItem = await transaction.findOne<VAOrderItemView>(VAOrderItemView, { orderItemId: item1Id });
        assert.equal(viewOfOrderItem, null, '(2) View of OrderItem not found');


        transaction.destroy();

    });
});
