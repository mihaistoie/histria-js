
import * as assert from 'assert';
import * as path from 'path';
import * as mochaUtils from 'mocha';
import { Transaction, loadRules } from '../../src/index';
import { Employee } from './model/employee';
import { Department } from './model/department';

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
    let employee = await transaction.load<Employee>(Employee, { departmentCode: 'R&D' });
    let department = await employee.department();
    assert.notEqual(department, null, 'department is not  null');
    assert.equal(await employee.departmentCode(), await department.code(), 'check departement code');
}

describe('Relation One to One, Reference', () => {
    before(function (done) {
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
        })

    });

});
