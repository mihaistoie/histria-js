"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../../index");
const vaorder_1 = require("./vaorder");
var vaorder_2 = require("./vaorder");
exports.VAOrder = vaorder_2.VAOrder;
const vaorder_item_1 = require("./vaorder-item");
var vaorder_item_2 = require("./vaorder-item");
exports.VAOrderItem = vaorder_item_2.VAOrderItem;
const vaorder_view_1 = require("./vaorder-view");
var vaorder_view_2 = require("./vaorder-view");
exports.VAOrderView = vaorder_view_2.VAOrderView;
const vaorder_item_view_1 = require("./vaorder-item-view");
var vaorder_item_view_2 = require("./vaorder-item-view");
exports.VAOrderItemView = vaorder_item_view_2.VAOrderItemView;
index_1.modelManager().registerClass(vaorder_1.VAOrder, vaorder_1.VAORDER_SCHEMA);
index_1.modelManager().registerClass(vaorder_item_1.VAOrderItem, vaorder_item_1.VAORDERITEM_SCHEMA);
index_1.modelManager().registerClass(vaorder_view_1.VAOrderView, vaorder_view_1.VAORDERVIEW_SCHEMA);
index_1.modelManager().registerClass(vaorder_item_view_1.VAOrderItemView, vaorder_item_view_1.VAORDERITEMVIEW_SCHEMA);

//# sourceMappingURL=view-avanced-model.js.map
