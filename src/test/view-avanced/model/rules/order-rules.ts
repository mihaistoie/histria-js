import { VAOrder, VAOrderItem } from '../view-avanced-model';
import { propChanged, addItem, rmvItem, setItems, init, title, validate } from '../../../../index';



export class OrderRules {
    @propChanged(VAOrder, 'items.amount')
    static async itemAmountChanged(order: VAOrder, item: VAOrderItem, eventInfo: any, newValue: number, oldvalue: number): Promise<void> {
        await order.totalAmount.setValue(order.totalAmount.value - oldvalue + newValue);

    }
    @addItem(VAOrder, 'items')
    static async afterAddItem(order: VAOrder, eventInfo: any, item: VAOrderItem): Promise<void> {
        await order.totalAmount.setValue(order.totalAmount.value + item.amount.value);
    }
    @rmvItem(VAOrder, 'items')
    static async afterRmvItem(order: VAOrder, eventInfo: any, item: VAOrderItem): Promise<void> {
        await order.totalAmount.setValue(order.totalAmount.value - item.amount.value);
    }
    @setItems(VAOrder, 'items')
    static async aftersetItems(order: VAOrder, eventInfo: any): Promise<void> {
        let items = await order.items.toArray();
        let total = 0;
        for (let item of items)
            total = total + await item.amount.value;
        await order.totalAmount.setValue(total);
    }
    @init(VAOrderItem)
    static async initOrderItem(oi: VAOrderItem, eventInfo: any): Promise<void> {
        if (!oi.isNew) {
            await oi.setLoaded(true);
        }
    }
}
