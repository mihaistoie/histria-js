import { modelManager } from '../../../index';

import { Car, CAR_SCHEMA } from './car';
export { Car } from './car';
import { Engine, ENGINE_SCHEMA } from './engine';
export { Engine } from './engine';
import { Order, ORDER_SCHEMA } from './order';
export { Order } from './order';
import { OrderItem, ORDERITEM_SCHEMA } from './order-item';
export { OrderItem } from './order-item';
import { Tree, TREE_SCHEMA } from './tree';
export { Tree } from './tree';
modelManager().registerClass(Car, CAR_SCHEMA);
modelManager().registerClass(Engine, ENGINE_SCHEMA);
modelManager().registerClass(Order, ORDER_SCHEMA);
modelManager().registerClass(OrderItem, ORDERITEM_SCHEMA);
modelManager().registerClass(Tree, TREE_SCHEMA);