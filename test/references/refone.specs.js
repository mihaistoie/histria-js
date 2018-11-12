"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const path = require("path");
const index_1 = require("../../index");
const references_model_1 = require("./model/references-model");
async function testCreate() {
    const transaction = new index_1.Transaction();
    const employee = await transaction.create(references_model_1.Employee);
    const department = await transaction.create(references_model_1.Department);
    await department.setCode('R&D');
    await employee.setDepartment(department);
    const dep = await employee.department();
    assert.equal(dep, department, 'set department not null');
    assert.equal(employee.departmentCode, department.code, 'set department not null');
    await employee.setDepartment(null);
    assert.equal(employee.departmentCode, undefined, 'departmentCode is undefined');
    const data1 = transaction.saveToJson();
    transaction.clear();
    await transaction.loadFromJson(data1, false);
    const data2 = transaction.saveToJson();
    assert.deepEqual(data1, data2, 'Test transaction save/restore');
    transaction.destroy();
}
async function testLoad() {
    const transaction = new index_1.Transaction();
    let department = await transaction.create(references_model_1.Department);
    await department.setCode('R&D');
    const employee = await transaction.load(references_model_1.Employee, { departmentCode: 'R&D' });
    department = await employee.department();
    assert.notEqual(department, null, 'department is not null');
    assert.equal(employee.departmentCode, department.code, 'check departement code');
    await employee.setDepartment(null);
    const depCode = employee.departmentCode;
    assert.equal(depCode, undefined, 'departmentCode is undefined');
    const data1 = transaction.saveToJson();
    transaction.clear();
    await transaction.loadFromJson(data1, false);
    const data2 = transaction.saveToJson();
    assert.deepEqual(data1, data2, 'Test transaction save/restore');
    transaction.destroy();
}
async function testRefById() {
    const transaction = new index_1.Transaction();
    const cust = await transaction.create(references_model_1.Customer);
    const order = await transaction.load(references_model_1.Order, { customerId: cust.uuid });
    let customerId = order.customerId;
    const id = cust.id;
    const cust2 = await order.customer();
    assert.equal(cust, cust2, 'test loading');
    await order.setCustomer(null);
    customerId = order.customerId;
    assert.equal(customerId, undefined, 'customerId is undefined');
    const data1 = transaction.saveToJson();
    transaction.clear();
    await transaction.loadFromJson(data1, false);
    const data2 = transaction.saveToJson();
    assert.deepEqual(data1, data2, 'Test transaction save/restore');
    transaction.destroy();
}
async function testRules() {
    const transaction = new index_1.Transaction();
    const cust = await transaction.create(references_model_1.Customer);
    const order = await transaction.create(references_model_1.Order);
    await order.setCustomer(cust);
    assert.equal(order.customerStatus, 'not null', 'Rule called 1');
    await order.setCustomer(null);
    assert.equal(order.customerStatus, 'null', 'Rule called 2');
    const data1 = transaction.saveToJson();
    transaction.clear();
    await transaction.loadFromJson(data1, false);
    const data2 = transaction.saveToJson();
    assert.deepEqual(data1, data2, 'Test transaction save/restore');
    transaction.destroy();
}
describe('Relation One to One, Reference', () => {
    before((done) => {
        index_1.loadRules(path.join(__dirname, 'model', 'rules')).then(() => {
            done();
        }).catch((ex) => {
            done(ex);
        });
    });
    it('create Test', (done) => {
        testCreate().then(() => {
            done();
        }).catch((ex) => {
            done(ex);
        });
    });
    it('load Test', (done) => {
        testLoad().then(() => {
            done();
        }).catch((ex) => {
            done(ex);
        });
    });
    it('Ref rel by ID Test', (done) => {
        testRefById().then(() => {
            done();
        }).catch((ex) => {
            done(ex);
        });
    });
    it('Rules on, ref changed', (done) => {
        testRules().then(() => {
            done();
        }).catch((ex) => {
            done(ex);
        });
    });
});

//# sourceMappingURL=refone.specs.js.map
