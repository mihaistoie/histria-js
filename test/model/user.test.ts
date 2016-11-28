
import * as assert from 'assert';
import * as path from 'path';
import * as mochaUtils from 'mocha';
import { Transaction, loadRules } from '../../src/index';
import { User } from './user';
import * as urules from './rules/user-rules';

async function testUser(): Promise<void> {
    let transaction = new Transaction();
    let user = await transaction.create<User>(User);
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

    assert.equal(user.$states.firstName.isMandatory, true, 'Init state (firstName.isMandatory) from schema');
    assert.equal(user.$states.fullName.isReadOnly, true, 'Init state (fullName.isReadOnly) from schema');
    assert.equal(user.$states.fullName.isHidden, false, 'Init state (fullName.isHidden) from schema');

    user = await transaction.load<User>(User, { firstName: 'Albert', lastName: 'Camus' });
    fullName = await user.fullName();
    assert.equal(fullName, 'Albert CAMUS', 'Init rule called');
    await user.lastName('$Money');
    assert.equal(user.$errors.lastName.error, 'Last Name starts with $.', 'Has error ');

    await user.lastName('Doe');
    assert.equal('', '', 'Has error ');
    await user.firstName('Doe');
    await user.validate();
    assert.equal(user.$errors.$.error, 'FirstName === LastName', 'Has error ');


}

describe('User Model Test', () => {
    before(function (done) {
        assert.equal(urules.test, 1, 'Rules Loaded');
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

});
