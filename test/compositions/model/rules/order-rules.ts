import { Order } from '../order';
import { OrderItem } from '../orderitem';
import { propChanged, init, title, validate } from '../../../../src/index';


export class OrderRules {
    @propChanged(Order, 'items.amount')
    static async afterAmountChanged(order: Order, item: OrderItem, eventInfo: any, newValue: number, oldvalue: number): Promise<void> {
        let total = await order.totalAmount.value();
        await order.totalAmount.value(total - oldvalue +  newValue);
    }
}


export var test = 1;