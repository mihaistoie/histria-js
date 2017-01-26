import { UserContext } from '../model/interfaces';
import { locale } from 'histria-utils';

export class TranContext implements UserContext {
    private _lang: string;
    private _country: string;
    constructor() {
        let that = this;
        that._lang = 'en';
        that._country = 'US';
    }
    public get lang(): string {
        return this._lang;
    }
    public set lang(value: string) {
        let that = this;
        if (value !== that._lang) {
            let olu = (that._lang || '').toUpperCase();
            that._lang = value;
            if (that._country === olu)
                that._country = (that._lang || '').toUpperCase();
        }
    }
    public get country(): string {
        return this._country;
    }
    public set country(value: string) {
        this._country = value;
    }
    public get locale(): any {
        let that = this;
        return locale[that._lang + '_' + that._country];
    }
    public formatNumber(value: number, decimals: number): string {
        return value.toFixed(decimals);
    }

}