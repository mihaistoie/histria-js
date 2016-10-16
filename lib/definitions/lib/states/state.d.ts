export declare class AnyState {
    protected _parent: any;
    protected _schema: any;
    protected _propertyName: string;
    protected _stateModel: any;
    protected init(): void;
    constructor(parent: any, schema: any, propertyName: string);
    destroy(): void;
    isDisabled: boolean;
    isHidden: boolean;
    isMandatory: boolean;
}
export declare class StringState extends AnyState {
}
export declare class NumericState extends AnyState {
}
export declare class EnumState extends AnyState {
}
