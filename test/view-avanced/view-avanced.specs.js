"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
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
    it('View avanced - create', async () => {
        const transaction = new index_1.Transaction();
        let order = await transaction.create(view_avanced_model_1.VAOrder);
        let orderId = order.id;
        let viewOfOrder = await transaction.create(view_avanced_model_1.VAOrderView);
        await viewOfOrder.setOrder(order);
        let item1 = await transaction.create(view_avanced_model_1.VAOrderItem);
        let item2 = await transaction.create(view_avanced_model_1.VAOrderItem);
        await order.items.add(item1);
        let item1Id = item1.id;
        let viewOfOrderItem = await transaction.findOne(view_avanced_model_1.VAOrderItemView, { orderItemId: item1Id });
        assert.notEqual(viewOfOrderItem, null, '(1) View of OrderItem found');
        // Restore transaction
        let data1 = transaction.saveToJson();
        transaction.clear();
        await transaction.loadFromJson(data1, false);
        let data2 = transaction.saveToJson();
        assert.deepEqual(data1, data2, 'Restore test 1');
        viewOfOrderItem = await transaction.findOne(view_avanced_model_1.VAOrderItemView, { orderItemId: item1Id });
        assert.notEqual(viewOfOrderItem, null, '(2) View of OrderItem found');
        // Remove orderItem
        order = await transaction.findOne(view_avanced_model_1.VAOrder, { id: orderId });
        let items = await order.items.toArray();
        item1 = items[0];
        await item1.remove();
        viewOfOrderItem = await transaction.findOne(view_avanced_model_1.VAOrderItemView, { orderItemId: item1Id });
        assert.equal(viewOfOrderItem, null, '(1) View of OrderItem not found');
        item1 = await transaction.create(view_avanced_model_1.VAOrderItem);
        item1Id = item1.id;
        await order.items.add(item1);
        viewOfOrderItem = await transaction.findOne(view_avanced_model_1.VAOrderItemView, { orderItemId: item1Id });
        assert.notEqual(viewOfOrderItem, null, '(3) View of OrderItem found');
        await order.items.remove(item1);
        viewOfOrderItem = await transaction.findOne(view_avanced_model_1.VAOrderItemView, { orderItemId: item1Id });
        assert.equal(viewOfOrderItem, null, '(2) View of OrderItem not found');
        transaction.destroy();
    });
});
