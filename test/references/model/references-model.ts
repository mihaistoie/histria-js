import {modelManager} from '../../../src/index';

import {Customer, CUSTOMER_SCHEMA} from './customer';
export {Customer} from './customer';
import {Department, DEPARTMENT_SCHEMA} from './department';
export {Department} from './department';
import {Employee, EMPLOYEE_SCHEMA} from './employee';
export {Employee} from './employee';
import {EmployeeAddress, EMPLOYEEADDRESS_SCHEMA} from './employee-address';
export {EmployeeAddress} from './employee-address';
import {Order, ORDER_SCHEMA} from './order';
export {Order} from './order';
modelManager().registerClass(Customer, CUSTOMER_SCHEMA);
modelManager().registerClass(Department, DEPARTMENT_SCHEMA);
modelManager().registerClass(Employee, EMPLOYEE_SCHEMA);
modelManager().registerClass(EmployeeAddress, EMPLOYEEADDRESS_SCHEMA);
modelManager().registerClass(Order, ORDER_SCHEMA);