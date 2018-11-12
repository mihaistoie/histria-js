"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const view_avanced_model_1 = require("../view-avanced-model");
const index_1 = require("../../../../index");
class OrderRules {
    static async itemAmountChanged(order, item, eventInfo, newValue, oldvalue) {
        await order.totalAmount.setValue(order.totalAmount.value - oldvalue + newValue);
    }
    static async afterAddItem(order, eventInfo, item) {
        await order.totalAmount.setValue(order.totalAmount.value + item.amount.value);
    }
    static async afterRmvItem(order, eventInfo, item) {
        await order.totalAmount.setValue(order.totalAmount.value - item.amount.value);
    }
    static async aftersetItems(order, eventInfo) {
        const items = await order.items.toArray();
        let total = 0;
        for (const item of items)
            total = total + await item.amount.value;
        await order.totalAmount.setValue(total);
    }
    static async initOrderItem(oi, eventInfo) {
        if (!oi.isNew) {
            await oi.setLoaded(true);
        }
    }
}
__decorate([
    index_1.propChanged(view_avanced_model_1.VAOrder, 'items.amount')
], OrderRules, "itemAmountChanged", null);
__decorate([
    index_1.addItem(view_avanced_model_1.VAOrder, 'items')
], OrderRules, "afterAddItem", null);
__decorate([
    index_1.rmvItem(view_avanced_model_1.VAOrder, 'items')
], OrderRules, "afterRmvItem", null);
__decorate([
    index_1.setItems(view_avanced_model_1.VAOrder, 'items')
], OrderRules, "aftersetItems", null);
__decorate([
    index_1.init(view_avanced_model_1.VAOrderItem)
], OrderRules, "initOrderItem", null);
exports.OrderRules = OrderRules;

//# sourceMappingURL=order-rules.js.map
