"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const path = require("path");
const index_1 = require("../../index");
const aggregations_model_1 = require("./model/aggregations-model");
async function testCreate() {
    let transaction = new index_1.Transaction();
    let cd = await transaction.create(aggregations_model_1.Cd);
    let song1 = await transaction.create(aggregations_model_1.Song);
    let song2 = await transaction.create(aggregations_model_1.Song);
    await cd.songs.add(song1);
    let cd1 = await song1.cd();
    assert.equal(cd, cd1, '(1) song1 on cd');
    assert.equal(song1.cdId, cd.uuid, '(2) song1 on cd');
    let children = await cd.songs.toArray();
    assert.deepEqual(children.map(ii => { return ii.uuid; }), [song1.uuid], '(3) song1 on cd');
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
    let data1 = transaction.saveToJson();
    transaction.clear();
    await transaction.loadFromJson(data1, false);
    let data2 = transaction.saveToJson();
    assert.deepEqual(data1, data2, 'Test transaction save/restore');
    transaction.destroy();
    let classes = index_1.modelManager().sortedClasses();
    assert.equal(classes.indexOf('aggregations.song') > classes.indexOf('aggregations.cd'), true, 'Song depends on Cd');
}
async function testLoad() {
    let transaction = new index_1.Transaction();
    let cd = await transaction.create(aggregations_model_1.Cd);
    let song1 = await transaction.load(aggregations_model_1.Song, { cdId: cd.uuid });
    let song2 = await transaction.load(aggregations_model_1.Song, { cdId: cd.uuid });
    let children = await cd.songs.toArray();
    assert.equal(children.length, 2, '(1) Cd has 2 songs');
    assert.deepEqual(children.map(ii => ii.uuid).sort(), [song1.uuid, song2.uuid].sort(), '(2) Cd has 2 songs');
    let data1 = transaction.saveToJson();
    transaction.clear();
    await transaction.loadFromJson(data1, false);
    let data2 = transaction.saveToJson();
    assert.deepEqual(data1, data2, 'Test transaction save/restore');
    transaction.destroy();
}
async function testRules() {
    let transaction = new index_1.Transaction();
    let cd = await transaction.create(aggregations_model_1.Cd);
    let song1 = await transaction.create(aggregations_model_1.Song);
    let song2 = await transaction.create(aggregations_model_1.Song);
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
    let songs = await cd.songs.toArray();
    assert.equal(songs.length, 0, 'No songs on cd');
    assert.equal(song1.cdChangedHits, 2, '(1) Cd changed 2 times');
    assert.equal(song2.cdChangedHits, 2, '(2) Cd changed 2 times');
    //
    let data1 = transaction.saveToJson();
    transaction.clear();
    await transaction.loadFromJson(data1, false);
    let data2 = transaction.saveToJson();
    assert.deepEqual(data1, data2, 'Test transaction save/restore');
    transaction.destroy();
}
async function testRemove() {
    let transaction = new index_1.Transaction();
    let cd = await transaction.create(aggregations_model_1.Cd);
    let song1 = await transaction.load(aggregations_model_1.Song, { cdId: cd.uuid });
    let song2 = await transaction.load(aggregations_model_1.Song, { cdId: cd.uuid });
    let children = await cd.songs.toArray();
    assert.equal(children.length, 2, '(1) Cd has 2 songs');
    await song2.remove();
    children = await cd.songs.toArray();
    assert.equal(children.length, 1, '(2) Cd has 1 songs');
    transaction.destroy();
    transaction = new index_1.Transaction();
    cd = await transaction.create(aggregations_model_1.Cd);
    song1 = await transaction.create(aggregations_model_1.Song);
    song2 = await transaction.create(aggregations_model_1.Song);
    let uuid = song2.id;
    await cd.songs.add(song1);
    await cd.songs.add(song2);
    assert.equal(await song1.cd(), cd, 'Song on cd');
    await cd.remove();
    assert.equal(await song1.cd(), null, '(1) Song without cd');
    let song = await transaction.findOne(aggregations_model_1.Song, { id: uuid });
    assert.equal(song, song2, 'Song found');
    assert.equal(await song.cd(), null, '(2) Song without cd');
    transaction.destroy();
}
describe('Relation One to many, Aggregation', () => {
    before(function (done) {
        index_1.loadRules(path.join(__dirname, 'model', 'rules')).then(() => {
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
        });
    });
    it('One to many aggregation - load', function (done) {
        testLoad().then(function () {
            done();
        }).catch(function (ex) {
            done(ex);
        });
    });
    it('One to many aggregation - remove', function (done) {
        testRemove().then(function () {
            done();
        }).catch(function (ex) {
            done(ex);
        });
    });
    it('One to many aggregation - rules', function (done) {
        testRules().then(function () {
            done();
        }).catch(function (ex) {
            done(ex);
        });
    });
    it('One to one Many aggregation- states errors', function (done) {
        done();
    });
});

//# sourceMappingURL=aggregations-many.specs.js.map
