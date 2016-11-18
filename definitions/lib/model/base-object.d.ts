import { ObservableObject, ObservableArray } from './instance';
export declare class InstanceState {
    protected _states: any;
    private _schema;
    private _parent;
    constructor(parent: ObservableObject, schema: any);
    destroy(): void;
}
export declare class Instance implements ObservableObject {
    protected _parent: ObservableObject;
    protected _parentArray: ObservableObject;
    protected _children: any;
    protected _schema: any;
    protected _model: any;
    protected _states: InstanceState;
    protected _propertyName: string;
    propertyChanged(propName: string, value: any, oldValue: any, callStackInfo?: any): void;
    stateChanged(propName: string, value: any, oldValue: any, callStackInfo?: any): void;
    protected init(): void;
    protected _setModel(value: any): void;
    protected createStates(): void;
    private _createProperties();
    modelState(propName: string): any;
    getOrSetProperty(propName: string, value?: any): Promise<any>;
    constructor(transaction: any, parent: ObservableObject, parentArray: ObservableArray, propertyName: string, value: any);
    dstroy(): void;
    readonly states: InstanceState;
}
