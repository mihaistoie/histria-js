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
const histria_utils_1 = require("histria-utils");
const compositions_model_1 = require("./model/compositions-model");
const car_engine_rules_1 = require("./model/rules/car-engine-rules");
function testCreate() {
    return __awaiter(this, void 0, void 0, function* () {
        let transaction = new index_1.Transaction();
        let car = yield transaction.create(compositions_model_1.Car);
        let engine = yield transaction.create(compositions_model_1.Engine);
        yield car.setEngine(engine);
        let parent = yield engine.car();
        assert.equal(car, parent, 'Owner of engine is car');
        assert.equal(engine.carId, car.uuid, 'Owner of engine is car');
        yield engine.setCar(null);
        assert.equal(engine.carId, undefined, '(1) Owner of engine null');
        assert.equal(yield engine.car(), null, '(2) Owner of engine null');
        yield engine.setCar(car);
        parent = yield engine.car();
        assert.equal(car, parent, 'Owner of engine is car 2 ');
        assert.equal(engine.carId, car.uuid, 'Owner of engine is car 2 ');
        yield car.setEngine(null);
        assert.equal(engine.carId, undefined, 'Owner of engine null 2 ');
        assert.equal(yield engine.car(), null, 'Owner of engine null 2');
        let car2 = yield transaction.create(compositions_model_1.Car);
        yield engine.setCar(car);
        yield engine.setCar(car2);
        assert.equal(yield car.engine(), null, 'Car1 hasn\'t engine');
        assert.equal(yield car2.engine(), engine, 'Car2 has engine');
        let engine2 = yield transaction.create(compositions_model_1.Engine);
        yield car2.setEngine(engine2);
        assert.equal(engine.carId, undefined, 'Owner of engine null 3 ');
        assert.equal(yield engine.car(), null, 'Owner of engine null 3');
        assert.equal(yield car2.engine(), engine2, 'Car2 has engine2');
        transaction.clear();
        let car3 = yield transaction.create(compositions_model_1.Car);
        let engine3 = yield transaction.create(compositions_model_1.Engine);
        yield engine3.setCar(car3);
        let data1 = transaction.saveToJson();
        transaction.clear();
        transaction.loadFromJson(data1);
        let data2 = transaction.saveToJson();
        assert.deepEqual(data1, data2, 'Restore test 1');
        transaction.destroy();
    });
}
function testLoad() {
    return __awaiter(this, void 0, void 0, function* () {
        let transaction = new index_1.Transaction();
        let car1 = yield transaction.create(compositions_model_1.Car);
        let engine1 = yield transaction.load(compositions_model_1.Engine, { carId: car1.uuid });
        assert.equal(yield car1.engine(), engine1, '(1) Owner of engine is car 1');
        assert.equal(yield engine1.car(), car1, '(2) Owner of engine is car 1');
        let car2 = yield transaction.create(compositions_model_1.Car);
        let engine2 = yield transaction.load(compositions_model_1.Engine, { carId: car2.uuid });
        assert.equal(yield engine2.car(), car2, '(1) Owner of engine 2  is car 2');
        assert.equal(yield car2.engine(), engine2, '(2) Owner of engine 2 is car 2');
        let car3 = yield transaction.load(compositions_model_1.Car, { id: 12, engine: { id: 10 } });
        let engine3 = yield car3.engine();
        assert.notEqual(engine3, null, 'Engine loaded');
        assert.equal(engine3.carId, car3.id, 'After load engine.carId === car.id');
        let engine4 = yield transaction.findOne(compositions_model_1.Engine, { id: 10 });
        assert.equal(engine3, engine4, 'Engine found');
        let i = 0;
        car3.enumChildren(children => {
            i++;
        });
        assert.equal(i, 1, 'Car a child');
        //DB test
        let scar = yield transaction.findOne(compositions_model_1.Car, { id: 1001 });
        assert.notEqual(scar, null, 'Car found');
        assert.equal(scar.id, 1001, 'Car id is 1001');
        let engine = yield scar.engine();
        assert.notEqual(engine, null, 'Car has engine ');
        assert.equal(engine.id, 2001, 'Engine id is 2001');
        yield engine.setName('v3');
        let cars = yield transaction.find(compositions_model_1.Car, {});
        let lc = cars.find(car => { return car.id === 1001; });
        assert.equal(scar, lc, 'Car found in cache');
        lc = cars.find(car => { return car.id === 1002; });
        assert.notEqual(lc, null, 'Car found in db');
        let data1 = transaction.saveToJson();
        transaction.clear();
        transaction.loadFromJson(data1);
        let data2 = transaction.saveToJson();
        assert.deepEqual(data1, data2, 'Restore test 2');
        transaction.destroy();
    });
}
function testRules() {
    return __awaiter(this, void 0, void 0, function* () {
        let transaction = new index_1.Transaction();
        let car = yield transaction.create(compositions_model_1.Car);
        let engine = yield transaction.create(compositions_model_1.Engine);
        yield car.setEngine(engine);
        assert.equal(car.engineChangedHits, 1, '(1) Rule called one time');
        assert.equal(engine.carChangedHits, 1, '(2) Rule called one time');
        yield car.setEngine(engine);
        assert.equal(car.engineChangedHits, 1, '(1) Rule called one time');
        assert.equal(engine.carChangedHits, 1, '(2) Rule called one time');
        yield car.setEngine(null);
        assert.equal(car.engineChangedHits, 2, '(1) Rule called 2 times');
        assert.equal(engine.carChangedHits, 2, '(2) Rule called 2 times');
        yield engine.setCar(car);
        assert.equal(car.engineChangedHits, 3, '(1) Rule called 3 times');
        assert.equal(engine.carChangedHits, 3, '(2) Rule called 3 times');
        yield engine.setCar(car);
        yield engine.setName('v8');
        assert.equal(yield car.engineName, 'v8', 'Rule propagation');
        let data1 = transaction.saveToJson();
        transaction.clear();
        transaction.loadFromJson(data1);
        let data2 = transaction.saveToJson();
        assert.deepEqual(data1, data2, 'Restore test 3');
        transaction.destroy();
    });
}
describe('Relation One to One, Composition', () => {
    before(function (done) {
        let dm = histria_utils_1.dbManager();
        dm.registerNameSpace('compositions', 'memory', { compositionsInParent: true });
        let store = dm.store('compositions');
        store.initNameSpace('compositions', {
            car: [
                {
                    id: 1001,
                    engineChangedHits: 0,
                    engineName: 'v1',
                    engine: {
                        id: 2001,
                        carId: 1001,
                        carChangedHits: 0,
                        name: 'v1'
                    }
                },
                {
                    id: 1002,
                    engineChangedHits: 0,
                    engineName: 'v2',
                    engine: {
                        id: 2002,
                        carId: 1002,
                        carChangedHits: 0,
                        name: 'v2'
                    }
                }
            ]
        });
        assert.equal(car_engine_rules_1.test, 1);
        index_1.loadRules(path.join(__dirname, 'model', 'rules')).then(() => {
            done();
        }).catch((ex) => {
            done(ex);
        });
    });
    it('One to one composition - create', function (done) {
        testCreate().then(function () {
            done();
        }).catch(function (ex) {
            done(ex);
        });
    });
    it('One to one composition - load', function (done) {
        testLoad().then(function () {
            done();
        }).catch(function (ex) {
            done(ex);
        });
    });
    it('One to one composition - rules', function (done) {
        testRules().then(function () {
            done();
        }).catch(function (ex) {
            done(ex);
        });
    });
    it('One to one composition - states errors', function (done) {
        done();
    });
});
//console.log(JSON.stringify(data, null, 2)); 
