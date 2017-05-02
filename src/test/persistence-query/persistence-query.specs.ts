
import * as assert from 'assert';
import * as path from 'path';
import { Transaction } from '../../index';
import { User } from './persistence-query-model';
import { DbDriver, dbManager, DbManager, IStore } from 'histria-utils';

async function testFindOne(): Promise<void> {
    let transaction = new Transaction();
    let user1 = await transaction.create<User>(User);
    transaction.destroy();
}

async function testFindMany(): Promise<void> {
    let transaction = new Transaction();
    let user1 = await transaction.create<User>(User);
    transaction.destroy();
}


describe('Persistence Test', () => {
    before(function (done) {
        let dm: DbManager = dbManager();
        dm.registerNameSpace('persistence-query', 'memory', { compositionsInParent: true });
        let store = dm.store('persistence-query');
        store.initNameSpace('persistence-query', {
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
        done();
    });

    it('Persistence Find One', function (done) {
        testFindOne().then(function () {
            done();
        }).catch(function (ex) {
            done(ex);
        })

    });
    it('Persistence Find Many', function (done) {
        testFindMany().then(function () {
            done();
        }).catch(function (ex) {
            done(ex);
        })
    });
});
