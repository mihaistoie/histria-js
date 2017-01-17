import { Order } from '../order';
import { OrderItem } from '../orderitem';
import { propChanged, addItem, rmvItem, setItems, init, title, validate } from '../../../../src/index';


export class OrderRules {
    @propChanged(Order, 'items.amount')
    static async itemAmountChanged(order: Order, item: OrderItem, eventInfo: any, newValue: number, oldvalue: number): Promise<void> {
        let total = await order.totalAmount.value();
        await order.totalAmount.value(total - oldvalue + newValue);
    }
    @addItem(Order, 'items')
    static async afterAddItem(order: Order, eventInfo: any, item: OrderItem): Promise<void> {
        let total = await order.totalAmount.value() + await item.amount.value();
        await order.totalAmount.value(total);
    }
    @rmvItem(Order, 'items')
    static async afterRmvItem(order: Order, eventInfo: any, item: OrderItem): Promise<void> {
        let total = await order.totalAmount.value() - await item.amount.value();
        await order.totalAmount.value(total);
    }
    @setItems(Order, 'items')
    static async aftersetItems(order: Order, eventInfo: any): Promise<void> {
        let items = await order.items.toArray();
        let total = 0;
        for (let item of items)
            total = total + await item.amount.value();
        await order.totalAmount.value(total);
    }
}


export var test = 1;