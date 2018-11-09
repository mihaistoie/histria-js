"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../../index");
const car_1 = require("./car");
var car_2 = require("./car");
exports.Car = car_2.Car;
const cd_1 = require("./cd");
var cd_2 = require("./cd");
exports.Cd = cd_2.Cd;
const driver_1 = require("./driver");
var driver_2 = require("./driver");
exports.Driver = driver_2.Driver;
const song_1 = require("./song");
var song_2 = require("./song");
exports.Song = song_2.Song;
index_1.modelManager().registerClass(car_1.Car, car_1.CAR_SCHEMA);
index_1.modelManager().registerClass(cd_1.Cd, cd_1.CD_SCHEMA);
index_1.modelManager().registerClass(driver_1.Driver, driver_1.DRIVER_SCHEMA);
index_1.modelManager().registerClass(song_1.Song, song_1.SONG_SCHEMA);

//# sourceMappingURL=aggregations-model.js.map
