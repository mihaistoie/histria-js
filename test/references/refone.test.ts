
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
    await department.setCode('R&D');
    await employee.setDepartment(department);

    let dep = await employee.department();
    assert.equal(dep, department, 'set department not null');
    assert.equal(employee.departmentCode, department.code, 'set department not null');
    await employee.setDepartment(null);
    assert.equal(employee.departmentCode, undefined, 'departmentCode is undefined');
}

async function testLoad(): Promise<void> {
    let transaction = new Transaction();
    let department = await transaction.create<Department>(Department);
    await department.setCode('R&D');
    let employee = await transaction.load<Employee>(Employee, { departmentCode: 'R&D' });
    department = await employee.department();
    assert.notEqual(department, null, 'department is not null');
    assert.equal(employee.departmentCode, department.code, 'check departement code');
    await employee.setDepartment(null);
    let depCode = employee.departmentCode;
    assert.equal(depCode, undefined, 'departmentCode is undefined');
}

async function testRefById(): Promise<void> {
    let transaction = new Transaction();
    let cust = await transaction.create<Customer>(Customer);
    let order = await transaction.load<Order>(Order, { customerId: cust.uuid });
    let customerId = order.customerId;
    let id = cust.id;
    let cust2 = await order.customer();
    assert.equal(cust, cust2, 'test loading');
    await order.setCustomer(null);
    customerId = order.customerId;
    assert.equal(customerId, undefined, 'customerId is undefined');
}


async function testRules(): Promise<void> {
    let transaction = new Transaction();
    let cust = await transaction.create<Customer>(Customer);
    let order = await transaction.create<Order>(Order);
    await order.setCustomer(cust);
    assert.equal(order.customerStatus, 'not null', 'Rule called 1');
    await order.setCustomer(null);
    assert.equal(order.customerStatus, 'null', 'Rule called 2');
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
