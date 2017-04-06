
import * as assert from 'assert';
import * as path from 'path';
import * as mochaUtils from 'mocha';
import { Transaction, loadRules } from '../../index';
import { User, UserDetail } from './view-one-model';
import { DbDriver, dbManager, DbManager, IStore } from 'histria-utils';

async function viewOfUserTest(): Promise<void> {
    let transaction = new Transaction();
    let userDetail = await transaction.create<UserDetail>(UserDetail);
    let user = await transaction.create<User>(User);
    await userDetail.setUser(user);
    await user.setFirstName('John');
    let fullName = userDetail.fullName;
    assert.equal(fullName, 'John', 'After user name changed');
    await user.setLastName('Doe');

    fullName = userDetail.fullName;
    assert.equal(fullName, 'John DOE', 'After  name and lastName changed');

    await userDetail.setUser(null);
    fullName = userDetail.fullName;
    assert.equal(fullName, '', 'User is null');

    await userDetail.setUser(user);
    fullName = userDetail.fullName;
    assert.equal(fullName, 'John DOE', 'User is not null');


    let det = await transaction.load<UserDetail>(UserDetail, { id: 10, userId: 101 });
    user = await det.user();
    assert.notEqual(user, null, 'Lazy loading (1)');
    assert.equal(user.firstName, 'John', 'Lazy loading (2)');
    assert.equal(det.fullName, 'John Smith', 'Rule called after lazy loading');
}



describe('ViewOne Model Test', () => {
    before(function (done) {
        let dm: DbManager = dbManager();
        dm.registerNameSpace('view-one', 'memory', { compositionsInParent: true });
        let store = dm.store('view-one');
        store.initNameSpace('view-one', {
            user: [
                {
                    id: 100,
                    firstName: 'Joe',
                    lastName: 'Doe',
                },
                {
                    id: 101,
                    firstName: 'John',
                    lastName: 'Smith',
                }

            ]
        });


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
