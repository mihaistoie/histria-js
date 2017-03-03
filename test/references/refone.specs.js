"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const path = require("path");
const index_1 = require("../../index");
const references_model_1 = require("./model/references-model");
function testCreate() {
    return __awaiter(this, void 0, void 0, function* () {
        let transaction = new index_1.Transaction();
        let employee = yield transaction.create(references_model_1.Employee);
        let department = yield transaction.create(references_model_1.Department);
        yield department.setCode('R&D');
        yield employee.setDepartment(department);
        let dep = yield employee.department();
        assert.equal(dep, department, 'set department not null');
        assert.equal(employee.departmentCode, department.code, 'set department not null');
        yield employee.setDepartment(null);
        assert.equal(employee.departmentCode, undefined, 'departmentCode is undefined');
        let data1 = transaction.saveToJson();
        transaction.clear();
        transaction.loadFromJson(data1);
        let data2 = transaction.saveToJson();
        assert.deepEqual(data1, data2, 'Test transaction save/restore');
        transaction.destroy();
    });
}
function testLoad() {
    return __awaiter(this, void 0, void 0, function* () {
        let transaction = new index_1.Transaction();
        let department = yield transaction.create(references_model_1.Department);
        yield department.setCode('R&D');
        let employee = yield transaction.load(references_model_1.Employee, { departmentCode: 'R&D' });
        department = yield employee.department();
        assert.notEqual(department, null, 'department is not null');
        assert.equal(employee.departmentCode, department.code, 'check departement code');
        yield employee.setDepartment(null);
        let depCode = employee.departmentCode;
        assert.equal(depCode, undefined, 'departmentCode is undefined');
        let data1 = transaction.saveToJson();
        transaction.clear();
        transaction.loadFromJson(data1);
        let data2 = transaction.saveToJson();
        assert.deepEqual(data1, data2, 'Test transaction save/restore');
        transaction.destroy();
    });
}
function testRefById() {
    return __awaiter(this, void 0, void 0, function* () {
        let transaction = new index_1.Transaction();
        let cust = yield transaction.create(references_model_1.Customer);
        let order = yield transaction.load(references_model_1.Order, { customerId: cust.uuid });
        let customerId = order.customerId;
        let id = cust.id;
        let cust2 = yield order.customer();
        assert.equal(cust, cust2, 'test loading');
        yield order.setCustomer(null);
        customerId = order.customerId;
        assert.equal(customerId, undefined, 'customerId is undefined');
        let data1 = transaction.saveToJson();
        transaction.clear();
        transaction.loadFromJson(data1);
        let data2 = transaction.saveToJson();
        assert.deepEqual(data1, data2, 'Test transaction save/restore');
        transaction.destroy();
    });
}
function testRules() {
    return __awaiter(this, void 0, void 0, function* () {
        let transaction = new index_1.Transaction();
        let cust = yield transaction.create(references_model_1.Customer);
        let order = yield transaction.create(references_model_1.Order);
        yield order.setCustomer(cust);
        assert.equal(order.customerStatus, 'not null', 'Rule called 1');
        yield order.setCustomer(null);
        assert.equal(order.customerStatus, 'null', 'Rule called 2');
        let data1 = transaction.saveToJson();
        transaction.clear();
        transaction.loadFromJson(data1);
        let data2 = transaction.saveToJson();
        assert.deepEqual(data1, data2, 'Test transaction save/restore');
        transaction.destroy();
    });
}
describe('Relation One to One, Reference', () => {
    before(function (done) {
        index_1.loadRules(path.join(__dirname, 'model', 'rules')).then(() => {
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
        });
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
