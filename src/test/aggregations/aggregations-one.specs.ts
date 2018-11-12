import * as assert from 'assert';
import * as path from 'path';
import { Transaction, loadRules, modelManager } from '../../index';
import { Car, Driver } from './model/aggregations-model';

async function testCreate(): Promise<void> {
    const transaction = new Transaction();
    const car = await transaction.create<Car>(Car);
    const driver = await transaction.create<Driver>(Driver);
    await car.setDrivenBy(driver);

    const dd = await car.drivenBy();
    assert.equal(dd, driver, '(1) Driver drives the car');
    let parent = await driver.drives();
    assert.equal(car, parent, 'Driver drives the car');
    assert.equal(driver.drivesId, car.uuid, '(2) Driver drives the car');
    await driver.setDrives(null);
    assert.equal(driver.drivesId, undefined, '(1) Driver hasn\'t a car.');
    assert.equal(await driver.drives(), null, '(2) Driver hasn\'t a car.');

    await driver.setDrives(car);
    parent = await driver.drives();
    assert.equal(car, parent, 'Driver drives the car 1');
    assert.equal(driver.drivesId, car.uuid, 'Driver drives car.uuid ');

    await car.setDrivenBy(null);
    assert.equal(driver.drivesId, undefined, '(1) Driver hasn\'t a car 2 ');
    assert.equal(await driver.drives(), null, '(2) Driver hasn\'t a car 2');

    const car2 = await transaction.create<Car>(Car);
    await driver.setDrives(car);
    await driver.setDrives(car2);
    assert.equal(await car.drivenBy(), null, 'Car1 is stopped');
    assert.equal(await car2.drivenBy(), driver, 'Car2 is stopped');

    const driver2 = await transaction.create<Driver>(Driver);
    await car2.setDrivenBy(driver2);
    assert.equal(driver.drivesId, undefined, 'Driver hasn\'t a car 3 ');
    assert.equal(await driver.drives(), null, 'Driver hasn\'t a car 3');
    assert.equal(await car2.drivenBy(), driver2, 'Car2 is driven by driver2');

    const data1 = transaction.saveToJson();
    transaction.clear();
    await transaction.loadFromJson(data1, false);
    const data2 = transaction.saveToJson();
    assert.deepEqual(data1, data2, 'Test transaction save/restore');
    transaction.destroy();

}

async function testLoad(): Promise<void> {
    const transaction = new Transaction();
    const car1 = await transaction.create<Car>(Car);
    const driver1 = await transaction.load<Driver>(Driver, { drivesId: car1.uuid });

    assert.equal(await car1.drivenBy(), driver1, '(1) Driver 1 drivers car 1 ');
    assert.equal(await driver1.drives(), car1, '(2) Driver 1 drivers car 1 ');

    const car2 = await transaction.create<Car>(Car);
    const driver2 = await transaction.load<Driver>(Driver, { drivesId: car2.uuid });
    assert.equal(await driver2.drives(), car2, '(1) Driver 2 drivers car 2 ');
    assert.equal(await car2.drivenBy(), driver2, '(2) Driver 2 drivers car 2 ');

    const data1 = transaction.saveToJson();
    transaction.clear();
    await transaction.loadFromJson(data1, false);
    const data2 = transaction.saveToJson();
    assert.deepEqual(data1, data2, 'Test transaction save/restore');
    transaction.destroy();
}

async function testRules(): Promise<void> {
    const transaction = new Transaction();
    const car = await transaction.create<Car>(Car);
    const driver = await transaction.create<Driver>(Driver);
    await driver.setName('joe');
    await car.setDrivenBy(driver);
    assert.equal(driver.carChangedHits, 1, '(1) Rule called one time');
    assert.equal(car.driverName, 'joe', '(2) Rule called one time');

    await car.setDrivenBy(null);
    assert.equal(driver.carChangedHits, 2, '(1) Rule called 2 times');
    assert.equal(car.driverName, '', '(2) Rule called 2 times');

    await driver.setDrives(car);
    assert.equal(driver.carChangedHits, 3, '(1) Rule called  3 times');
    assert.equal(car.driverName, 'joe', '(2) Rule called  3 times');

    const data1 = transaction.saveToJson();
    transaction.clear();
    await transaction.loadFromJson(data1, false);
    const data2 = transaction.saveToJson();
    assert.deepEqual(data1, data2, 'Test transaction save/restore');

    transaction.destroy();
    const classes = modelManager().sortedClasses();
    assert.equal(classes.indexOf('aggregations.car') < classes.indexOf('aggregations.driver'), true, 'Song depends on Cd');

}

async function testRemove(): Promise<void> {
    let transaction = new Transaction();
    let driver = await transaction.create<Driver>(Driver);
    let car = await transaction.create<Car>(Car);
    await car.setDrivenBy(driver);
    await driver.remove();
    assert.equal(await car.drivenBy(), null, 'Car without driver');
    transaction.destroy();

    transaction = new Transaction();
    car = await transaction.create<Car>(Car);
    driver = await transaction.create<Driver>(Driver);
    const id = driver.id;

    await car.setDrivenBy(driver);
    await car.remove();

    assert.equal(await driver.drives(), null, 'Driver without car');
}

describe('Relation One to One, Aggregation', () => {
    before((done) => {
        loadRules(path.join(__dirname, 'model', 'rules')).then(() => {
            done();
        }).catch((ex) => {
            done(ex);
        });
    });
    it('One to one aggregation - create', (done) => {
        testCreate().then(() => {
            done();
        }).catch((ex) => {
            done(ex);
        });

    });
    it('One to one aggregation - load', (done) => {
        testLoad().then(() => {
            done();
        }).catch((ex) => {
            done(ex);
        });

    });
    it('One to one aggregation - rules', (done) => {
        testRules().then(() => {
            done();
        }).catch((ex) => {
            done(ex);
        });

    });
    it('One to one aggregation - remove', (done) => {
        testRemove().then(() => {
            done();
        }).catch((ex) => {
            done(ex);
        });

    });

});
