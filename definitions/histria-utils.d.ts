// Generated by dts-bundle v0.6.1
// Dependencies for this module:
//   ../fs

declare module 'histria-utils' {
    export { Instance } from 'histria-utils/lib/model/base-object';
    export { InstanceErrors } from 'histria-utils/lib/model/instance-errors';
    export { InstanceState } from 'histria-utils/lib/model/instance-state';
    export { ModelManager } from 'histria-utils/lib/model/model-manager';
    export { Transaction } from 'histria-utils/lib/factory/transaction';
    export { HasManyComposition, HasManyAggregation } from 'histria-utils/lib/model/roleHasMany';
    export { propChanged, addItem, rmvItem, setItems, init, title, loadRules, validate } from 'histria-utils/lib/model/rules';
    export { ErrorState } from 'histria-utils/lib/model/error-state';
    export { State, StringState, IdState, IntegerState, EnumState, NumberState, DateState, DateTimeState, RefArrayState, RefObjectState } from 'histria-utils/lib/model/state';
    export { IntegerValue, NumberValue } from 'histria-utils/lib/model/number';
    export { fs } from 'histria-utils/lib/utils/promises';
    export { classGenerator } from 'histria-utils/lib/generators/classgen';
    export { mongoFilter } from 'histria-utils/lib/db/mongo-filter';
}

declare module 'histria-utils/lib/model/base-object' {
    import { ObservableObject, EventInfo, ObjectStatus, MessageServerity, UserContext, TransactionContainer, EventType } from 'histria-utils/lib/model/interfaces';
    import { InstanceErrors } from 'histria-utils/lib/model/instance-errors';
    import { InstanceState } from 'histria-utils/lib/model/instance-state';
    export class Instance implements ObservableObject {
        protected _status: ObjectStatus;
        protected _transaction: TransactionContainer;
        protected _parent: ObservableObject;
        protected _children: any;
        protected _schema: any;
        protected _rootCache: ObservableObject;
        protected _model: any;
        protected _states: InstanceState;
        protected _errors: InstanceErrors;
        protected _propertyName: string;
        getRoleByName(roleName: string): any;
        rmvObjectFromRole(roleName: string, instance: ObservableObject): Promise<void>;
        addObjectToRole(roleName: string, instance: ObservableObject): Promise<void>;
        changeParent(newParent: ObservableObject, foreignPropName: string, localPropName: string, notify: boolean): Promise<void>;
        protected _getEventInfo(): EventInfo;
        readonly context: UserContext;
        readonly transaction: TransactionContainer;
        readonly parent: ObservableObject;
        readonly uuid: string;
        readonly isNew: boolean;
        getPath(propName?: string): string;
        readonly propertyName: string;
        getRoot(): ObservableObject;
        propertyChanged(propName: string, value: any, oldValue: any, eventInfo: EventInfo): void;
        stateChanged(propName: string, value: any, oldValue: any, eventInfo: EventInfo): void;
        protected init(): void;
        protected _setModel(value: any): void;
        protected createErrors(): void;
        protected createStates(): void;
        status: ObjectStatus;
        getSchema(propName?: string): any;
        isArrayComposition(propName: string): boolean;
        modelErrors(propName: string): {
            message: string;
            severity: MessageServerity;
        }[];
        modelState(propName: string): any;
        model(propName?: string): any;
        notifyOperation(propName: string, op: EventType, param: any): Promise<void>;
        changeProperty(propName: string, oldValue: any, newValue: any, hnd: any): Promise<void>;
        getOrSetProperty(propName: string, value?: any): Promise<any>;
        getPropertyByName(propName: string, value?: any): any;
        setPropertyByName(propName: string, value?: any): Promise<any>;
        afterCreated(): Promise<void>;
        validate(options?: {
            full: boolean;
        }): Promise<void>;
        constructor(transaction: TransactionContainer, parent: ObservableObject, propertyName: string, value: any, options: {
            isRestore: boolean;
        });
        destroy(): void;
        readonly $states: InstanceState;
        readonly $errors: InstanceErrors;
    }
}

declare module 'histria-utils/lib/model/instance-errors' {
    import { ObservableObject } from 'histria-utils/lib/model/interfaces';
    export class InstanceErrors {
        protected _messages: any;
        constructor(parent: ObservableObject, schema: any);
        destroy(): void;
    }
}

declare module 'histria-utils/lib/model/instance-state' {
    import { ObservableObject } from 'histria-utils/lib/model/interfaces';
    export class InstanceState {
        protected _states: any;
        constructor(parent: ObservableObject, schema: any);
        destroy(): void;
    }
}

declare module 'histria-utils/lib/model/model-manager' {
    import { EventType, EventInfo, ObservableObject } from 'histria-utils/lib/model/interfaces';
    export class ModelManager {
        constructor();
        createInstance<T extends ObservableObject>(classOfInstance: any, transaction: any, parent: ObservableObject, propertyName: string, value: any, options: {
            isRestore: boolean;
        }): T;
        classByName(className: string, namespace: string): any;
        registerClass(constructor: any, schema: any): void;
        rulesForInit(classOfInstance: any): any[];
        rulesObjValidate(classOfInstance: any): any[];
        rulesForPropChange(classOfInstance: any, propertyName: string): any[];
        rulesForPropValidate(classOfInstance: any, propertyName: string): any[];
        rulesForAddItem(classOfInstance: any, propertyName: string): any[];
        rulesForRmvItem(classOfInstance: any, propertyName: string): any[];
        rulesForSetItems(classOfInstance: any, propertyName: string): any[];
        setTitle(classOfInstance: any, method: any, title: string, description?: string): void;
        addValidateRule(classOfInstance: any, rule: any, ruleParams?: any): void;
        addRule(classOfInstance: any, ruleType: EventType, rule: any, ruleParams?: any): void;
    }
    export function initRules(eventInfo: EventInfo, classOfInstance: any, instances: any[], args?: any[]): Promise<void>;
    export function propagationRules(eventInfo: EventInfo, classOfInstance: any, instances: any[], args?: any[]): Promise<void>;
    export function propValidateRules(eventInfo: EventInfo, classOfInstance: any, instances: any[], args?: any[]): Promise<void>;
    export function objValidateRules(eventInfo: EventInfo, classOfInstance: any, instances: any[], args?: any[]): Promise<void>;
    export function addItemRules(eventInfo: EventInfo, classOfInstance: any, instances: any[], args?: any[]): Promise<void>;
    export function rmvItemRules(eventInfo: EventInfo, classOfInstance: any, instances: any[], args?: any[]): Promise<void>;
    export function setItemsRules(eventInfo: EventInfo, classOfInstance: any, instances: any[], args?: any[]): Promise<void>;
}

declare module 'histria-utils/lib/factory/transaction' {
    import { UserContext, TransactionContainer, EventType, EventInfo, ObservableObject } from 'histria-utils/lib/model/interfaces';
    export class Transaction implements TransactionContainer {
        constructor(ctx?: UserContext);
        readonly context: UserContext;
        emitInstanceEvent(eventType: EventType, eventInfo: EventInfo, instance: ObservableObject, ...args: any[]): Promise<void>;
        subscribe(eventType: EventType, handler: (eventInfo: EventInfo, classOfInstance: any, instance: any, args?: any[]) => Promise<void>): void;
        create<T extends ObservableObject>(classOfInstance: any): Promise<T>;
        restore<T extends ObservableObject>(classOfInstance: any, data: any): Promise<T>;
        load<T extends ObservableObject>(classOfInstance: any, data: any): Promise<T>;
        createInstance<T extends ObservableObject>(classOfInstance: any, parent: ObservableObject, propertyName: string, data: any, isRestore: boolean): T;
        destroy(): void;
        find<T extends ObservableObject>(classOfInstance: any, filter: any): Promise<T[]>;
        findOne<T extends ObservableObject>(classOfInstance: any, filter: any): Promise<T>;
    }
}

declare module 'histria-utils/lib/model/roleHasMany' {
    import { ObservableObject } from 'histria-utils/lib/model/interfaces';
    import { ObjectArray, BaseObjectArray } from 'histria-utils/lib/model/base-array';
    export class HasManyComposition<T extends ObservableObject> extends ObjectArray<T> {
        constructor(parent: ObservableObject, propertyName: string, relation: any, model: any[]);
        remove(element: T | number): Promise<T>;
        add(item: T, index?: number): Promise<T>;
        set(items: T[]): Promise<void>;
        protected lazyLoad(): Promise<void>;
    }
    export class HasManyAggregation<T extends ObservableObject> extends BaseObjectArray<T> {
        remove(element: T | number): Promise<T>;
        add(item: T, index?: number): Promise<T>;
        protected lazyLoad(): Promise<void>;
        protected _updateInvSideAfterLazyLoading(newValue: T): Promise<void>;
    }
}

declare module 'histria-utils/lib/model/rules' {
    export function title(targetClass: any, title: string, description?: string): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
    export function propChanged(targetClass: any, ...properties: string[]): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
    export function addItem(targetClass: any, propertyName: string): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
    export function rmvItem(targetClass: any, propertyName: string): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
    export function setItems(targetClass: any, propertyName: string): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
    export function validate(targetClass: any, ...properties: string[]): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
    export function init(targetClass: any): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
    export function loadRules(folder: string): Promise<void>;
}

declare module 'histria-utils/lib/model/error-state' {
    import { ObservableObject } from 'histria-utils/lib/model/interfaces';
    export class ErrorState {
        constructor(parent: ObservableObject, propertyName: string);
        error: string;
        hasErrors(): boolean;
        addException(e: Error): void;
        destroy(): void;
    }
}

declare module 'histria-utils/lib/model/state' {
    import { ObservableObject } from 'histria-utils/lib/model/interfaces';
    export class State {
        protected _parent: ObservableObject;
        protected _propertyName: string;
        protected _stateModel: any;
        protected init(): void;
        constructor(parent: ObservableObject, propertyName: string);
        destroy(): void;
        isDisabled: boolean;
        isHidden: boolean;
        isMandatory: boolean;
        isReadOnly: boolean;
    }
    export class IdState extends State {
    }
    export class StringState extends State {
        protected init(): void;
        maxLength: number;
        minLength: number;
    }
    export class NumberBaseState extends State {
        protected init(): void;
        exclusiveMaximum: boolean;
        exclusiveMinimum: boolean;
        minimum: number;
        maximum: number;
    }
    export class NumberState extends NumberBaseState {
        protected init(): void;
        decimals: number;
    }
    export class IntegerState extends NumberBaseState {
        protected init(): void;
    }
    export class DateState extends State {
    }
    export class DateTimeState extends State {
    }
    export class EnumState extends State {
    }
    export class ArrayState extends State {
    }
    export class RefObjectState extends State {
    }
    export class RefArrayState extends State {
    }
}

declare module 'histria-utils/lib/model/number' {
    import { Instance } from 'histria-utils/lib/model/base-object';
    export class BaseNumberValue {
        protected _parent: Instance;
        protected _decimals: number;
        protected _propertyName: string;
        constructor(parent: Instance, propertyName: string);
        protected _internalDecimals(): number;
        protected init(): void;
        destroy(): void;
        readonly value: number;
        setValue(value: number): Promise<number>;
        readonly decimals: number;
        setDecimals(value: number): Promise<number>;
    }
    export class IntegerValue extends BaseNumberValue {
    }
    export class NumberValue extends BaseNumberValue {
        readonly decimals: number;
        setDecimals(value: number): Promise<number>;
        protected _internalDecimals(): number;
    }
}

declare module 'histria-utils/lib/utils/promises' {
    import * as nfs from 'fs';
    export var fs: {
        lstat: (filePath: string) => Promise<nfs.Stats>;
        readdir: (folder: string) => Promise<string[]>;
        readFile: (fileName: string) => Promise<Buffer>;
        writeFile: (fileName: string, data: any) => Promise<void>;
    };
}

declare module 'histria-utils/lib/generators/classgen' {
    export function classGenerator(srcFolder: string, dstFolder: string, pathToLib?: string): Promise<void>;
}

declare module 'histria-utils/lib/db/mongo-filter' {
    export function findInArray(query: any, array: any[], options?: {
        findFirst?: boolean;
        transform?: (item: any) => any;
    }): any;
    export function findInMap(query: any, map: Map<any, any>, options?: {
        findFirst?: boolean;
        transform?: (item: any) => any;
    }): any;
    export function mongoFilter(query: any, array: any[]): any;
}

declare module 'histria-utils/lib/model/interfaces' {
    export enum ObjectStatus {
        idle = 0,
        restoring = 1,
        creating = 2,
    }
    export enum EventType {
        propChanged = 0,
        propValidate = 1,
        init = 2,
        objValidate = 3,
        addItem = 4,
        removeItem = 5,
        setItems = 6,
    }
    export enum MessageServerity {
        error = 0,
        warning = 1,
        success = 2,
    }
    export interface EventInfo {
        push(info: any): void;
        pop(): void;
        destroy(): void;
        isTriggeredBy(peopertyName: string, target: any): boolean;
    }
    export interface UserContext {
        lang: string;
        country: string;
        locale: any;
        formatNumber(value: number, decimals: number): string;
    }
    export interface Store {
        findOne(className: any, filter: any): Promise<any>;
        find(className: any, filter: any): Promise<any[]>;
    }
    export interface TransactionContainer {
        context: UserContext;
        findOne<T extends ObservableObject>(filter: any, classOfInstance: any): Promise<T>;
        find<T extends ObservableObject>(filter: any, classOfInstance: any): Promise<T[]>;
        emitInstanceEvent(eventType: EventType, eventInfo: EventInfo, instance: any, ...args: any[]): any;
        createInstance<T extends ObservableObject>(classOfInstance: any, parent: ObservableObject, propertyName: string, data: any, isRestore: boolean): T;
    }
    export interface ObservableObject {
        propertyChanged(propName: string, value: any, oldValue: any, eventInfo: EventInfo): void;
        stateChanged(stateName: string, value: any, oldValue: any, eventInfo?: EventInfo): void;
        changeProperty(propName: string, oldValue: any, newValue: any, hnd: any): Promise<void>;
        notifyOperation(propName: string, op: EventType, param: any): Promise<void>;
        model(propName?: string): any;
        modelState(propName: string): any;
        modelErrors(propName: string): {
            message: string;
            severity: MessageServerity;
        }[];
        getPath(propName?: string): string;
        getRoot(): ObservableObject;
        destroy(): any;
        getRoleByName(roleName: string): any;
        isArrayComposition(propertyName: string): boolean;
        addObjectToRole(roleName: string, instance: ObservableObject): Promise<void>;
        rmvObjectFromRole(roleName: string, instance: ObservableObject): Promise<void>;
        changeParent(newParent: ObservableObject, foreignPropName: string, localPropName: string, notify: boolean): Promise<void>;
        readonly parent: ObservableObject;
        readonly propertyName: string;
        readonly context: UserContext;
        readonly transaction: TransactionContainer;
        readonly uuid: string;
    }
    export interface ObservableArray {
        propertyChanged(propName: string, value: any, oldValue: any, eventInfo: EventInfo): void;
        stateChanged(stateName: string, value: any, oldValue: any, eventInfo?: EventInfo): void;
        getRoot(): ObservableObject;
        destroy(): any;
    }
}

declare module 'histria-utils/lib/model/base-array' {
    import { ObservableObject, ObservableArray, EventInfo } from 'histria-utils/lib/model/interfaces';
    export class BaseObjectArray<T extends ObservableObject> {
        protected _parent: ObservableObject;
        protected _items: T[];
        protected _propertyName: string;
        protected _relation: any;
        protected _refClass: any;
        constructor(parent: ObservableObject, propertyName: string, relation: any);
        destroy(): void;
        protected lazyLoad(): Promise<void>;
        toArray(): Promise<T[]>;
        indexOf(item: T): Promise<number>;
    }
    export class ObjectArray<T extends ObservableObject> extends BaseObjectArray<T> implements ObservableArray {
        protected _model: any;
        protected _isNull: boolean;
        protected _isUndefined: boolean;
        constructor(parent: ObservableObject, propertyName: string, relation: any, model: any[]);
        getRoot(): ObservableObject;
        propertyChanged(propName: string, value: any, oldValue: any, eventInfo: EventInfo): void;
        stateChanged(propName: string, value: any, oldValue: any, eventInfo: EventInfo): void;
        destroy(): void;
        protected destroyItems(): void;
        protected setValue(value?: T[]): void;
    }
}

