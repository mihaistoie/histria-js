import { ObservableObject, ObservableArray } from './instance';
export declare class Instance implements ObservableObject {
    protected _parent: ObservableObject;
    protected _parentArray: ObservableObject;
    protected _children: any;
    protected _schema: any;
    protected _model: any;
    protected _state: any;
    protected _propertyName: string;
    propertyChanged(propName: string, value: any, oldValue: any, callStackInfo?: any): void;
    stateChanged(propName: string, value: any, oldValue: any, callStackInfo?: any): void;
    protected init(): void;
    protected _setModel(value: any): void;
    modelState(propName: string): any;
    protected getOrSetProperty(propName: string, value?: any): Promise<any>;
    constructor(transaction: any, parent: ObservableObject, parentArray: ObservableArray, propertyName: string, value: any);
    finalize(): void;
}
