import { Order } from '../references-model';
import { propChanged, init, title, validate } from '../../../../index';

export class OrderRules {
    @propChanged(Order, 'customer')
    public static async afterCustomerChanged(order: Order, eventInfo: any): Promise<void> {
        const customer = await order.customer();
        if (customer)
            await order.setCustomerStatus('not null');
        else
            await order.setCustomerStatus('null');
    }
}
