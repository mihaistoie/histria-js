import { VAOrder, VAOrderItem, VAOrderView, VAOrderItemView } from '../view-avanced-model';
import { propChanged, addItem, rmvItem, setItems, init, title, validate } from '../../../../index';



export class OrderViewRules {
    @addItem(VAOrderView, 'order.items')
    static async afterAddItem(viewOfOrder: VAOrder, order: VAOrder, eventInfo: any,  item: VAOrderItem): Promise<void> {
        console.log(order.id)
        console.log(item.id)
        console.log('xxxxxxxxxxxxxxxxxxx')
    }
}
