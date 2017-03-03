"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const compositions_model_1 = require("../compositions-model");
const index_1 = require("../../../../index");
class OrderRules {
    static itemAmountChanged(order, item, eventInfo, newValue, oldvalue) {
        return __awaiter(this, void 0, void 0, function* () {
            yield order.totalAmount.setValue(order.totalAmount.value - oldvalue + newValue);
        });
    }
    static afterAddItem(order, eventInfo, item) {
        return __awaiter(this, void 0, void 0, function* () {
            yield order.totalAmount.setValue(order.totalAmount.value + item.amount.value);
        });
    }
    static afterRmvItem(order, eventInfo, item) {
        return __awaiter(this, void 0, void 0, function* () {
            yield order.totalAmount.setValue(order.totalAmount.value - item.amount.value);
        });
    }
    static aftersetItems(order, eventInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            let items = yield order.items.toArray();
            let total = 0;
            for (let item of items)
                total = total + (yield item.amount.value);
            yield order.totalAmount.setValue(total);
        });
    }
    static initOrderItem(oi, eventInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!oi.isNew) {
                yield oi.setLoaded(true);
            }
        });
    }
}
__decorate([
    index_1.propChanged(compositions_model_1.Order, 'items.amount')
], OrderRules, "itemAmountChanged", null);
__decorate([
    index_1.addItem(compositions_model_1.Order, 'items')
], OrderRules, "afterAddItem", null);
__decorate([
    index_1.rmvItem(compositions_model_1.Order, 'items')
], OrderRules, "afterRmvItem", null);
__decorate([
    index_1.setItems(compositions_model_1.Order, 'items')
], OrderRules, "aftersetItems", null);
__decorate([
    index_1.init(compositions_model_1.OrderItem)
], OrderRules, "initOrderItem", null);
exports.OrderRules = OrderRules;
exports.test = 1;
