"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const path = require("path");
const index_1 = require("../../index");
const aggregations_model_1 = require("./model/aggregations-model");
function testCreate() {
    return __awaiter(this, void 0, void 0, function* () {
        let transaction = new index_1.Transaction();
        let cd = yield transaction.create(aggregations_model_1.Cd);
        let song1 = yield transaction.create(aggregations_model_1.Song);
        let song2 = yield transaction.create(aggregations_model_1.Song);
        yield cd.songs.add(song1);
        let cd1 = yield song1.cd();
        assert.equal(cd, cd1, '(1) song1 on cd');
        assert.equal(song1.cdId, cd.uuid, '(2) song1 on cd');
        let children = yield cd.songs.toArray();
        assert.deepEqual(children.map(ii => { return ii.uuid; }), [song1.uuid], '(3) song1 on cd');
        yield song2.setCd(cd);
        children = yield cd.songs.toArray();
        assert.equal(children.length, 2, '(1) Cd has 2 songs');
        assert.deepEqual(children.map(ii => ii.uuid), [song1.uuid, song2.uuid], '(2) Cd has 2 songs');
        yield song1.setCd(null);
        children = yield cd.songs.toArray();
        assert.deepEqual(children.map(ii => ii.uuid), [song2.uuid], '(1) Cd has a song');
        yield cd.songs.add(song1, 0);
        children = yield cd.songs.toArray();
        assert.equal(children.length, 2, '(1) Cd has 2 songs');
        assert.deepEqual(children.map(ii => ii.uuid), [song1.uuid, song2.uuid], '(2) Cd has 2 songs');
        yield cd.songs.remove(song2);
        children = yield cd.songs.toArray();
        assert.equal(children.length, 1, '(4) Cd has a song');
        assert.deepEqual(children.map(ii => ii.uuid), [song1.uuid], '(5) Cd has a song');
        assert.equal(yield song2.cd(), null, '(6) Song2 hasn\'t cd');
        let data1 = transaction.saveToJson();
        transaction.clear();
        transaction.loadFromJson(data1);
        let data2 = transaction.saveToJson();
        assert.deepEqual(data1, data2, 'Test transaction save/restore');
        transaction.destroy();
        let classes = index_1.modelManager().sortedClasses();
        assert.equal(classes.indexOf('aggregations.song') > classes.indexOf('aggregations.cd'), true, 'Song depends on Cd');
    });
}
function testLoad() {
    return __awaiter(this, void 0, void 0, function* () {
        let transaction = new index_1.Transaction();
        let cd = yield transaction.create(aggregations_model_1.Cd);
        let song1 = yield transaction.load(aggregations_model_1.Song, { cdId: cd.uuid });
        let song2 = yield transaction.load(aggregations_model_1.Song, { cdId: cd.uuid });
        let children = yield cd.songs.toArray();
        assert.equal(children.length, 2, '(1) Cd has 2 songs');
        assert.deepEqual(children.map(ii => ii.uuid).sort(), [song1.uuid, song2.uuid].sort(), '(2) Cd has 2 songs');
        let data1 = transaction.saveToJson();
        transaction.clear();
        transaction.loadFromJson(data1);
        let data2 = transaction.saveToJson();
        assert.deepEqual(data1, data2, 'Test transaction save/restore');
        transaction.destroy();
    });
}
function testRules() {
    return __awaiter(this, void 0, void 0, function* () {
        let transaction = new index_1.Transaction();
        let cd = yield transaction.create(aggregations_model_1.Cd);
        let song1 = yield transaction.create(aggregations_model_1.Song);
        let song2 = yield transaction.create(aggregations_model_1.Song);
        yield song1.setDuration(10);
        yield song2.setDuration(5);
        yield song1.setCd(cd);
        assert.equal(cd.duration, 10, '(1) Duration is 10');
        yield cd.songs.add(song2);
        assert.equal(cd.duration, 15, '(1) Duration is 15');
        yield song2.setDuration(7);
        assert.equal(cd.duration, 17, '(1) Duration is 17');
        assert.equal(song1.cdChangedHits, 1, '(1) Cd changed');
        assert.equal(song2.cdChangedHits, 1, '(2) Cd changed');
        yield song1.setCd(null);
        assert.equal(cd.duration, 7, '(1) Duration is 7');
        yield cd.songs.remove(song2);
        assert.equal(cd.duration, 0, '(1) Duration is 0');
        let songs = yield cd.songs.toArray();
        assert.equal(songs.length, 0, 'No songs on cd');
        assert.equal(song1.cdChangedHits, 2, '(1) Cd changed 2 times');
        assert.equal(song2.cdChangedHits, 2, '(2) Cd changed 2 times');
        //
        let data1 = transaction.saveToJson();
        transaction.clear();
        transaction.loadFromJson(data1);
        let data2 = transaction.saveToJson();
        assert.deepEqual(data1, data2, 'Test transaction save/restore');
        transaction.destroy();
    });
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
