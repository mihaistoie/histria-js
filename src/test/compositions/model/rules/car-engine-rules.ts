import { Car, Engine } from '../compositions-model';
import { propChanged, init, title, validate } from '../../../../index';

export class CarEngineRules {
    @propChanged(Car, 'engine')
    public static async afterEngineChanged(car: Car, eventInfo: any): Promise<void> {
        await car.setEngineChangedHits(car.engineChangedHits + 1);

    }
    @propChanged(Car, 'engine.name')
    public static async afterEngineNameChanged(car: Car, engine: Engine, eventInfo: any): Promise<void> {
        const ce = await car.engine();
        if (ce !== ce)
            throw 'Invalid rule propagation';
        await car.setEngineName(engine.name);

    }
    @propChanged(Engine, 'car')
    public static async afterCarChanged(engine: Engine, eventInfo: any): Promise<void> {
        await engine.setCarChangedHits(engine.carChangedHits + 1);
    }

}
