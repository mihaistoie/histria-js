"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../../index");
const sales_order_1 = require("./sales-order");
var sales_order_2 = require("./sales-order");
exports.SalesOrder = sales_order_2.SalesOrder;
const user_1 = require("./user");
var user_2 = require("./user");
exports.User = user_2.User;
index_1.modelManager().registerClass(sales_order_1.SalesOrder, sales_order_1.SALESORDER_SCHEMA);
index_1.modelManager().registerClass(user_1.User, user_1.USER_SCHEMA);

//# sourceMappingURL=salesorder-model.js.map
