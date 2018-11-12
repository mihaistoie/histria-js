
import * as assert from 'assert';
import * as path from 'path';
import { Transaction, loadRules } from '../../index';
import { User, UserDetail } from './view-one-model';
import { DbDriver, dbManager, DbManager, IStore } from 'histria-utils';

async function viewOfUserTest(): Promise<void> {
    const transaction = new Transaction();
    const userDetail = await transaction.create<UserDetail>(UserDetail, { external: true });
    let user1 = await transaction.findOne<User>(User, { id: 101 });
    const user2 = await transaction.findOne<User>(User, { id: 101 });
    const user3 = await transaction.findOne<User>(User, { id: 101 }, { onlyInCache: true });
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

    const det = await transaction.load<UserDetail>(UserDetail, { id: 10, userId: 101 }, { external: true });

    user = await det.user();

    assert.notEqual(user, null, 'Lazy loading (1)');
    assert.equal(user.firstName, 'John', 'Lazy loading (2)');
    assert.equal(det.fullName, 'John SMITH', 'Rule called after lazy loading');

    const userDetId = det.id;
    const userId = det.userId;
    const transactionData = transaction.saveToJson();
    transaction.clear();
    await transaction.loadFromJson(transactionData, false);
    const data2 = transaction.saveToJson();

    assert.deepEqual(transactionData, data2, 'Restore Test');
    // Test that det.user is loaded
    const cuser = await transaction.findOne<User>(User, { id: userId });
    const duser = await transaction.findOne<UserDetail>(UserDetail, { id: userDetId });

    assert.equal(!!cuser, true, 'User found');
    assert.equal(!!duser, true, 'User Detail found');
    user1 = await transaction.findOne<User>(User, { id: 101 });

    await user1.setLastName('Doe');
    assert.equal(duser.fullName, 'John DOE', 'User suser.user is loaded after transaction restore');

    transaction.destroy();

}

async function viewOfUserTestRemove(): Promise<void> {
    let transaction = new Transaction();
    let userDetail = await transaction.create<UserDetail>(UserDetail, { external: true });
    let user = await transaction.create<User>(User);
    await userDetail.setUser(user);
    assert.notEqual(await userDetail.user(), null, '(1) User is not null');

    await user.remove();
    assert.equal(await userDetail.user(), null, '(1) User is null');
    transaction.destroy();

    transaction = new Transaction();
    userDetail = await transaction.create<UserDetail>(UserDetail, { external: true });
    user = await transaction.findOne<User>(User, { id: 100 });
    await userDetail.setUser(user);
    assert.notEqual(await userDetail.user(), null, '(2) User is not null');

    await user.remove();
    assert.equal(await userDetail.user(), null, '(2) User is null');
    transaction.destroy();

    // remove view

}

describe('ViewOne Model Test', () => {
    before((done) => {
        const dm: DbManager = dbManager();
        dm.registerNameSpace('view-one', 'memory', { compositionsInParent: true });
        const store = dm.store('view-one');
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

    it('View of User test', (done) => {
        viewOfUserTest().then(() => {
            done();
        }).catch((ex) => {
            done(ex);
        });

    });
    it('View of User test remove', (done) => {
        viewOfUserTestRemove().then(() => {
            done();
        }).catch((ex) => {
            done(ex);
        });

    });

});
