import { ObservableObject } from './instance';
export declare class State {
    protected _parent: ObservableObject;
    protected _schema: any;
    protected _propertyName: string;
    protected _stateModel: any;
    protected init(): void;
    constructor(parent: ObservableObject, schema: any, propertyName: string);
    destroy(): void;
    isDisabled: boolean;
    isHidden: boolean;
    isMandatory: boolean;
    isReadOnly: boolean;
}
export declare class StringState extends State {
}
export declare class NumberState extends State {
}
export declare class IntegerState extends State {
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
