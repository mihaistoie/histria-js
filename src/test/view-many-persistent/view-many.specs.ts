
import * as assert from 'assert';
import * as path from 'path';
import { Transaction, loadRules } from '../../index';
import { User, UserList } from './view-many-model';
import { DbDriver, dbManager, DbManager, IStore } from 'histria-utils';

async function testCreate(): Promise<void> {
    let transaction = new Transaction();
    let userList = await transaction.create<UserList>(UserList, { external: true });
    let user1 = await transaction.create<User>(User);
    let user2 = await transaction.create<User>(User);
    await userList.users.set([user1, user2]);
    assert.equal(userList.userCount, 2, '(0) Rules');
    transaction.destroy();
    transaction = new Transaction();

    userList = await transaction.create<UserList>(UserList, { external: true });
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

    const data = transaction.saveToJson();
    assert.equal(data.instances[2].data.users[0], user1.id, 'Model of view');

    transaction.destroy();
}

async function testRestore(): Promise<void> {
    let transaction = new Transaction();
    let userList = await transaction.create<UserList>(UserList, { external: true });
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
    let transaction = new Transaction();
    let userList = await transaction.create<UserList>(UserList);
    let user = await transaction.create<User>(User);
    await userList.users.add(user);
    let users = await userList.users.toArray();
    assert.equal(users.length, 1, '(1) One users');
    await user.remove();
    users = await userList.users.toArray();
    assert.equal(users.length, 0, '(2) No users');
    transaction.destroy();

    transaction = new Transaction();
    userList = await transaction.create<UserList>(UserList, { external: true });
    user = await transaction.findOne<User>(User, { id: 100 });
    await userList.users.add(user);

    users = await userList.users.toArray();

    assert.equal(users.length, 1, '(3) One users');
    await user.remove();
    users = await userList.users.toArray();
    assert.equal(users.length, 0, '(4) No users');
    transaction.destroy();

    transaction = new Transaction();
    userList = await transaction.create<UserList>(UserList, { external: true });
    user = await transaction.findOne<User>(User, { id: 100 });
    await userList.users.add(user);
    await userList.remove();
    user = await transaction.findOne<User>(User, { id: 100 });
    assert.notEqual(user, null, 'User found');

    transaction.destroy();

}

describe('View Many Model Test', () => {
    before((done) => {
        const dm: DbManager = dbManager();
        dm.registerNameSpace('view-many', 'memory', { compositionsInParent: true });
        const store = dm.store('view-many');
        store.initNameSpace('view-many', {
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

    it('View of users test', (done) => {
        testCreate().then(() => {
            done();
        }).catch((ex) => {
            done(ex);
        });

    });
    it('View of users test remove', (done) => {
        testRemove().then(() => {
            done();
        }).catch((ex) => {
            done(ex);
        });
    });
    it('View of users test restore', (done) => {
        testRestore().then(() => {
            done();
        }).catch((ex) => {
            done(ex);
        });
    });
});
