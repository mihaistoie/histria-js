"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const customer_view_sample_model_1 = require("../customer-view-sample-model");
const index_1 = require("../../../index");
class CustomerViewRules {
    static async customerNameChanged(viewOfCustomer, user, eventInfo) {
        await CustomerViewRules.updateFullName(viewOfCustomer, user);
    }
    static async customerChanged(viewOfCustomer, eventInfo, newValue, oldValue) {
        await CustomerViewRules.updateFullName(viewOfCustomer, newValue);
    }
    static async updateFullName(viewOfCustomer, customer) {
        if (customer) {
            let fn = customer.firstName;
            let ln = customer.lastName;
            let fullName = [];
            if (fn)
                fullName.push(fn);
            if (ln)
                fullName.push(ln.toUpperCase());
            await viewOfCustomer.setFullName(fullName.join(' '));
        }
        else {
            await viewOfCustomer.setFullName('');
        }
    }
}
__decorate([
    index_1.propChanged(customer_view_sample_model_1.CustomerView, 'customer.firstName', 'customer.lastName')
], CustomerViewRules, "customerNameChanged", null);
__decorate([
    index_1.propChanged(customer_view_sample_model_1.CustomerView, 'customer')
], CustomerViewRules, "customerChanged", null);
__decorate([
    index_1.title(customer_view_sample_model_1.CustomerView, 'Calculate:  FullName = FirstName + LastName')
], CustomerViewRules, "updateFullName", null);
exports.CustomerViewRules = CustomerViewRules;

//# sourceMappingURL=customer-view-rules.js.map
