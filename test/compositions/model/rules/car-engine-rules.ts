import { Car } from '../car';
import { Engine } from '../engine';
import { propChanged, init, title, validate } from '../../../../src/index';


export class CarEngineRules {
    @propChanged(Car, 'engine')
    static async afterEngineChanged(car: Car, eventInfo: any): Promise<void> {
        let value = await car.engineChangedHits.value();
        value++;
        await car.engineChangedHits.value(value);

    }
    @propChanged(Engine, 'car')
    static async afterCarChanged(engine: Engine, eventInfo: any): Promise<void> {
        let value = await engine.carChangedHits.value();
        value++;
        await engine.carChangedHits.value(value);

    }
    
}



export var test = 1;