
import * as assert from 'assert';
import * as path from 'path';
import * as mochaUtils from 'mocha';
import { Transaction, loadRules } from '../../index';
import { User, UserDetail } from './view-one-model';
import { DbDriver, dbManager, DbManager, IStore } from 'histria-utils';

async function viewOfUserTest(): Promise<void> {
    let transaction = new Transaction();
    let userDetail = await transaction.create<UserDetail>(UserDetail);
    let user1 = await transaction.findOne<User>(User, { id: 101 });
    let user2 = await transaction.findOne<User>(User, { id: 101 });
    let user3 = await transaction.findOne<User>(User, { id: 101 }, { onlyInCache: true });
    assert.equal(user1, user2, 'Same User (1)');
    assert.equal(user1, user3, 'Same User (2)');


    let user = await transaction.create<User>(User);
    await userDetail.setUser(user);
    await user.setFirstName('John');

    assert.equal(userDetail.fullName, 'John', 'After user name changed');
    await user.setLastName('Doe');

    assert.equal(userDetail.fullName, 'John DOE', 'After  name and lastName changed');

    await userDetail.setUser(null);
    assert.equal(userDetail.fullName, '', 'User is null');

    await userDetail.setUser(user);
    assert.equal(userDetail.fullName, 'John DOE', 'User is not null');

    let det = await transaction.load<UserDetail>(UserDetail, { id: 10, userId: 101 });
    user = await det.user();

    assert.notEqual(user, null, 'Lazy loading (1)');
    assert.equal(user.firstName, 'John', 'Lazy loading (2)');
    assert.equal(det.fullName, 'John SMITH', 'Rule called after lazy loading');

    let userDetId = det.id;
    let userId = det.userId;
    let transactionData = transaction.saveToJson();
    transaction.clear();
    await transaction.loadFromJson(transactionData, false);
    let data2 = transaction.saveToJson();
    
    assert.deepEqual(transactionData, data2, 'Restore Test');
    // Test that det.user is loaded
    let cuser = await transaction.findOne<User>(User, { id: userId })
    let duser = await transaction.findOne<UserDetail>(UserDetail, { id: userDetId })

    assert.equal(!!cuser, true, 'User found');
    assert.equal(!!duser, true, 'User Detail found');
    user1 = await transaction.findOne<User>(User, { id: 101 });

    await user1.setLastName('Doe');
    assert.equal(duser.fullName, 'John DOE', 'User suser.user is loaded after transection restore');


    transaction.destroy();

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
