import { Car } from '../car';
import { Driver } from '../driver';
import { propChanged, init, title, validate } from '../../../../src/index';


export class CarEngineRules {
    @propChanged(Car, 'drivenBy')
    static async afterEngineChanged(car: Car, eventInfo: any): Promise<void> {
        let driver = await car.drivenBy();
        await car.setDriverName(driver ? driver.getName() : '');
    }

    @propChanged(Driver, 'drives')
    static async afterCarChanged(driver: Driver, eventInfo: any): Promise<void> {
        let value = await driver.carChangedHits.value();
        value++;
        await driver.carChangedHits.value(value);

    }

}



export var test = 1;