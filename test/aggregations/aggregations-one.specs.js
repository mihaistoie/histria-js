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
        let car = yield transaction.create(aggregations_model_1.Car);
        let driver = yield transaction.create(aggregations_model_1.Driver);
        yield car.setDrivenBy(driver);
        let dd = yield car.drivenBy();
        assert.equal(dd, driver, '(1) Driver drives the car');
        let parent = yield driver.drives();
        assert.equal(car, parent, 'Driver drives the car');
        assert.equal(driver.drivesId, car.uuid, '(2) Driver drives the car');
        yield driver.setDrives(null);
        assert.equal(driver.drivesId, undefined, '(1) Driver hasn\'t a car.');
        assert.equal(yield driver.drives(), null, '(2) Driver hasn\'t a car.');
        yield driver.setDrives(car);
        parent = yield driver.drives();
        assert.equal(car, parent, 'Driver drives the car 1');
        assert.equal(driver.drivesId, car.uuid, 'Driver drives car.uuid ');
        yield car.setDrivenBy(null);
        assert.equal(driver.drivesId, undefined, '(1) Driver hasn\'t a car 2 ');
        assert.equal(yield driver.drives(), null, '(2) Driver hasn\'t a car 2');
        let car2 = yield transaction.create(aggregations_model_1.Car);
        yield driver.setDrives(car);
        yield driver.setDrives(car2);
        assert.equal(yield car.drivenBy(), null, 'Car1 is stopped');
        assert.equal(yield car2.drivenBy(), driver, 'Car2 is stopped');
        let driver2 = yield transaction.create(aggregations_model_1.Driver);
        yield car2.setDrivenBy(driver2);
        assert.equal(driver.drivesId, undefined, 'Driver hasn\'t a car 3 ');
        assert.equal(yield driver.drives(), null, 'Driver hasn\'t a car 3');
        assert.equal(yield car2.drivenBy(), driver2, 'Car2 is driven by driver2');
        let data1 = transaction.saveToJson();
        transaction.clear();
        transaction.loadFromJson(data1);
        let data2 = transaction.saveToJson();
        assert.deepEqual(data1, data2, 'Test transaction save/restore');
        transaction.destroy();
    });
}
function testLoad() {
    return __awaiter(this, void 0, void 0, function* () {
        let transaction = new index_1.Transaction();
        let car1 = yield transaction.create(aggregations_model_1.Car);
        let driver1 = yield transaction.load(aggregations_model_1.Driver, { drivesId: car1.uuid });
        assert.equal(yield car1.drivenBy(), driver1, '(1) Driver 1 drivers car 1 ');
        assert.equal(yield driver1.drives(), car1, '(1) Driver 1 drivers car 1 ');
        let car2 = yield transaction.create(aggregations_model_1.Car);
        let driver2 = yield transaction.load(aggregations_model_1.Driver, { drivesId: car2.uuid });
        assert.equal(yield driver2.drives(), car2, '(1) Driver 2 drivers car 2 ');
        assert.equal(yield car2.drivenBy(), driver2, '(1) Driver 2 drivers car 2 ');
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
        let car = yield transaction.create(aggregations_model_1.Car);
        let driver = yield transaction.create(aggregations_model_1.Driver);
        yield driver.setName('joe');
        yield car.setDrivenBy(driver);
        assert.equal(driver.carChangedHits, 1, '(1) Rule called one time');
        assert.equal(car.driverName, 'joe', '(2) Rule called one time');
        yield car.setDrivenBy(null);
        assert.equal(driver.carChangedHits, 2, '(1) Rule called 2 times');
        assert.equal(car.driverName, '', '(2) Rule called 2 times');
        yield driver.setDrives(car);
        assert.equal(driver.carChangedHits, 3, '(1) Rule called  3 times');
        assert.equal(car.driverName, 'joe', '(2) Rule called  3 times');
        let data1 = transaction.saveToJson();
        transaction.clear();
        transaction.loadFromJson(data1);
        let data2 = transaction.saveToJson();
        assert.deepEqual(data1, data2, 'Test transaction save/restore');
        transaction.destroy();
        let classes = index_1.modelManager().sortedClasses();
        assert.equal(classes.indexOf('aggregations.car') < classes.indexOf('aggregations.driver'), true, 'Song depends on Cd');
    });
}
describe('Relation One to One, Aggregation', () => {
    before(function (done) {
        index_1.loadRules(path.join(__dirname, 'model', 'rules')).then(() => {
            done();
        }).catch((ex) => {
            done(ex);
        });
    });
    it('One to one aggregation - create', function (done) {
        testCreate().then(function () {
            done();
        }).catch(function (ex) {
            done(ex);
        });
    });
    it('One to one aggregation - load', function (done) {
        testLoad().then(function () {
            done();
        }).catch(function (ex) {
            done(ex);
        });
    });
    it('One to one aggregation - rules', function (done) {
        testRules().then(function () {
            done();
        }).catch(function (ex) {
            done(ex);
        });
    });
});
