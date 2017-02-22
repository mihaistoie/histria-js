import {modelManager} from '../../../src/index';

import {Car, CAR_SCHEMA} from './car';
export {Car} from './car';
import {Cd, CD_SCHEMA} from './cd';
export {Cd} from './cd';
import {Driver, DRIVER_SCHEMA} from './driver';
export {Driver} from './driver';
import {Song, SONG_SCHEMA} from './song';
export {Song} from './song';
modelManager().registerClass(Car, CAR_SCHEMA);
modelManager().registerClass(Cd, CD_SCHEMA);
modelManager().registerClass(Driver, DRIVER_SCHEMA);
modelManager().registerClass(Song, SONG_SCHEMA);