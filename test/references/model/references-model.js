"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../../index");
const customer_1 = require("./customer");
var customer_2 = require("./customer");
exports.Customer = customer_2.Customer;
const department_1 = require("./department");
var department_2 = require("./department");
exports.Department = department_2.Department;
const employee_1 = require("./employee");
var employee_2 = require("./employee");
exports.Employee = employee_2.Employee;
const employee_address_1 = require("./employee-address");
var employee_address_2 = require("./employee-address");
exports.EmployeeAddress = employee_address_2.EmployeeAddress;
const order_1 = require("./order");
var order_2 = require("./order");
exports.Order = order_2.Order;
index_1.modelManager().registerClass(customer_1.Customer, customer_1.CUSTOMER_SCHEMA);
index_1.modelManager().registerClass(department_1.Department, department_1.DEPARTMENT_SCHEMA);
index_1.modelManager().registerClass(employee_1.Employee, employee_1.EMPLOYEE_SCHEMA);
index_1.modelManager().registerClass(employee_address_1.EmployeeAddress, employee_address_1.EMPLOYEEADDRESS_SCHEMA);
index_1.modelManager().registerClass(order_1.Order, order_1.ORDER_SCHEMA);

//# sourceMappingURL=references-model.js.map
