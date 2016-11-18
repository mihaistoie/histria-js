
import * as assert from 'assert';
import * as path from 'path';
import * as mochaUtils from 'mocha';
import { Transaction, loadRules } from '../../src/index';
import { User } from './user';
import { SalesOrder } from './salesorder';
import * as urules from './rules/user-rules';
import * as sorules from './rules/salesorder-rules';

async function testUser(): Promise<void> {
    let transaction = new Transaction();
    let user = transaction.create<User>(User);
    await user.firstName('John');                   // user.firstName = 'John';

    let fullName = await user.fullName();
    assert.equal(fullName, 'John', 'Rules call ');

    await user.age.value(10.25);
    let age = await user.age.value();
    assert.equal(age, 10, 'Age set/get');

    await user.lastName('Doe');                     // user.lastName = 'Doe';
    let fn = await user.firstName();                // fn = user.firstName;
    let ln = await user.lastName();                 // ln = user.lastName;
    fullName = await user.fullName();               // fullName = user.fullName;

    assert.equal(fn, 'John', 'First Name set/get');
    assert.equal(ln, 'Doe', 'Last Name set/get');
    assert.equal(fullName, 'John DOE', 'Rules call');

    assert.equal(user.states.firstName.isMandatory, true, 'Init state (firstName.isMandatory) from schema');
    assert.equal(user.states.fullName.isReadOnly, true, 'Init state (fullName.isReadOnly) from schema');
    assert.equal(user.states.fullName.isHidden, false, 'Init state (fullName.isHidden) from schema');

}

async function testSales(): Promise<void> {
    let transaction = new Transaction();
    let so = transaction.create<SalesOrder>(SalesOrder);
    
    await so.netAmount.value(100);
    let na = await so.netAmount.value();
    let vat = await so.vat.value();
    let ga = await so.grossAmount.value();
    assert.equal(na, 100, 'NetAmount after set netAmount');
    assert.equal(vat, 10, 'Vat after set netAmount');
    assert.equal(ga, 110, 'GrossAmount after set netAmount')
    
    await so.vat.value(20);
    na = await so.netAmount.value();
    vat = await so.vat.value();
    ga = await so.grossAmount.value();
    assert.equal(na, 200, 'NetAmount after set Vat');
    assert.equal(vat, 20, 'Vat after set Vat');
    assert.equal(ga, 220, 'GrossAmount after set Vat')

    await so.grossAmount.value(330);
    na = await so.netAmount.value();
    vat = await so.vat.value();
    ga = await so.grossAmount.value();

    assert.equal(na, 300, 'NetAmount after set Vat');
    assert.equal(vat, 30, 'Vat after set Vat');
    assert.equal(ga, 330, 'GrossAmount after set Vat');
    
    // decimals tests
    await so.vat.value(33.33); 
    na = await so.netAmount.value();
    assert.equal(na, 333.3, 'Decimals test');

     so.netAmount.value(333.31);
     vat = await so.vat.value();
     assert.equal(vat, 33.33, 'Decimals test');

}


describe('Base Model Test', () => {
    before(function (done) {
        assert.equal(urules.test, 1, 'Rules Loaded');
        assert.equal(sorules.test, 1, 'Rules Loaded');
        loadRules(path.join(__dirname, 'rules')).then(() => {
            done();
        }).catch((ex) => {
            done(ex);
        });
    });
    it('User test', function (done) {
        testUser().then(function () {
            done();
        }).catch(function (ex) {
            done(ex);
        })

    });
    it('Sales Order test', function (done) {
        testSales().then(function () {
            done();
        }).catch(function (ex) {
            done(ex);
        })

    });

});
