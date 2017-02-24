import { Car, Engine } from '../compositions-model';
import { propChanged, init, title, validate } from '../../../../src/index';


export class CarEngineRules {
    @propChanged(Car, 'engine')
    static async afterEngineChanged(car: Car, eventInfo: any): Promise<void> {
        await car.setEngineChangedHits(car.engineChangedHits + 1);

    }
    @propChanged(Car, 'engine.name')
    static async afterEngineNameChanged(car: Car, engine: Engine, eventInfo: any): Promise<void> {
        let ce = await car.engine();
        if (ce !== ce)
            throw "Invalid rule propagation";
        await car.setEngineName(engine.name)

    }
    @propChanged(Engine, 'car')
    static async afterCarChanged(engine: Engine, eventInfo: any): Promise<void> {
        await engine.setCarChangedHits(engine.carChangedHits + 1);
    }

}

export var test = 1;