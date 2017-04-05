export enum ObjectStatus {
    idle = 0,
    restoring = 1,
    creating = 2
}

export enum EventType {
    propChanged = 0,
    propValidate = 1,
    init = 2,
    objValidate = 3,
    addItem = 4,
    removeItem = 5,
    setItems = 6
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
}



export interface UserContext {
    lang: string;
    country: string;
    locale: any;
    formatNumber(value: number, decimals: number): string
}

export type FindOptions = { onlyInCache?: boolean };
export interface TransactionContainer {
    context: UserContext;
    remove(instance: ObservableObject): void;
    findOne<T extends ObservableObject>(filter: any, classOfInstance: any, options?: FindOptions): Promise<T>;
    find<T extends ObservableObject>(filter: any, classOfInstance: any, options?: FindOptions): Promise<T[]>;
    emitInstanceEvent(eventType: EventType, eventInfo: EventInfo, instance: any, ...args: any[]): void;
    createInstance<T extends ObservableObject>(classOfInstance: any, parent: ObservableObject, propertyName: string, data: any, isRestore: boolean): T;
    removeInstance(classOfInstance: any, instance: ObservableObject): void;
    readonly eventInfo: EventInfo;
}


export interface ObservableObject {
    changeState(stateName: string, value: any, oldValue: any, eventInfo?: EventInfo): void;
    changeProperty(propName: string, oldValue: any, newValue: any, hnd: any): Promise<void>;
    notifyOperation(propName: string, op: EventType, param: any): Promise<void>;
    model(propName?: string): any;
    modelState(propName: string): any;
    modelErrors(propName: string): { message: string, severity: MessageServerity }[];
    getPath(propName?: string): string;
    getRoot(): ObservableObject;
    destroy(): void;
    standalone(): boolean;
    getRoleByName(roleName: string): any;
    isArrayComposition(propertyName: string): boolean
    addObjectToRole(roleName: string, instance: ObservableObject): Promise<void>;
    rmvObjectFromRole(roleName: string, instance: ObservableObject): Promise<void>;
    changeParent(newParent: ObservableObject, foreignPropName: string, localPropName: string, notify: boolean): Promise<void>;
    enumChildren(cb: (value: ObservableObject) => void): void;
    getPropertyByName(propName: string): any;
    setPropertyByName(propName: string, value: any): Promise<any>;
    addListener(listener: any, parent: ObservableObject, propertyName: string): void;
    getListeners(): {instance: ObservableObject, propertyName: string, isOwner: boolean}[];
    rmvListener(listener: any): void;
    readonly parent: ObservableObject;
    readonly propertyName: string;
    readonly context: UserContext;
    readonly transaction: TransactionContainer;
    readonly uuid: string;
    readonly status: ObjectStatus;
    readonly isNew: boolean;
    readonly isDirty: boolean;
}

export interface ObservableArray {
    getRoot(): ObservableObject;
    destroy(): void;
}


