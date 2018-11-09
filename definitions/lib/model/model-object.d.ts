import { IObservableObject, IFrameworkObject, IEventInfo, ObjectStatus, MessageServerity, IUserContext, ITransactionContainer, EventType, IChangePropertyOptions } from './interfaces';
import { InstanceErrors } from './states/instance-errors';
import { InstanceState } from './states/instance-state';
import { BaseInstance } from './base-instance';
export declare class ModelObject extends BaseInstance implements IObservableObject, IFrameworkObject {
    readonly owner: IObservableObject;
    readonly uuid: string;
    readonly isPersistent: boolean;
    readonly isNew: boolean;
    readonly isDeleted: boolean;
    readonly isDirty: boolean;
    readonly propertyName: string;
    readonly hasOwner: boolean;
    status: ObjectStatus;
    readonly $states: InstanceState;
    readonly $errors: InstanceErrors;
    context: IUserContext;
    transaction: ITransactionContainer;
    protected _status: ObjectStatus;
    protected _parent: IObservableObject;
    protected _listeners: Array<{
        listener: any;
        parent: IObservableObject;
        propertyName: string;
    }>;
    protected _loaded: any[];
    protected _children: any;
    protected _schema: any;
    protected _rootCache: IObservableObject;
    protected _model: any;
    protected _states: InstanceState;
    protected _errors: InstanceErrors;
    protected _propertyName: string;
    private _cacheViewsOfMe;
    private _afterCreateCalled;
    constructor(transaction: ITransactionContainer, parent: IObservableObject, propertyName: string, value: any, options: {
        isRestore: boolean;
    });
    addListener(listener: any, parent: IObservableObject, propertyName: string): void;
    rmvListener(listener: any): void;
    getListeners(noParent: boolean): Array<{
        instance: IObservableObject;
        propertyName: string;
        isOwner: boolean;
    }>;
    pushLoaded(cb: () => Promise<void>): void;
    getRoleByName(roleName: string): any;
    rmvObjectFromRole(roleName: string, instance: IObservableObject): Promise<void>;
    addObjectToRole(roleName: string, instance: IObservableObject): Promise<void>;
    changeParent(newParent: IObservableObject, foreignPropName: string, localPropName: string, notify: boolean): Promise<void>;
    markDirty(): Promise<boolean>;
    getPath(propName?: string): string;
    getRoot(): IObservableObject;
    changeState(propName: string, value: any, oldValue: any, eventInfo: IEventInfo): void;
    restored(): void;
    getSchema(propName?: string): any;
    isArrayComposition(propName: string): boolean;
    modelErrors(propName: string): Array<{
        message: string;
        severity: MessageServerity;
    }>;
    modelState(propName: string): any;
    model(propName?: string): any;
    setInstanceOptions(options: {
        external: boolean;
    }): void;
    remove(): Promise<void>;
    notifyOperation(propName: string, op: EventType, param: any): Promise<void>;
    viewOfMe<T extends IObservableObject>(classOfView: any): T;
    notifyHooks(propName: string, op: EventType, instance: IObservableObject): Promise<void>;
    execHooks(propName: string, op: EventType, source: IObservableObject): Promise<void>;
    changeProperty(propName: string, oldValue: any, newValue: any, hnd: any, options: IChangePropertyOptions): Promise<void>;
    getOrSetProperty(propName: string, value?: any): Promise<any>;
    getPropertyByName(propName: string): any;
    setPropertyByName(propName: string, value: any): Promise<any>;
    afterCreated(): Promise<void>;
    afterRestore(): void;
    enumChildren(cb: (value: IObservableObject) => void, recursive: boolean): void;
    validate(options?: {
        full: boolean;
    }): Promise<void>;
    destroy(): void;
    protected init(): void;
    protected _childRelationsChanged(path: string): void;
    protected _setModel(value: any): void;
    protected createErrors(): void;
    protected createStates(): void;
    private _createRelations;
    private _createViewRelations;
    private _createProperties;
    private beforePropertyChanged;
    private _remove;
    private _viewFactory;
    private _addException;
    private _emitInstanceEvent;
    private _errorByName;
}
//# sourceMappingURL=model-object.d.ts.map