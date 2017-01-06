
import * as assert from 'assert';
import * as path from 'path';
import * as mochaUtils from 'mocha';
import { Transaction, loadRules } from '../../src/index';
import { Employee } from './model/employee';
import { Department } from './model/department';
import { Order } from './model/order';
import { Customer } from './model/customer';

import { test } from './model/rules/order-rules';

async function testCreate(): Promise<void> {
    let transaction = new Transaction();
    let employee = await transaction.create<Employee>(Employee);
    let department = await transaction.create<Department>(Department);
    await department.code('R&D');
    await employee.department(department);

    let dep = await employee.department();
    assert.equal(dep, department, 'set department not null');
    assert.equal(await employee.departmentCode(), await department.code(), 'set department not null');
    await employee.department(null);
    let depCode = await employee.departmentCode();
    assert.equal(await employee.departmentCode(), undefined, 'departmentCode is undefined');
}

async function testLoad(): Promise<void> {
    let transaction = new Transaction();
    let department = await transaction.create<Department>(Department);
    await department.code('R&D');
    let employee = await transaction.load<Employee>(Employee, { departmentCode: 'R&D' });
    department = await employee.department();
    assert.notEqual(department, null, 'department is not null');
    assert.equal(await employee.departmentCode(), await department.code(), 'check departement code');
    await employee.department(null);
    let depCode = await employee.departmentCode();
    assert.equal(depCode, undefined, 'departmentCode is undefined');
}

async function testRefById(): Promise<void> {
    let transaction = new Transaction();
    let cust = await transaction.create<Customer>(Customer);
    let order = await transaction.load<Order>(Order, { customerId: cust.uuid });
    let customerId = await order.customerId.value();
    let id = await cust.id.value();
    let cust2 = await order.customer();
    assert.equal(cust, cust2, 'test loading');
    await order.customer(null);
    customerId = await order.customerId.value();
    assert.equal(customerId, undefined, 'customerId is undefined');
}


async function testRules(): Promise<void> {
    let transaction = new Transaction();
    let cust = await transaction.create<Customer>(Customer);
    let order = await transaction.create<Order>(Order);
    await order.customer(cust);
    let cs = await order.customerStatus();
    assert.equal(cs, 'not null', 'Rule called 1');
    await order.customer(null);
    cs = await order.customerStatus();
    assert.equal(cs, 'null', 'Rule called 2');
}



describe('Relation One to One, Reference', () => {
    before(function (done) {
        assert.equal(test, 1);
        loadRules(path.join(__dirname, 'model', 'rules')).then(() => {
            done();
        }).catch((ex) => {
            done(ex);
        });
    });
    it('create Test', function (done) {
        testCreate().then(function () {
            done();
        }).catch(function (ex) {
            done(ex);
        })

    });
    it('load Test', function (done) {
        testLoad().then(function () {
            done();
        }).catch(function (ex) {
            done(ex);
        });

    });
    it('Ref rel by ID Test', function (done) {
        testRefById().then(function () {
            done();
        }).catch(function (ex) {
            done(ex);
        });

    });
    it('Rules on, ref changed', function (done) {
        testRules().then(function () {
            done();
        }).catch(function (ex) {
            done(ex);
        });

    });

});
