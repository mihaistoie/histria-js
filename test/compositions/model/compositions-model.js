"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../../index");
const car_1 = require("./car");
var car_2 = require("./car");
exports.Car = car_2.Car;
const engine_1 = require("./engine");
var engine_2 = require("./engine");
exports.Engine = engine_2.Engine;
const order_1 = require("./order");
var order_2 = require("./order");
exports.Order = order_2.Order;
const order_item_1 = require("./order-item");
var order_item_2 = require("./order-item");
exports.OrderItem = order_item_2.OrderItem;
const tree_1 = require("./tree");
var tree_2 = require("./tree");
exports.Tree = tree_2.Tree;
index_1.modelManager().registerClass(car_1.Car, car_1.CAR_SCHEMA);
index_1.modelManager().registerClass(engine_1.Engine, engine_1.ENGINE_SCHEMA);
index_1.modelManager().registerClass(order_1.Order, order_1.ORDER_SCHEMA);
index_1.modelManager().registerClass(order_item_1.OrderItem, order_item_1.ORDERITEM_SCHEMA);
index_1.modelManager().registerClass(tree_1.Tree, tree_1.TREE_SCHEMA);

//# sourceMappingURL=compositions-model.js.map
