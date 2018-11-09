"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
const customer_view_1 = require("./customer-view");
var customer_view_2 = require("./customer-view");
exports.CustomerView = customer_view_2.CustomerView;
const customer_1 = require("./customer");
var customer_2 = require("./customer");
exports.Customer = customer_2.Customer;
index_1.modelManager().registerClass(customer_view_1.CustomerView, customer_view_1.CUSTOMERVIEW_SCHEMA);
index_1.modelManager().registerClass(customer_1.Customer, customer_1.CUSTOMER_SCHEMA);

//# sourceMappingURL=customer-view-sample-model.js.map
