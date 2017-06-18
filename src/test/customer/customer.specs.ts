
import * as assert from 'assert';
import * as path from 'path';
import * as mochaUtils from 'mocha';
import { Transaction, loadRules } from '../../index';
import { Customer, CustomerView } from './customer-view-sample-model';
import { DbDriver, dbManager, DbManager, IStore } from 'histria-utils';

async function viewOfCustomerTest(): Promise<void> {
    let transaction = new Transaction();
    let viewOfCustomer = await transaction.create<CustomerView>(CustomerView);
    let customer = await transaction.create<Customer>(Customer);
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
    before(function (done) {

        loadRules(path.join(__dirname, 'rules')).then(() => {
            done();
        }).catch((ex) => {
            done(ex);
        });


    });



    it('View of Customer test', function (done) {
        viewOfCustomerTest().then(function () {
            done();
        }).catch(function (ex) {
            done(ex);
        })

    });


});
