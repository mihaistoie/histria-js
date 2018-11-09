export declare enum ObjectStatus {
    idle = 0,
    restoring = 1,
    creating = 2
}
export declare enum LogModule {
    hooks = 0,
    views = 1
}
export declare enum DebugLevel {
    message = 0,
    error = 1,
    debug = 2
}
export declare enum EventType {
    propChanged = 0,
    propValidate = 1,
    init = 2,
    objValidate = 3,
    addItem = 4,
    removeItem = 5,
    setItems = 6,
    removing = 7,
    removed = 8,
    editing = 9,
    edited = 10,
    saving = 11,
    saved = 12
}
export declare enum MessageServerity {
    error = 0,
    warning = 1,
    success = 2
}
export interface IEventInfo {
    isLazyLoading: boolean;
    push(info: any): void;
    pop(): void;
    destroy(): void;
    isTriggeredBy(peopertyName: string, target: any): boolean;
}
export interface IUserContext {
    lang: string;
    country: string;
    locale: any;
    formatNumber(value: number, decimals: number): string;
}
export interface IChangePropertyOptions {
    isLazyLoading: boolean;
}
export interface IFindOptions {
    onlyInCache?: boolean;
}
export interface ITransactionContainer {
    context: IUserContext;
    readonly eventInfo: IEventInfo;
    findOne<T extends IObservableObject>(filter: any, classOfInstance: any, options?: IFindOptions): Promise<T>;
    findOneInCache<T extends IObservableObject>(filter: any, classOfInstance: any): T;
    find<T extends IObservableObject>(filter: any, classOfInstance: any, options?: IFindOptions): Promise<T[]>;
    emitInstanceEvent(eventType: EventType, eventInfo: IEventInfo, instance: any, ...args: any[]): Promise<boolean>;
    notifyHooks(eventType: EventType, instance: IObservableObject, source: IObservableObject, propertyName: string): Promise<void>;
    createInstance<T extends IObservableObject>(classOfInstance: any, parent: IObservableObject, propertyName: string, data: any, isRestore: boolean): T;
    removeInstance(instance: IObservableObject): void;
    remove(instance: IObservableObject): void;
    log(module: LogModule, message: string, debugLevel?: DebugLevel): void;
    create<T extends IObservableObject>(classOfInstance: any, options?: {
        external: boolean;
    }): Promise<T>;
    save(): Promise<void>;
    cancel(): Promise<void>;
}
export interface IFrameworkObject {
    notifyHooks(propName: string, op: EventType, instance: IObservableObject): Promise<void>;
    execHooks(propName: string, op: EventType, source: IObservableObject): Promise<void>;
    setInstanceOptions(options: {
        external: boolean;
    }): void;
}
export interface IObservableObject {
    readonly hasOwner: boolean;
    readonly owner: IObservableObject;
    readonly propertyName: string;
    readonly context: IUserContext;
    readonly transaction: ITransactionContainer;
    readonly uuid: string;
    readonly status: ObjectStatus;
    readonly isNew: boolean;
    readonly isDirty: boolean;
    readonly isDeleted: boolean;
    readonly isPersistent: boolean;
    changeState(stateName: string, value: any, oldValue: any, eventInfo?: IEventInfo): void;
    changeProperty(propName: string, oldValue: any, newValue: any, hnd: any, options: IChangePropertyOptions): Promise<void>;
    notifyOperation(propName: string, op: EventType, param: any): Promise<void>;
    model(propName?: string): any;
    modelState(propName: string): any;
    modelErrors(propName: string): Array<{
        message: string;
        severity: MessageServerity;
    }>;
    getPath(propName?: string): string;
    getRoot(): IObservableObject;
    destroy(): void;
    getRoleByName(roleName: string): any;
    isArrayComposition(propertyName: string): boolean;
    addObjectToRole(roleName: string, instance: IObservableObject): Promise<void>;
    rmvObjectFromRole(roleName: string, instance: IObservableObject): Promise<void>;
    changeParent(newParent: IObservableObject, foreignPropName: string, localPropName: string, notify: boolean): Promise<void>;
    enumChildren(cb: (value: IObservableObject) => void, recursive: boolean): void;
    viewOfMe<T extends IObservableObject>(classOfView: any): T;
    getPropertyByName(propName: string): any;
    setPropertyByName(propName: string, value: any): Promise<any>;
    addListener(listener: any, parent: IObservableObject, propertyName: string): void;
    getListeners(noParent: boolean): Array<{
        instance: IObservableObject;
        propertyName: string;
        isOwner: boolean;
    }>;
    rmvListener(listener: any): void;
    restored(): void;
    pushLoaded(cb: () => Promise<void>): void;
    remove(): Promise<void>;
}
export interface IObservableArray {
    getRoot(): IObservableObject;
    destroy(): void;
}
//# sourceMappingURL=interfaces.d.ts.map