"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const model_model_1 = require("../model-model");
const index_1 = require("../../../index");
const VAT_TAX = 0.193;
class SalesOrderRules {
    static async netAmountChanged(so, eventInfo) {
        return SalesOrderRules.calculateVatAndAmont(so, eventInfo);
    }
    static async vatChanged(so, eventInfo) {
        if (eventInfo.isTriggeredBy('netAmount', so))
            return;
        let vat = so.vat.value;
        await so.netAmount.setValue(vat / VAT_TAX);
    }
    static async grossAmountChanged(so, eventInfo) {
        if (eventInfo.isTriggeredBy('netAmount', so))
            return;
        let ga = so.grossAmount.value;
        await so.netAmount.setValue(ga / (1 + VAT_TAX));
    }
    static async calculateVatAndAmont(so, eventInfo) {
        await so.setRuleCount(so.ruleCount + 1);
        await so.vat.setValue(so.netAmount.value * VAT_TAX);
        await so.grossAmount.setValue(so.netAmount.value + so.vat.value);
    }
}
__decorate([
    index_1.propChanged(model_model_1.SalesOrder, 'netAmount'),
    index_1.title(model_model_1.SalesOrder, 'netAmount => vat,  grossAmount')
], SalesOrderRules, "netAmountChanged", null);
__decorate([
    index_1.propChanged(model_model_1.SalesOrder, 'vat'),
    index_1.title(model_model_1.SalesOrder, 'vat => netAmount,  grossAmount')
], SalesOrderRules, "vatChanged", null);
__decorate([
    index_1.propChanged(model_model_1.SalesOrder, 'grossAmount'),
    index_1.title(model_model_1.SalesOrder, 'grossAmount => vat,  netAmount')
], SalesOrderRules, "grossAmountChanged", null);
exports.SalesOrderRules = SalesOrderRules;
