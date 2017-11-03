import { modelManager } from '../../../index';

import { VAOrder, VAORDER_SCHEMA } from './vaorder';
export { VAOrder } from './vaorder';
import { VAOrderItem, VAORDERITEM_SCHEMA } from './vaorder-item';
export { VAOrderItem } from './vaorder-item';
import { VAOrderView, VAORDERVIEW_SCHEMA } from './vaorder-view';
export { VAOrderView } from './vaorder-view';
import { VAOrderItemView, VAORDERITEMVIEW_SCHEMA } from './vaorder-item-view';
export { VAOrderItemView } from './vaorder-item-view';
modelManager().registerClass(VAOrder, VAORDER_SCHEMA);
modelManager().registerClass(VAOrderItem, VAORDERITEM_SCHEMA);
modelManager().registerClass(VAOrderView, VAORDERVIEW_SCHEMA);
modelManager().registerClass(VAOrderItemView, VAORDERITEMVIEW_SCHEMA);