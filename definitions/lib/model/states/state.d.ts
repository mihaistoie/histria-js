import { IObservableObject } from '../interfaces';
export declare class State {
    protected _parent: IObservableObject;
    protected _propertyName: string;
    protected _stateModel: any;
    constructor(parent: IObservableObject, propertyName: string);
    serialize(): any;
    destroy(): void;
    isDisabled: boolean;
    isHidden: boolean;
    isMandatory: boolean;
    isReadOnly: boolean;
    protected init(): void;
}
export declare class BooleanState extends State {
}
export declare class IdState extends State {
}
export declare class StringState extends State {
    maxLength: number;
    minLength: number;
}
export declare class NumberBaseState extends State {
    exclusiveMaximum: boolean;
    exclusiveMinimum: boolean;
    minimum: number;
    maximum: number;
}
export declare class NumberState extends NumberBaseState {
    decimals: number;
}
export declare class IntegerState extends NumberBaseState {
}
export declare class DateState extends State {
}
export declare class DateTimeState extends State {
}
export declare class EnumState extends State {
}
export declare class ArrayState extends State {
}
export declare class RefObjectState extends State {
}
export declare class RefArrayState extends State {
}
//# sourceMappingURL=state.d.ts.map