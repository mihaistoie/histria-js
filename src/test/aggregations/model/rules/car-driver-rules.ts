import { Car, Driver } from '../aggregations-model';
import { propChanged, init, title, validate } from '../../../../index';

export class CarEngineRules {
    @propChanged(Car, 'drivenBy')
    public static async afterEngineChanged(car: Car, eventInfo: any): Promise<void> {
        const driver = await car.drivenBy();
        await car.setDriverName(driver ? driver.name : '');
    }

    @propChanged(Driver, 'drives')
    public static async afterCarChanged(driver: Driver, eventInfo: any): Promise<void> {
        let value = driver.carChangedHits;
        value++;
        await driver.setCarChangedHits(value);

    }

}
