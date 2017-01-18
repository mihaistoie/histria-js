import * as assert from 'assert';
import * as path from 'path';
import * as mochaUtils from 'mocha';
import { Transaction, loadRules } from '../../src/index';
import { Cd } from './model/cd';
import { Song } from './model/song';
import { test as test1 } from './model/rules/cd-rules';

async function testCreate(): Promise<void> {
    let transaction = new Transaction();
    let cd = await transaction.create<Cd>(Cd);
    let song1 = await transaction.create<Song>(Song);
    let song2 = await transaction.create<Song>(Song);
    await cd.songs.add(song1);
    let cd1 = await song1.cd();
    assert.equal(cd, cd1, '(1) song1 on cd');
    assert.equal(await song1.cdId, cd.uuid, '(2) song1 on cd');
    let children = await cd.songs.toArray();
    assert.deepEqual(children.map(ii => { return ii.uuid }), [song1.uuid], '(3) song1 on cd');

    await song2.cd(cd);
    children = await cd.songs.toArray();

    assert.equal(children.length, 2, '(1) Cd has 2 songs');
    assert.deepEqual(children.map(ii => ii.uuid), [song1.uuid, song2.uuid], '(2) Cd has 2 songs');

    await song1.cd(null);
    children = await cd.songs.toArray();
    assert.deepEqual(children.map(ii => ii.uuid), [song2.uuid], '(1) Cd has a song');

    await cd.songs.add(song1, 0);
    children = await cd.songs.toArray();
    assert.equal(children.length, 2, '(1) Cd has 2 songs');
    assert.deepEqual(children.map(ii => ii.uuid), [song1.uuid, song2.uuid], '(2) Cd has 2 songs');

    await cd.songs.remove(song2)
    children = await cd.songs.toArray();
    assert.equal(children.length, 1, '(4) Cd has a song');
    assert.deepEqual(children.map(ii => ii.uuid), [song1.uuid], '(5) Cd has a song');
    assert.equal(await song2.cd(), null, '(6) Song2 hasn\'t cd');


}


async function testLoad(): Promise<void> {
    let transaction = new Transaction();

    let cd = await transaction.create<Cd>(Cd);
    let song1 = await transaction.load<Song>(Song, { cdId: cd.uuid });
    let song2 = await transaction.load<Song>(Song, { cdId: cd.uuid });
    let children = await cd.songs.toArray();
    assert.equal(children.length, 2, '(1) Cd has 2 songs');
    assert.deepEqual(children.map(ii => ii.uuid).sort(), [song1.uuid, song2.uuid].sort(), '(2) Cd has 2 songs');
}

async function testRules(): Promise<void> {
    let transaction = new Transaction();
    let cd = await transaction.create<Cd>(Cd);
    let song1 = await transaction.create<Song>(Song);
    let song2 = await transaction.create<Song>(Song);
    await song1.cd(cd);
    await cd.songs.add(song2);
    //

}



describe('Relation One to many, Aggregation', () => {
    before(function (done) {
        assert.equal(test1, 1);
        loadRules(path.join(__dirname, 'model', 'rules')).then(() => {
            done();
        }).catch((ex) => {
            done(ex);
        });
       
    });
    it('One to many aggregation - create', function (done) {
        testCreate().then(function () {
            done();
        }).catch(function (ex) {
            done(ex);
        })


    });
    it('One to many aggregation - load', function (done) {
        testLoad().then(function () {
            done();
        }).catch(function (ex) {
            done(ex);
        })


    });
    it('One to many aggregation - rules', function (done) {
        testRules().then(function () {
            done();
        }).catch(function (ex) {
            done(ex);
        })


    });

    it('One to one Many aggregation- states errors', function (done) {
        done();

    });

});
