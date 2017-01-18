import { Order } from '../order';
import { propChanged, init, title, validate } from '../../../../src/index';


export class OrderRules {
    @propChanged(Order, 'customer')
    static async afterCustomerChanged(order: Order, eventInfo: any): Promise<void> {
        let customer = await order.customer();
        if (customer)
            await order.setCustomerStatus('not null');
        else
            await order.setCustomerStatus('null');
    }
}
export var test = 1;