import { Car, Driver } from '../aggregations-model';
import { propChanged, init, title, validate } from '../../../../index';


export class CarEngineRules {
    @propChanged(Car, 'drivenBy')
    static async afterEngineChanged(car: Car, eventInfo: any): Promise<void> {
        let driver = await car.drivenBy();
        await car.setDriverName(driver ? driver.name : '');
    }

    @propChanged(Driver, 'drives')
    static async afterCarChanged(driver: Driver, eventInfo: any): Promise<void> {
        let value = driver.carChangedHits;
        value++;
        await driver.setCarChangedHits(value);

    }

}



export var test = 1;