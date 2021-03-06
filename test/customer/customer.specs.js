"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const path = require("path");
const index_1 = require("../../index");
const customer_view_sample_model_1 = require("./customer-view-sample-model");
async function viewOfCustomerTest() {
    const transaction = new index_1.Transaction();
    const viewOfCustomer = await transaction.create(customer_view_sample_model_1.CustomerView);
    const customer = await transaction.create(customer_view_sample_model_1.Customer);
    await viewOfCustomer.setCustomer(customer);
    await customer.setFirstName('John');
    assert.equal(viewOfCustomer.fullName, 'John', 'After user name changed');
    await customer.setLastName('Doe');
    assert.equal(viewOfCustomer.fullName, 'John DOE', 'After  name and lastName changed');
    await viewOfCustomer.setCustomer(null);
    assert.equal(viewOfCustomer.fullName, '', 'User is null');
    transaction.destroy();
}
describe('View of Customer Model Test', () => {
    before((done) => {
        index_1.loadRules(path.join(__dirname, 'rules')).then(() => {
            done();
        }).catch((ex) => {
            done(ex);
        });
    });
    it('View of Customer test', (done) => {
        viewOfCustomerTest().then(() => {
            done();
        }).catch((ex) => {
            done(ex);
        });
    });
});

//# sourceMappingURL=customer.specs.js.map
