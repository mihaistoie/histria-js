"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const references_model_1 = require("../references-model");
const index_1 = require("../../../../index");
class OrderRules {
    static async afterCustomerChanged(order, eventInfo) {
        let customer = await order.customer();
        if (customer)
            await order.setCustomerStatus('not null');
        else
            await order.setCustomerStatus('null');
    }
}
__decorate([
    index_1.propChanged(references_model_1.Order, 'customer')
], OrderRules, "afterCustomerChanged", null);
exports.OrderRules = OrderRules;
