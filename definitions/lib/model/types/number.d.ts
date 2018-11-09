import { ModelObject } from '../model-object';
export declare class BaseNumberValue {
    protected _parent: ModelObject;
    protected _decimals: number;
    protected _propertyName: string;
    constructor(parent: ModelObject, propertyName: string);
    destroy(): void;
    readonly value: number;
    setValue(value: number): Promise<number>;
    readonly decimals: number;
    setDecimals(value: number): Promise<number>;
    protected init(): void;
    protected _internalDecimals(): number;
    private _round;
}
export declare class IntegerValue extends BaseNumberValue {
}
export declare class NumberValue extends BaseNumberValue {
    readonly decimals: number;
    setDecimals(value: number): Promise<number>;
    protected _internalDecimals(): number;
    private _state;
}
//# sourceMappingURL=number.d.ts.map