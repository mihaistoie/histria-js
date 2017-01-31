import { Instance } from '../base-object';
export declare class BaseNumberValue {
    protected _parent: Instance;
    protected _decimals: number;
    protected _propertyName: string;
    constructor(parent: Instance, propertyName: string);
    protected _internalDecimals(): number;
    private _round(value);
    protected init(): void;
    destroy(): void;
    readonly value: number;
    setValue(value: number): Promise<number>;
    readonly decimals: number;
    setDecimals(value: number): Promise<number>;
}
export declare class IntegerValue extends BaseNumberValue {
}
export declare class NumberValue extends BaseNumberValue {
    private _state();
    readonly decimals: number;
    setDecimals(value: number): Promise<number>;
    protected _internalDecimals(): number;
}
