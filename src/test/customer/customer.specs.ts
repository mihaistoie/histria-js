
import * as assert from 'assert';
import * as path from 'path';
import { Transaction, loadRules } from '../../index';
import { Customer, CustomerView } from './customer-view-sample-model';
import { DbDriver, dbManager, DbManager, IStore } from 'histria-utils';

async function viewOfCustomerTest(): Promise<void> {
    const transaction = new Transaction();
    const viewOfCustomer = await transaction.create<CustomerView>(CustomerView);
    const customer = await transaction.create<Customer>(Customer);
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

        loadRules(path.join(__dirname, 'rules')).then(() => {
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
