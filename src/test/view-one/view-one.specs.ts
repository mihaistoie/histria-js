
import * as assert from 'assert';
import * as path from 'path';
import * as mochaUtils from 'mocha';
import { Transaction, loadRules } from '../../index';
import { User, UserDetail } from './view-one-model';

async function viewOfUserTest(): Promise<void> {
    let transaction = new Transaction();
    let userDetail = await transaction.create<UserDetail>(UserDetail);
    let user = await transaction.create<User>(User);
    await userDetail.setUser(user);

    await user.setFirstName('John');
    let fullName = userDetail.fullName;
    assert.equal(fullName, 'John', 'Rules call ');
    await user.setLastName('Doe');
    let fn = user.firstName;
    let ln = user.lastName;
    fullName = userDetail.fullName;

    assert.equal(fn, 'John', 'First Name set/get');
    assert.equal(ln, 'Doe', 'Last Name set/get');
    assert.equal(fullName, 'John DOE', 'Rules call');

}



describe('ViewOne Model Test', () => {
    before(function (done) {
        loadRules(path.join(__dirname, 'rules')).then(() => {
            done();
        }).catch((ex) => {
            done(ex);
        });
    });
    it('View of User test', function (done) {
        viewOfUserTest().then(function () {
            done();
        }).catch(function (ex) {
            done(ex);
        })

    });

});
