import { Instance } from './base-object';
export declare class BaseNumberValue {
    protected _parent: Instance;
    protected _decimals: number;
    protected _propertyName: string;
    constructor(parent: Instance, propertyName: string);
    private _round(value);
    protected init(): void;
    destroy(): void;
    value(value?: number): Promise<number>;
    decimals: number;
}
export declare class IntegerValue extends BaseNumberValue {
}
export declare class NumberValue extends BaseNumberValue {
    decimals: number;
}
