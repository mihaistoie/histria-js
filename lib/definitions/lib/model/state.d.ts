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
}
export declare class StringState extends State {
}
export declare class NumericState extends State {
}
export declare class EnumState extends State {
}
