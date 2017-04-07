
import * as assert from 'assert';
import * as path from 'path';
import { Transaction, loadRules } from '../../index';
import { DbDriver, dbManager, DbManager, IStore } from 'histria-utils';
import * as dbMemory from 'histria-db-memory';
import { Car, Engine } from './model/compositions-model';


async function testCreate(): Promise<void> {

    let transaction = new Transaction();

    let car = await transaction.create<Car>(Car);
    let engine = await transaction.create<Engine>(Engine);

    await car.setEngine(engine);

    let parent = await engine.car();
    assert.equal(car, parent, 'Owner of engine is car');
    assert.equal(engine.carId, car.uuid, 'Owner of engine is car');

    await engine.setCar(null);
    assert.equal(engine.carId, undefined, '(1) Owner of engine null');
    assert.equal(await engine.car(), null, '(2) Owner of engine null');

    await engine.setCar(car);
    parent = await engine.car();
    assert.equal(car, parent, 'Owner of engine is car 2 ');
    assert.equal(engine.carId, car.uuid, 'Owner of engine is car 2 ');

    await car.setEngine(null);
    assert.equal(engine.carId, undefined, 'Owner of engine null 2 ');
    assert.equal(await engine.car(), null, 'Owner of engine null 2');

    let car2 = await transaction.create<Car>(Car);
    await engine.setCar(car);
    await engine.setCar(car2);
    assert.equal(await car.engine(), null, 'Car1 hasn\'t engine');
    assert.equal(await car2.engine(), engine, 'Car2 has engine');

    let engine2 = await transaction.create<Engine>(Engine);
    await car2.setEngine(engine2);
    assert.equal(engine.carId, undefined, 'Owner of engine null 3 ');
    assert.equal(await engine.car(), null, 'Owner of engine null 3');
    assert.equal(await car2.engine(), engine2, 'Car2 has engine2');


    transaction.clear();
    let car3 = await transaction.create<Car>(Car);
    let engine3 = await transaction.create<Engine>(Engine);
    await engine3.setCar(car3);
    let data1 = transaction.saveToJson();
    transaction.clear();
    await transaction.loadFromJson(data1, false);
    let data2 = transaction.saveToJson();
    assert.deepEqual(data1, data2, 'Restore test 1');
    transaction.destroy();

}


async function testLoad(): Promise<void> {
    let transaction = new Transaction();
    let car1 = await transaction.create<Car>(Car);

    let engine1 = await transaction.load<Engine>(Engine, { carId: car1.uuid });
    assert.equal(await car1.engine(), engine1, '(1) Owner of engine is car 1');
    assert.equal(await engine1.car(), car1, '(2) Owner of engine is car 1');

    let car2 = await transaction.create<Car>(Car);
    let engine2 = await transaction.load<Engine>(Engine, { carId: car2.uuid });
    assert.equal(await engine2.car(), car2, '(1) Owner of engine 2  is car 2');
    assert.equal(await car2.engine(), engine2, '(2) Owner of engine 2 is car 2');

    let car3 = await transaction.load<Car>(Car, { id: 12, engine: { id: 10 } });
    let engine3 = await car3.engine();
    assert.notEqual(engine3, null, 'Engine loaded');
    assert.equal(engine3.carId, car3.id, 'After load engine.carId === car.id');
    let engine4 = await transaction.findOne<Engine>(Engine, { id: 10 });
    assert.equal(engine3, engine4, 'Engine found');

    let i = 0
    car3.enumChildren(children => {
        i++;
    });
    assert.equal(i, 1, 'Car a child');

    // DB test
    let scar = await transaction.findOne<Car>(Car, { id: 1001 })
    assert.notEqual(scar, null, 'Car found');
    assert.equal(scar.id, 1001, 'Car id is 1001');
    let engine = await scar.engine();
    assert.notEqual(engine, null, 'Car has engine ');
    assert.equal(engine.id, 2001, 'Engine id is 2001');
    await engine.setName('v3')

    let cars = await transaction.find<Car>(Car, {});
    let lc = cars.find(car => { return car.id === 1001 });
    assert.equal(scar, lc, 'Car found in cache');

    lc = cars.find(car => { return car.id === 1002 });
    assert.notEqual(lc, null, 'Car found in db');


    let data1 = transaction.saveToJson();
    transaction.clear();
    await transaction.loadFromJson(data1, false);
    let data2 = transaction.saveToJson();
    assert.deepEqual(data1, data2, 'Restore test 2');


    transaction.destroy();
}


async function testRules(): Promise<void> {
    let transaction = new Transaction();
    let car = await transaction.create<Car>(Car);
    let engine = await transaction.create<Engine>(Engine);
    await car.setEngine(engine);
    assert.equal(car.engineChangedHits, 1, '(1) Rule called one time');
    assert.equal(engine.carChangedHits, 1, '(2) Rule called one time');
    await car.setEngine(engine);
    assert.equal(car.engineChangedHits, 1, '(1) Rule called one time');
    assert.equal(engine.carChangedHits, 1, '(2) Rule called one time');
    await car.setEngine(null);
    assert.equal(car.engineChangedHits, 2, '(1) Rule called 2 times');
    assert.equal(engine.carChangedHits, 2, '(2) Rule called 2 times');

    await engine.setCar(car);
    assert.equal(car.engineChangedHits, 3, '(1) Rule called 3 times');
    assert.equal(engine.carChangedHits, 3, '(2) Rule called 3 times');

    await engine.setCar(car);
    await engine.setName('v8');
    assert.equal(await car.engineName, 'v8', 'Rule propagation');

    let data1 = transaction.saveToJson();
    transaction.clear();
    await transaction.loadFromJson(data1, false);
    let data2 = transaction.saveToJson();
    assert.deepEqual(data1, data2, 'Restore test 3');

    transaction.destroy();


}


describe('Relation One to One, Composition', () => {
    before(function (done) {
        let dm: DbManager = dbManager();
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

        loadRules(path.join(__dirname, 'model', 'rules')).then(() => {
            done();
        }).catch((ex) => {
            done(ex);
        });
    });
    it('One to one composition - create', (done) => {
        testCreate().then(() => {
            done();
        }).catch((ex) => {
            done(ex);
        })


    });
    it('One to one composition - load', (done) => {
        testLoad().then(() => {
            done();
        }).catch(function (ex) {
            done(ex);
        });
    });
    it('One to one composition - rules', (done) => {
        testRules().then(() => {
            done();
        }).catch((ex) => {
            done(ex);
        });

    });

    it('One to one composition - states errors', (done) => {
        done();

    });


});