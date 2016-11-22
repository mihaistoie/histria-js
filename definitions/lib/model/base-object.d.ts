import { ObservableObject, ObservableArray, EventInfo } from './instance';
import { ObjectStatus } from '../consts/consts';
export declare class InstanceState {
    protected _states: any;
    private _schema;
    private _parent;
    constructor(parent: ObservableObject, schema: any);
    destroy(): void;
}
export declare class Instance implements ObservableObject {
    protected _status: ObjectStatus;
    protected _parent: ObservableObject;
    protected _parentArray: ObservableArray;
    protected _children: any;
    protected _schema: any;
    protected _rootCache: ObservableObject;
    private _eventInfo;
    protected _model: any;
    protected _states: InstanceState;
    protected _propertyName: string;
    protected _getEventInfo(): EventInfo;
    getPath(propName?: string): string;
    getRoot(): ObservableObject;
    propertyChanged(propName: string, value: any, oldValue: any, eventInfo: EventInfo): void;
    stateChanged(propName: string, value: any, oldValue: any, eventInfo: EventInfo): void;
    protected init(): void;
    protected _setModel(value: any): void;
    protected createStates(): void;
    private _canExecutePropChangeRule();
    private _createProperties();
    modelState(propName: string): any;
    getOrSetProperty(propName: string, value?: any): Promise<any>;
    constructor(transaction: any, parent: ObservableObject, parentArray: ObservableArray, propertyName: string, value: any, options: {
        isCreate: boolean;
        isRestore: boolean;
    });
    destroy(): void;
    readonly states: InstanceState;
}
