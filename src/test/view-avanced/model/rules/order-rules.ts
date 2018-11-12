import { VAOrder, VAOrderItem } from '../view-avanced-model';
import { propChanged, addItem, rmvItem, setItems, init, title, validate } from '../../../../index';

export class OrderRules {
    @propChanged(VAOrder, 'items.amount')
    public static async itemAmountChanged(order: VAOrder, item: VAOrderItem, eventInfo: any, newValue: number, oldvalue: number): Promise<void> {
        await order.totalAmount.setValue(order.totalAmount.value - oldvalue + newValue);

    }
    @addItem(VAOrder, 'items')
    public static async afterAddItem(order: VAOrder, eventInfo: any, item: VAOrderItem): Promise<void> {
        await order.totalAmount.setValue(order.totalAmount.value + item.amount.value);
    }
    @rmvItem(VAOrder, 'items')
    public static async afterRmvItem(order: VAOrder, eventInfo: any, item: VAOrderItem): Promise<void> {
        await order.totalAmount.setValue(order.totalAmount.value - item.amount.value);
    }
    @setItems(VAOrder, 'items')
    public static async aftersetItems(order: VAOrder, eventInfo: any): Promise<void> {
        const items = await order.items.toArray();
        let total = 0;
        for (const item of items)
            total = total + await item.amount.value;
        await order.totalAmount.setValue(total);
    }
    @init(VAOrderItem)
    public static async initOrderItem(oi: VAOrderItem, eventInfo: any): Promise<void> {
        if (!oi.isNew) {
            await oi.setLoaded(true);
        }
    }
}
