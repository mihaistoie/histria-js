export enum ObjectStatus {
    idle = 0,
    restoring = 1,
    creating = 2
}

export enum LogModule {
    hooks = 0
}


export enum DebugLevel {
    message = 0,
    error = 1,
    debug = 2
}

export enum EventType {
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

export enum MessageServerity {
    error = 0,
    warning = 1,
    success = 2
}

export interface EventInfo {
    push(info: any): void
    pop(): void;
    destroy(): void;
    isTriggeredBy(peopertyName: string, target: any): boolean;
    isLazyLoading: boolean;
}



export interface UserContext {
    lang: string;
    country: string;
    locale: any;
    formatNumber(value: number, decimals: number): string
}

export type ChangePropertyOptions = {
    isLazyLoading: boolean
}

export type FindOptions = { onlyInCache?: boolean };
export interface TransactionContainer {
    context: UserContext;
    findOne<T extends ObservableObject>(filter: any, classOfInstance: any, options?: FindOptions): Promise<T>;
    findOneInCache<T extends ObservableObject>(filter: any, classOfInstance: any): T;
    find<T extends ObservableObject>(filter: any, classOfInstance: any, options?: FindOptions): Promise<T[]>;
    emitInstanceEvent(eventType: EventType, eventInfo: EventInfo, instance: any, ...args: any[]): Promise<boolean>;
    notifyHooks(eventType: EventType, instance: ObservableObject, source: ObservableObject, propertyName: string): Promise<void>;
    createInstance<T extends ObservableObject>(classOfInstance: any, parent: ObservableObject, propertyName: string, data: any, isRestore: boolean): T;
    removeInstance(instance: ObservableObject): void;
    remove(instance: ObservableObject): void;
    log(module: LogModule, message: string, debugLevel?: DebugLevel): void;
    create<T extends ObservableObject>(classOfInstance: any): Promise<T>;

    save(): Promise<void>;
    cancel(): Promise<void>;
    readonly eventInfo: EventInfo;
}


export interface ObservableObject {
    changeState(stateName: string, value: any, oldValue: any, eventInfo?: EventInfo): void;
    changeProperty(propName: string, oldValue: any, newValue: any, hnd: any, options: ChangePropertyOptions): Promise<void>;
    notifyOperation(propName: string, op: EventType, param: any): Promise<void>;
    notifyHooks(propName: string, op: EventType, instance: ObservableObject): Promise<void>;
    execHooks(propName: string, op: EventType, source: ObservableObject): Promise<void>;
    model(propName?: string): any;
    modelState(propName: string): any;
    modelErrors(propName: string): { message: string, severity: MessageServerity }[];
    getPath(propName?: string): string;
    getRoot(): ObservableObject;
    destroy(): void;
    getRoleByName(roleName: string): any;
    isArrayComposition(propertyName: string): boolean
    addObjectToRole(roleName: string, instance: ObservableObject): Promise<void>;
    rmvObjectFromRole(roleName: string, instance: ObservableObject): Promise<void>;
    changeParent(newParent: ObservableObject, foreignPropName: string, localPropName: string, notify: boolean): Promise<void>;
    enumChildren(cb: (value: ObservableObject) => void, recursive: boolean): void;
    viewOfMe<T extends ObservableObject>(classOfView: any): Promise<T>
    getPropertyByName(propName: string): any;
    setPropertyByName(propName: string, value: any): Promise<any>;
    addListener(listener: any, parent: ObservableObject, propertyName: string): void;
    getListeners(noParent: boolean): { instance: ObservableObject, propertyName: string, isOwner: boolean }[];
    rmvListener(listener: any): void;
    restored(): void;
    pushLoaded(cb: () => Promise<void>): void;
    remove(): Promise<void>;
    readonly hasOwner: boolean;
    readonly owner: ObservableObject;
    readonly propertyName: string;
    readonly context: UserContext;
    readonly transaction: TransactionContainer;
    readonly uuid: string;
    readonly status: ObjectStatus;
    readonly isNew: boolean;
    readonly isDirty: boolean;
    readonly isDeleted: boolean;
    readonly isPersistent: boolean;
}

export interface ObservableArray {
    getRoot(): ObservableObject;
    destroy(): void;
}


