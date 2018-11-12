
import * as assert from 'assert';
import * as path from 'path';
import { Transaction, loadRules } from '../../index';
import { User, UserList } from './view-many-view-model';
import { DbDriver, dbManager, DbManager, IStore } from 'histria-utils';

async function testCreate(): Promise<void> {
    let transaction = new Transaction();
    let userList = await transaction.create<UserList>(UserList);
    let user1 = await transaction.create<User>(User);
    let user2 = await transaction.create<User>(User);
    await userList.users.set([user1, user2]);
    assert.equal(userList.userCount, 2, '(0) Rules');
    transaction.destroy();
    transaction = new Transaction();

    userList = await transaction.create<UserList>(UserList);
    user1 = await transaction.create<User>(User);
    user2 = await transaction.create<User>(User);
    await userList.users.add(user1);
    await userList.users.add(user2);
    let users = await userList.users.toArray();
    assert.equal(users.length, 2, 'Two users');
    assert.equal(userList.userCount, 2, '(1) Rules');

    await userList.users.remove(user2);
    users = await userList.users.toArray();
    assert.equal(users.length, 1, 'One user');
    assert.equal(userList.userCount, 1, '(2) Rules');
    transaction.destroy();
}

async function testRestore(): Promise<void> {
    let transaction = new Transaction();
    let userList = await transaction.create<UserList>(UserList);
    const user1 = await transaction.create<User>(User);
    const user2 = await transaction.create<User>(User);
    await userList.users.add(user1);
    await userList.users.add(user2);
    let users = await userList.users.toArray();
    assert.equal(users.length, 2, '(1) Two users');
    const data = transaction.saveToJson();
    const idView = userList.uuid;

    transaction.destroy();
    transaction = new Transaction();
    await transaction.loadFromJson(data, false);
    userList = await transaction.findOne<UserList>(UserList, { id: idView });
    users = await userList.users.toArray();
    assert.equal(users.length, 2, '(2) Two users');
}

async function testRemove(): Promise<void> {
    const transaction = new Transaction();
    const userList = await transaction.create<UserList>(UserList);
    const user = await transaction.create<User>(User);
    await userList.users.add(user);
    let users = await userList.users.toArray();
    assert.equal(users.length, 1, '(1-1) One users');

    await user.remove();
    users = await userList.users.toArray();
    assert.equal(users.length, 0, '(2-2) No users');
    transaction.destroy();

}

describe('View Many <View> Model Test', () => {
    before((done) => {
        const dm: DbManager = dbManager();
        dm.registerNameSpace('view-many-view', 'memory', { compositionsInParent: true });
        const store = dm.store('view-many-view');
        store.initNameSpace('view-many-view', {});

        loadRules(path.join(__dirname, 'rules')).then(() => {
            done();
        }).catch((ex) => {
            done(ex);
        });

    });

    it('View of users (view) test', (done) => {
        testCreate().then(() => {
            done();
        }).catch((ex) => {
            done(ex);
        });

    });
    it('View of users (view) test remove', (done) => {
        testRemove().then(() => {
            done();
        }).catch((ex) => {
            done(ex);
        });
    });
    it('View of users (view) test restore', (done) => {
        testRestore().then(() => {
            done();
        }).catch((ex) => {
            done(ex);
        });
    });

});
