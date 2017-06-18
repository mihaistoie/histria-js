import { modelManager } from '../../index';

import { CustomerView, CUSTOMERVIEW_SCHEMA } from './customer-view';
export { CustomerView } from './customer-view';
import { Customer, CUSTOMER_SCHEMA } from './customer';
export { Customer } from './customer';
modelManager().registerClass(CustomerView, CUSTOMERVIEW_SCHEMA);
modelManager().registerClass(Customer, CUSTOMER_SCHEMA);