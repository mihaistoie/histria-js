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
const aggregations_model_1 = require("../aggregations-model");
const index_1 = require("../../../../index");
class CdRules {
    static afterCdChanged(song, eventInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            yield song.setCdChangedHits(song.cdChangedHits + 1);
        });
    }
    static afterDurationChanged(song, eventInfo, newValue, oldValue) {
        return __awaiter(this, void 0, void 0, function* () {
            let cd = yield song.cd();
            if (cd)
                yield cd.setDuration(cd.duration - oldValue + newValue);
        });
    }
    static afterAddItem(cd, eventInfo, song) {
        return __awaiter(this, void 0, void 0, function* () {
            yield cd.setDuration(cd.duration + song.duration);
        });
    }
    static afterRmvItem(cd, eventInfo, song) {
        return __awaiter(this, void 0, void 0, function* () {
            yield cd.setDuration(cd.duration - song.duration);
        });
    }
}
__decorate([
    index_1.propChanged(aggregations_model_1.Song, 'cd')
], CdRules, "afterCdChanged", null);
__decorate([
    index_1.propChanged(aggregations_model_1.Song, 'duration')
], CdRules, "afterDurationChanged", null);
__decorate([
    index_1.addItem(aggregations_model_1.Cd, 'songs')
], CdRules, "afterAddItem", null);
__decorate([
    index_1.rmvItem(aggregations_model_1.Cd, 'songs')
], CdRules, "afterRmvItem", null);
exports.CdRules = CdRules;
exports.test = 1;
