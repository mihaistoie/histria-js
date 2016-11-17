
import * as assert from 'assert';
import * as path from 'path';
import * as mochaUtils from 'mocha';
import { Transaction, loadRules } from '../../src/index';
import { User } from './user';
import * as rules from './rules/user-rules';

async function testUser(): Promise<void> {
    let transaction = new Transaction();
    let user = transaction.create<User>(User);
    await user.firstName('John');                   // user.firstName = 'John';

    let fullName = await user.fullName();
    assert.equal(fullName, 'John', 'Rules call ');

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

describe('Base Model Test', () => {
    before(function (done) {
        assert.equal(rules.test, 1, 'Rules Loaded');
        loadRules(path.join(__dirname, 'rules')).then(() => {
            done();
        }).catch((ex) => {
            done(ex);
        });
    });
    it('Class test', function (done) {
        testUser().then(function () {
            done();
        }).catch(function (ex) {
            done(ex);
        })

    });

});
