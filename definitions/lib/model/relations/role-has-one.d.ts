import { IObservableObject, EventType } from '../interfaces';
import { Role } from './role';
export declare class HasOne<T extends IObservableObject> extends Role<T> {
    protected _value: T;
    constructor(parent: IObservableObject, propertyName: string, relation: any);
    protected _getValue(): Promise<T>;
    protected _lazyLoad(): Promise<void>;
}
export declare class HasOneRef<T extends IObservableObject> extends HasOne<T> {
    constructor(parent: IObservableObject, propertyName: string, relation: any);
    protected _lazyLoad(): Promise<void>;
    protected _setValue(value: T): Promise<void>;
}
export declare class HasOneAC<T extends IObservableObject> extends HasOne<T> {
    remove(instance: T): Promise<void>;
    protected _notifyHooks(value: IObservableObject, eventType: EventType): Promise<void>;
    protected _setValue(value: T): Promise<void>;
    protected _lazyLoad(): Promise<void>;
    protected _afterSetValue(newValue: T, oldValue: T): Promise<void>;
    protected _updateInvSideAfterLazyLoading(newValue: T): Promise<void>;
}
export declare class HasOneComposition<T extends IObservableObject> extends HasOneAC<T> {
    constructor(parent: IObservableObject, propertyName: string, relation: any);
    enumChildren(cb: (value: IObservableObject) => void, recursive: boolean): void;
    destroy(): void;
    protected _afterSetValue(newValue: T, oldValue: T): Promise<void>;
    protected _updateInvSideAfterLazyLoading(newValue: T): Promise<void>;
}
export declare class HasOneAggregation<T extends IObservableObject> extends HasOneAC<T> {
    constructor(parent: IObservableObject, propertyName: string, relation: any);
    protected _afterSetValue(newValue: T, oldValue: T): Promise<void>;
    protected _updateInvSideAfterLazyLoading(newValue: T): Promise<void>;
}
export declare class HasOneRefObject<T extends IObservableObject> extends HasOne<T> {
    readonly syncValue: T;
    protected _value: T;
    constructor(parent: IObservableObject, propertyName: string, relation: any);
    unsubscribe(instance: T): void;
    enumChildren(cb: (value: IObservableObject) => void, recursive: boolean): void;
    restoreFromCache(): void;
    destroy(): void;
    remove(instance: T): Promise<void>;
    protected _setValue(value: T): Promise<void>;
    protected _lazyLoad(): Promise<void>;
    private _notifyHooks;
    private _subscribe;
}
//# sourceMappingURL=role-has-one.d.ts.map