import * as assert from 'assert';
import * as path from 'path';
import { Transaction, loadRules, modelManager } from '../../index';
import { Cd, Song } from './model/aggregations-model';

async function testCreate(): Promise<void> {
    const transaction = new Transaction();
    const cd = await transaction.create<Cd>(Cd);
    const song1 = await transaction.create<Song>(Song);
    const song2 = await transaction.create<Song>(Song);
    await cd.songs.add(song1);
    const cd1 = await song1.cd();
    assert.equal(cd, cd1, '(1) song1 on cd');
    assert.equal(song1.cdId, cd.uuid, '(2) song1 on cd');
    let children = await cd.songs.toArray();
    assert.deepEqual(children.map(ii => ii.uuid), [song1.uuid], '(3) song1 on cd');

    await song2.setCd(cd);
    children = await cd.songs.toArray();

    assert.equal(children.length, 2, '(1) Cd has 2 songs');
    assert.deepEqual(children.map(ii => ii.uuid), [song1.uuid, song2.uuid], '(2) Cd has 2 songs');

    await song1.setCd(null);
    children = await cd.songs.toArray();
    assert.deepEqual(children.map(ii => ii.uuid), [song2.uuid], '(1) Cd has a song');

    await cd.songs.add(song1, 0);
    children = await cd.songs.toArray();
    assert.equal(children.length, 2, '(1) Cd has 2 songs');
    assert.deepEqual(children.map(ii => ii.uuid), [song1.uuid, song2.uuid], '(2) Cd has 2 songs');

    await cd.songs.remove(song2);
    children = await cd.songs.toArray();
    assert.equal(children.length, 1, '(4) Cd has a song');
    assert.deepEqual(children.map(ii => ii.uuid), [song1.uuid], '(5) Cd has a song');
    assert.equal(await song2.cd(), null, '(6) Song2 hasn\'t cd');

    const data1 = transaction.saveToJson();
    transaction.clear();
    await transaction.loadFromJson(data1, false);
    const data2 = transaction.saveToJson();
    assert.deepEqual(data1, data2, 'Test transaction save/restore');
    transaction.destroy();

    const classes = modelManager().sortedClasses();
    assert.equal(classes.indexOf('aggregations.song') > classes.indexOf('aggregations.cd'), true, 'Song depends on Cd');

}

async function testLoad(): Promise<void> {
    const transaction = new Transaction();

    const cd = await transaction.create<Cd>(Cd);
    const song1 = await transaction.load<Song>(Song, { cdId: cd.uuid });
    const song2 = await transaction.load<Song>(Song, { cdId: cd.uuid });
    const children = await cd.songs.toArray();
    assert.equal(children.length, 2, '(1) Cd has 2 songs');
    assert.deepEqual(children.map(ii => ii.uuid).sort(), [song1.uuid, song2.uuid].sort(), '(2) Cd has 2 songs');

    const data1 = transaction.saveToJson();
    transaction.clear();
    await transaction.loadFromJson(data1, false);
    const data2 = transaction.saveToJson();
    assert.deepEqual(data1, data2, 'Test transaction save/restore');

    transaction.destroy();

}

async function testRules(): Promise<void> {
    const transaction = new Transaction();
    const cd = await transaction.create<Cd>(Cd);
    const song1 = await transaction.create<Song>(Song);
    const song2 = await transaction.create<Song>(Song);
    await song1.setDuration(10);
    await song2.setDuration(5);
    await song1.setCd(cd);
    assert.equal(cd.duration, 10, '(1) Duration is 10');
    await cd.songs.add(song2);
    assert.equal(cd.duration, 15, '(1) Duration is 15');
    await song2.setDuration(7);
    assert.equal(cd.duration, 17, '(1) Duration is 17');

    assert.equal(song1.cdChangedHits, 1, '(1) Cd changed');
    assert.equal(song2.cdChangedHits, 1, '(2) Cd changed');
    await song1.setCd(null);
    assert.equal(cd.duration, 7, '(1) Duration is 7');
    await cd.songs.remove(song2);
    assert.equal(cd.duration, 0, '(1) Duration is 0');
    const songs = await cd.songs.toArray();
    assert.equal(songs.length, 0, 'No songs on cd');
    assert.equal(song1.cdChangedHits, 2, '(1) Cd changed 2 times');
    assert.equal(song2.cdChangedHits, 2, '(2) Cd changed 2 times');
    //
    const data1 = transaction.saveToJson();
    transaction.clear();
    await transaction.loadFromJson(data1, false);
    const data2 = transaction.saveToJson();
    assert.deepEqual(data1, data2, 'Test transaction save/restore');

    transaction.destroy();

}

async function testRemove(): Promise<void> {
    let transaction = new Transaction();

    let cd = await transaction.create<Cd>(Cd);
    let song1 = await transaction.load<Song>(Song, { cdId: cd.uuid });
    let song2 = await transaction.load<Song>(Song, { cdId: cd.uuid });
    let children = await cd.songs.toArray();
    assert.equal(children.length, 2, '(1) Cd has 2 songs');
    await song2.remove();
    children = await cd.songs.toArray();
    assert.equal(children.length, 1, '(2) Cd has 1 songs');
    transaction.destroy();

    transaction = new Transaction();
    cd = await transaction.create<Cd>(Cd);
    song1 = await transaction.create<Song>(Song);
    song2 = await transaction.create<Song>(Song);
    const uuid = song2.id;
    await cd.songs.add(song1);
    await cd.songs.add(song2);
    assert.equal(await song1.cd(), cd, 'Song on cd');
    await cd.remove();
    assert.equal(await song1.cd(), null, '(1) Song without cd');

    const song = await transaction.findOne<Song>(Song, { id: uuid });
    assert.equal(song, song2, 'Song found');
    assert.equal(await song.cd(), null, '(2) Song without cd');

    transaction.destroy();
}

describe('Relation One to many, Aggregation', () => {
    before((done) => {
        loadRules(path.join(__dirname, 'model', 'rules')).then(() => {
            done();
        }).catch((ex) => {
            done(ex);
        });
    });

    it('One to many aggregation - create', (done) => {
        testCreate().then(() => {
            done();
        }).catch((ex) => {
            done(ex);
        });

    });
    it('One to many aggregation - load', (done) => {
        testLoad().then(() => {
            done();
        }).catch((ex) => {
            done(ex);
        });

    });
    it('One to many aggregation - remove', (done) => {
        testRemove().then(() => {
            done();
        }).catch((ex) => {
            done(ex);
        });
    });
    it('One to many aggregation - rules', (done) => {
        testRules().then(() => {
            done();
        }).catch((ex) => {
            done(ex);
        });
    });

    it('One to one Many aggregation- states errors', (done) => {
        done();

    });

});
