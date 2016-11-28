
import * as assert from 'assert';
import * as path from 'path';
import * as mochaUtils from 'mocha';
import { Transaction, loadRules } from '../../src/index';
import { SalesOrder } from './salesorder';
import * as sorules from './rules/salesorder-rules';


async function testSales(): Promise<void> {

    let transaction = new Transaction();
    let so = await transaction.create<SalesOrder>(SalesOrder);

    await so.ruleCount.value(0);
    await so.netAmount.value(100);
    let na = await so.netAmount.value();
    let vat = await so.vat.value();
    let ga = await so.grossAmount.value();
    assert.equal(na, 100, 'NetAmount after set netAmount');
    assert.equal(vat, 19.3, 'Vat after set netAmount');
    assert.equal(ga, 119.3, 'GrossAmount after set netAmount')

    await so.vat.value(38.6);
    na = await so.netAmount.value();
    vat = await so.vat.value();
    ga = await so.grossAmount.value();
    assert.equal(na, 200, 'NetAmount after set Vat');
    assert.equal(vat, 38.6, 'Vat after set Vat');
    assert.equal(ga, 238.6, 'GrossAmount after set Vat')

    await so.grossAmount.value(330);
    na = await so.netAmount.value();
    vat = await so.vat.value();
    ga = await so.grossAmount.value();



    assert.equal(na, 276.61, 'NetAmount after set Vat');
    assert.equal(vat, 53.39, 'Vat after set Vat');
    assert.equal(ga, 330, 'GrossAmount after set Vat');

    let rc = await so.ruleCount.value();
    assert.equal(rc, 3, 'calculateVatAndAmont was called 3 times');

    // decimals tests
    await so.vat.value(33.33);
    na = await so.netAmount.value();
    assert.equal(na, 172.69, 'Decimals test');

    so.netAmount.value(172.68);
    vat = await so.vat.value();
    assert.equal(vat, 33.33, 'Decimals test');

    await so.netAmount.decimals(1);
    na = await so.netAmount.value();
    assert.equal(na, 172.7, 'NetAmount after set Vat');


    assert.equal(so.$errors.netAmount.error, '', 'No error');
    so.$states.netAmount.maximum = 1000;
    await so.netAmount.value(2000);
    //so.$errors.netAmount.error === 'Net Amount (excluding VAT)' cannot exceed 1000.0
    assert.notEqual(so.$errors.netAmount.error, '', 'Has error ');


    await so.netAmount.value(920);
    assert.equal(so.$errors.netAmount.error, '', 'No error');

}


describe('Sales Orders Test', () => {
    before(function (done) {
        assert.equal(sorules.test, 1, 'Rules Loaded');
        loadRules(path.join(__dirname, 'rules')).then(() => {
            done();
        }).catch((ex) => {
            done(ex);
        });
    });
    it('Sales Order test', function (done) {
        testSales().then(function () {
            done();
        }).catch(function (ex) {
            done(ex);
        })

    });

});
