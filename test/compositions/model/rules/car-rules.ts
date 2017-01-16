import { Car } from '../car';
import { propChanged, init, title, validate } from '../../../../src/index';


export class CarRules {
    @propChanged(Car, 'engine')
    static async afterEngineChanged(car: Car, eventInfo: any): Promise<void> {
        let value = await car.engineChangedHits.value();
        value++;
        await car.engineChangedHits.value(value);
        value = await car.engineChangedHits.value();

    }
}

export var test = 1;