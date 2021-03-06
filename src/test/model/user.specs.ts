
import * as assert from 'assert';
import * as path from 'path';
import { Transaction, loadRules } from '../../index';
import { User } from './model-model';

async function testUser(): Promise<void> {
    const transaction = new Transaction();
    let user = await transaction.create<User>(User);
    await user.setFirstName('John');                   // user.firstName = 'John';
    let fullName = user.fullName;
    assert.equal(fullName, 'John', 'Rules call ');
    await user.setAge(10.25);
    const age = user.age;
    assert.equal(age, 10, 'Age set/get');

    await user.setLastName('Doe');          // user.lastName = 'Doe';
    const fn = user.firstName;                // fn = user.firstName;
    const ln = user.lastName;                 // ln = user.lastName;
    fullName = user.fullName;               // fullName = user.fullName;

    assert.equal(fn, 'John', 'First Name set/get');
    assert.equal(ln, 'Doe', 'Last Name set/get');
    assert.equal(fullName, 'John DOE', 'Rules call');

    assert.equal(user.$states.firstName.isMandatory, true, 'Init state (firstName.isMandatory) from schema');
    assert.equal(user.$states.fullName.isReadOnly, true, 'Init state (fullName.isReadOnly) from schema');
    assert.equal(user.$states.fullName.isHidden, false, 'Init state (fullName.isHidden) from schema');

    user = await transaction.load<User>(User, { firstName: 'Albert', lastName: 'Camus' });
    fullName = user.fullName;
    assert.equal(fullName, 'Albert CAMUS', 'Init rule called');
    await user.setLastName('$Money');
    assert.equal(user.$errors.lastName.error, 'Last Name starts with $.', 'Has error ');

    await user.setLastName('Doe');
    assert.equal('', '', 'Has error ');
    await user.setFirstName('Doe');
    await user.validate();
    assert.equal(user.$errors.$.error, 'FirstName === LastName', 'Has error ');
}

describe('User Model Test', () => {
    before((done) => {
        loadRules(path.join(__dirname, 'rules')).then(() => {
            done();
        }).catch((ex) => {
            done(ex);
        });
    });
    it('User test', (done) => {
        testUser().then(() => {
            done();
        }).catch((ex) => {
            done(ex);
        });

    });

});
