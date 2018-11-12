"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const compositions_model_1 = require("../compositions-model");
const index_1 = require("../../../../index");
class CarEngineRules {
    static async afterEngineChanged(car, eventInfo) {
        await car.setEngineChangedHits(car.engineChangedHits + 1);
    }
    static async afterEngineNameChanged(car, engine, eventInfo) {
        const ce = await car.engine();
        if (ce !== ce)
            throw 'Invalid rule propagation';
        await car.setEngineName(engine.name);
    }
    static async afterCarChanged(engine, eventInfo) {
        await engine.setCarChangedHits(engine.carChangedHits + 1);
    }
}
__decorate([
    index_1.propChanged(compositions_model_1.Car, 'engine')
], CarEngineRules, "afterEngineChanged", null);
__decorate([
    index_1.propChanged(compositions_model_1.Car, 'engine.name')
], CarEngineRules, "afterEngineNameChanged", null);
__decorate([
    index_1.propChanged(compositions_model_1.Engine, 'car')
], CarEngineRules, "afterCarChanged", null);
exports.CarEngineRules = CarEngineRules;

//# sourceMappingURL=car-engine-rules.js.map
