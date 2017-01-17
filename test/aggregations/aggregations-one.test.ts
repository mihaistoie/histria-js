import * as assert from 'assert';
import * as path from 'path';
import * as mochaUtils from 'mocha';
import { Transaction, loadRules } from '../../src/index';
import { Car } from './model/car';
import { Driver } from './model/driver';
import { test as test1 } from './model/rules/car-driver-rules';

async function testCreate(): Promise<void> {
    let transaction = new Transaction();
    let car = await transaction.create<Car>(Car);
    let driver = await transaction.create<Driver>(Driver);
    await car.drivenBy(driver);

    let dd = await car.drivenBy();
    assert.equal(dd, driver, '(1) Driver drives the car');
    let parent = await driver.drives();
    assert.equal(car, parent, 'Driver drives the car');
    assert.equal(await driver.drivesId, car.uuid, '(2) Driver drives the car');
    await driver.drives(null);
    assert.equal(await driver.drivesId, undefined, '(1) Driver hasn\'t a car.');
    assert.equal(await driver.drives(), null, '(2) Driver hasn\'t a car.');

    await driver.drives(car);
    parent = await driver.drives();
    assert.equal(car, parent, 'Driver drives the car 1');
    assert.equal(await driver.drivesId, car.uuid, 'Driver drives car.uuid ');

    await car.drivenBy(null);
    assert.equal(await driver.drivesId, undefined, '(1) Driver hasn\'t a car 2 ');
    assert.equal(await driver.drives(), null, '(2) Driver hasn\'t a car 2');

    let car2 = await transaction.create<Car>(Car);
    await driver.drives(car);
    await driver.drives(car2);
    assert.equal(await car.drivenBy(), null, 'Car1 is stopped');
    assert.equal(await car2.drivenBy(), driver, 'Car2 is stopped');

    let driver2 = await transaction.create<Driver>(Driver);
    await car2.drivenBy(driver2);
    assert.equal(await driver.drivesId, undefined, 'Driver hasn\'t a car 3 ');
    assert.equal(await driver.drives(), null, 'Driver hasn\'t a car 3');
    assert.equal(await car2.drivenBy(), driver2, 'Car2 is driven by driver2');

}


async function testLoad(): Promise<void> {
    let transaction = new Transaction();
    let car1 = await transaction.create<Car>(Car);
    let driver1 = await transaction.load<Driver>(Driver, { drivesId: car1.uuid });
   
    assert.equal(await car1.drivenBy(), driver1, '(1) Driver 1 drivers car 1 ');
    assert.equal(await driver1.drives(), car1, '(1) Driver 1 drivers car 1 ');

    let car2 = await transaction.create<Car>(Car);
    let driver2 = await transaction.load<Driver>(Driver, { drivesId: car2.uuid });
    assert.equal(await driver2.drives(), car2, '(1) Driver 2 drivers car 2 ');
    assert.equal(await car2.drivenBy(), driver2, '(1) Driver 2 drivers car 2 ');

}

async function testRules(): Promise<void> {
    let transaction = new Transaction();
    let car = await transaction.create<Car>(Car);
    let driver = await transaction.create<Driver>(Driver);
    await driver.name('joe');
    await car.drivenBy(driver);
    assert.equal(driver.carChangedHits.getValue(), 1, '(1) Rule called one time');
    assert.equal(car.getDriverName(), 'joe', '(2) Rule called one time');
   
    await car.drivenBy(null);
    assert.equal(driver.carChangedHits.getValue(), 2, '(1) Rule called 2 times');
    assert.equal(car.getDriverName(), '', '(2) Rule called 2 times');
  
    await driver.drives(car);
    assert.equal(driver.carChangedHits.getValue(), 3, '(1) Rule called  3 times');
    assert.equal(car.getDriverName(), 'joe', '(2) Rule called  3 times');
  
}


describe('Relation One to One, Aggregation', () => {
    before(function (done) {
        assert.equal(test1, 1);
        loadRules(path.join(__dirname, 'model', 'rules')).then(() => {
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
        })


    });
    it('One to one aggregation - load', function (done) {
        testLoad().then(function () {
            done();
        }).catch(function (ex) {
            done(ex);
        })


    });
    it('One to one aggregation - rules', function (done) {
        testRules().then(function () {
            done();
        }).catch(function (ex) {
            done(ex);
        })

    });

});
