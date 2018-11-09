"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const aggregations_model_1 = require("../aggregations-model");
const index_1 = require("../../../../index");
class CarEngineRules {
    static async afterEngineChanged(car, eventInfo) {
        let driver = await car.drivenBy();
        await car.setDriverName(driver ? driver.name : '');
    }
    static async afterCarChanged(driver, eventInfo) {
        let value = driver.carChangedHits;
        value++;
        await driver.setCarChangedHits(value);
    }
}
__decorate([
    index_1.propChanged(aggregations_model_1.Car, 'drivenBy')
], CarEngineRules, "afterEngineChanged", null);
__decorate([
    index_1.propChanged(aggregations_model_1.Driver, 'drives')
], CarEngineRules, "afterCarChanged", null);
exports.CarEngineRules = CarEngineRules;

//# sourceMappingURL=car-driver-rules.js.map
