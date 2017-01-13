
import * as assert from 'assert';
import * as path from 'path';
import * as mochaUtils from 'mocha';
import { Transaction, loadRules } from '../../src/index';

import { Order } from './model/order';
import { OrderItem } from './model/orderItem';

async function testCreate(): Promise<void> {
    let transaction = new Transaction();
    let order = await transaction.create<Order>(Order);
    let item1 = await transaction.create<OrderItem>(OrderItem);
    let item2 = await transaction.create<OrderItem>(OrderItem);
    await order.items.add(item1);
    let parent = await item1.order();
    assert.equal(order, parent, '(1) Owner of orderItem1 is order');
    assert.equal(await item1.orderId.value(), order.uuid, '(2) Owner of orderItem1 is order');
    
    /*
    
    await engine.car(null);
    assert.equal(await engine.carId.value(), undefined, '(1) Owner of engine null');
    assert.equal(await engine.car(), null, '(2) Owner of engine null');

    await engine.car(car);
    parent = await engine.car();
    assert.equal(car, parent, 'Owner of engine is car 2 ');
    assert.equal(await engine.carId.value(), car.uuid, 'Owner of engine is car 2 ');

    await car.engine(null);
    assert.equal(await engine.carId.value(), undefined, 'Owner of engine null 2 ');
    assert.equal(await engine.car(), null, 'Owner of engine null 2');

    let car2 = await transaction.create<Car>(Car);
    await engine.car(car);
    await engine.car(car2);
    assert.equal(await car.engine(), null, 'Car1 hasn\'t engine');
    assert.equal(await car2.engine(), engine, 'Car2 has engine');

    let engine2 = await transaction.create<Engine>(Engine);
    await car2.engine(engine2);
    assert.equal(await engine.carId.value(), undefined, 'Owner of engine null 3 ');
    assert.equal(await engine.car(), null, 'Owner of engine null 3');
    assert.equal(await car2.engine(), engine2, 'Car2 has engine2');
    */

}


async function testLoad(): Promise<void> {
    /*
    let transaction = new Transaction();
    let car1 = await transaction.create<Car>(Car);
    let engine1 = await transaction.load<Engine>(Engine, { carId: car1.uuid });
    assert.equal(await car1.engine(), engine1, '(1) Owner of engine is car 1');
    assert.equal(await engine1.car(), car1, '(2) Owner of engine is car 1');

    let car2 = await transaction.create<Car>(Car);
    let engine2 = await transaction.load<Engine>(Engine, { carId: car2.uuid });
    assert.equal(await engine2.car(), car2, '(1) Owner of engine 2  is car 2');
    assert.equal(await car2.engine(), engine2, '(2) Owner of engine 2 is car 2');
    */

}

describe('Relation One to Many, Composition', () => {
    before(function (done) {
        //assert.equal(test, 1);
        //loadRules(path.join(__dirname, 'model', 'rules')).then(() => {
        //    done();
        //}).catch((ex) => {
        //    done(ex);
        //});
        done();
    });
    it('One to Many composition - create', function (done) {
        testCreate().then(function () {
            done();
        }).catch(function (ex) {
            done(ex);
        })


    });
    it('One to Many composition - load', function (done) {
        testLoad().then(function () {
            done();
        }).catch(function (ex) {
            done(ex);
        })


    });
    it('One to one Many - rules', function (done) {
        done();

    });

    it('One to one Many - states errors', function (done) {
        done();

    });


});
