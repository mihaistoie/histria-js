import { Cd } from '../cd';
import { Song } from '../song';
import { propChanged, addItem, rmvItem, setItems, init, title, validate } from '../../../../src/index';


export class CdRules {
    @propChanged(Song, 'cd')
    static async afterCdChanged(song: Song, eventInfo: any): Promise<void> {
        await song.cdChangedHits.setValue(song.cdChangedHits.getValue() + 1);
    }
    @propChanged(Song, 'duration')
    static async afterDurationChanged(song: Song, eventInfo: any, oldValue: number, newValue: number): Promise<void> {
       // await song.cdChangedHits.setValue(song.cdChangedHits.getValue() + 1);
    }

    @addItem(Cd, 'songs')
    static async afterAddItem(cd: Cd, eventInfo: any, song: Song): Promise<void> {

    }
    @rmvItem(Cd, 'songs')
    static async afterRmvItem(cd: Cd, eventInfo: any, song: Song): Promise<void> {
    }
}

export var test = 1;