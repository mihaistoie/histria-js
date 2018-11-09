import { Cd, Song } from '../aggregations-model';
import { propChanged, addItem, rmvItem, setItems, init, title, validate } from '../../../../index';

export class CdRules {
    @propChanged(Song, 'cd')
    public static async afterCdChanged(song: Song, eventInfo: any): Promise<void> {
        await song.setCdChangedHits(song.cdChangedHits + 1);
    }
    @propChanged(Song, 'duration')
    public static async afterDurationChanged(song: Song, eventInfo: any, newValue: number, oldValue: number): Promise<void> {
        const cd = await song.cd();
        if (cd)
            await cd.setDuration(cd.duration - oldValue + newValue);
    }

    @addItem(Cd, 'songs')
    public static async afterAddItem(cd: Cd, eventInfo: any, song: Song): Promise<void> {
        await cd.setDuration(cd.duration + song.duration);
    }
    @rmvItem(Cd, 'songs')
    public static async afterRmvItem(cd: Cd, eventInfo: any, song: Song): Promise<void> {
        await cd.setDuration(cd.duration - song.duration);
    }
}
