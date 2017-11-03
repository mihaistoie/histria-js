"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const index_1 = require("../../index");
const histria_utils_1 = require("histria-utils");
const view_avanced_model_1 = require("./model/view-avanced-model");
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
        histria_utils_1.serialization.check(pattern1);
        let dm = histria_utils_1.dbManager();
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
        return index_1.loadRules(path.join(__dirname, 'model', 'rules'));
    });
    it('One to many composition - create', async () => {
        const transaction = new index_1.Transaction();
        let order = await transaction.create(view_avanced_model_1.VAOrder);
        console.log('order id = ' + order.id);
        let viewOfOrder = await transaction.create(view_avanced_model_1.VAOrderView);
        await viewOfOrder.setOrder(order);
        let item1 = await transaction.create(view_avanced_model_1.VAOrderItem);
        let item2 = await transaction.create(view_avanced_model_1.VAOrderItem);
        console.log('order item id = ' + item1.id);
        await order.items.add(item1);
        transaction.destroy();
    });
});
