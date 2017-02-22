import {modelManager} from '../../src/index';

import {SalesOrder, SALESORDER_SCHEMA} from './sales-order';
export {SalesOrder} from './sales-order';
import {User, USER_SCHEMA} from './user';
export {User} from './user';
modelManager().registerClass(SalesOrder, SALESORDER_SCHEMA);
modelManager().registerClass(User, USER_SCHEMA);