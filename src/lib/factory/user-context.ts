import { IUserContext } from '../model/interfaces';
import { locale } from 'histria-utils';

export class TranContext implements IUserContext {
    private _lang: string;
    private _country: string;
    constructor() {
        this._lang = 'en';
        this._country = 'US';
    }
    public get lang(): string {
        return this._lang;
    }
    public set lang(value: string) {
        if (value !== this._lang) {
            const olu = (this._lang || '').toUpperCase();
            this._lang = value;
            if (this._country === olu)
                this._country = (this._lang || '').toUpperCase();
        }
    }
    public get country(): string {
        return this._country;
    }
    public set country(value: string) {
        this._country = value;
    }
    public get locale(): any {
        return locale(this._lang + '_' + this._country);
    }
    public formatNumber(value: number, decimals: number): string {
        return value.toFixed(decimals);
    }

}