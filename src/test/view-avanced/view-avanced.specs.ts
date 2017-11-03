
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
    it('One to many composition - create', async () => {

        const transaction = new Transaction();
        let order = await transaction.create<VAOrder>(VAOrder);
        console.log('order id = ' + order.id)
        let viewOfOrder = await transaction.create<VAOrderView>(VAOrderView);
        await viewOfOrder.setOrder(order);
        let item1 = await transaction.create<VAOrderItem>(VAOrderItem);
        let item2 = await transaction.create<VAOrderItem>(VAOrderItem);
        console.log('order item id = ' + item1.id)
        await order.items.add(item1);
        transaction.destroy();

    });
});
