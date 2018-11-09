import { UserContext } from '../model/interfaces';
export declare class TranContext implements UserContext {
    private _lang;
    private _country;
    constructor();
    lang: string;
    country: string;
    readonly locale: any;
    formatNumber(value: number, decimals: number): string;
}
//# sourceMappingURL=user-context.d.ts.map