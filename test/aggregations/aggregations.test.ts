import * as assert from 'assert';
import * as path from 'path';
import * as mochaUtils from 'mocha';
import { Transaction, loadRules } from '../../src/index';
import { Car } from './model/car';
import { Driver } from './model/driver';

async function testCreate(): Promise<void> {
    let transaction = new Transaction();
    let car = await transaction.create<Car>(Car);
    let driver = await transaction.create<Driver>(Driver);
    await car.drivenBy(driver);
    let parent = await driver.drives();
    assert.equal(car, parent, 'Driver drives the car');
    assert.equal(await driver.drivesId.value(), car.uuid, 'Driver drives the car');
    await driver.drives(null);
    assert.equal(await driver.drivesId.value(), undefined, 'Driver hasn\'t a car.');
    assert.equal(await driver.drives(), null, 'Driver hasn\'t a car.');

    await driver.drives(car);
    parent = await driver.drives();
    assert.equal(car, parent, 'Driver drives the car 1');
    assert.equal(await driver.drivesId.value(), car.uuid, 'Driver drives car.uuid ');

    await car.drivenBy(null);
    assert.equal(await driver.drivesId.value(), undefined, 'Driver hasn\'t a car 2 ');
    assert.equal(await driver.drives(), null, 'Driver hasn\'t a car 2');

    let car2 = await transaction.create<Car>(Car);
    await driver.drives(car);
    await driver.drives(car2);
    assert.equal(await car.drivenBy(), null, 'Car1 is stopped');
    assert.equal(await car2.drivenBy(), driver, 'Car2 is stopped');

    let driver2 = await transaction.create<Driver>(Driver);
    await car2.drivenBy(driver2);
    assert.equal(await driver.drivesId.value(), undefined, 'Driver hasn\'t a car 3 ');
    assert.equal(await driver.drives(), null, 'Driver hasn\'t a car 3');
    assert.equal(await car2.drivenBy(), driver2, 'Car2 is driven by driver2');

}


describe('Relation One to One, Aggregation', () => {
    before(function (done) {
        //assert.equal(test, 1);
        //loadRules(path.join(__dirname, 'model', 'rules')).then(() => {
        //    done();
        //}).catch((ex) => {
        //    done(ex);
        //});
        done();
    });
    it('One to one aggregation - create', function (done) {
        testCreate().then(function () {
            done();
        }).catch(function (ex) {
            done(ex);
        })


    });

});
