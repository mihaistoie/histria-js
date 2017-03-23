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
class CdRules {
    static async afterCdChanged(song, eventInfo) {
        await song.setCdChangedHits(song.cdChangedHits + 1);
    }
    static async afterDurationChanged(song, eventInfo, newValue, oldValue) {
        let cd = await song.cd();
        if (cd)
            await cd.setDuration(cd.duration - oldValue + newValue);
    }
    static async afterAddItem(cd, eventInfo, song) {
        await cd.setDuration(cd.duration + song.duration);
    }
    static async afterRmvItem(cd, eventInfo, song) {
        await cd.setDuration(cd.duration - song.duration);
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
