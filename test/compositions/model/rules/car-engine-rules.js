"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const compositions_model_1 = require("../compositions-model");
const index_1 = require("../../../../index");
class CarEngineRules {
    static afterEngineChanged(car, eventInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            yield car.setEngineChangedHits(car.engineChangedHits + 1);
        });
    }
    static afterEngineNameChanged(car, engine, eventInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            let ce = yield car.engine();
            if (ce !== ce)
                throw "Invalid rule propagation";
            yield car.setEngineName(engine.name);
        });
    }
    static afterCarChanged(engine, eventInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            yield engine.setCarChangedHits(engine.carChangedHits + 1);
        });
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
exports.test = 1;
