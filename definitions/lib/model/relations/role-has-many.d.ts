import { ObservableObject } from '../interfaces';
import { ObjectArray, BaseObjectArray } from './base-array';
export declare class BaseHasMany<T extends ObservableObject> extends ObjectArray<T> {
    enumChildren(cb: (value: ObservableObject) => void, recursive: boolean): void;
}
export declare class HasManyComposition<T extends ObservableObject> extends BaseHasMany<T> {
    constructor(parent: ObservableObject, propertyName: string, relation: any, model: any[]);
    length(): Promise<number>;
    private _notifyHooks(value, eventType);
    private _removed(item, notifyRemove);
    private _added(item, notifyAdd);
    protected _afterItemRemoved(item: T, ii: number): Promise<void>;
    protected _afterItemAdded(item: T): Promise<void>;
    set(items: T[]): Promise<void>;
    protected lazyLoad(): Promise<void>;
    destroy(): void;
}
export declare class HasManyAggregation<T extends ObservableObject> extends BaseObjectArray<T> {
    private _loaded;
    protected _afterItemRemoved(item: T, ii: number): Promise<void>;
    protected _afterItemAdded(item: T): Promise<void>;
    set(items: T[]): Promise<void>;
    protected lazyLoad(): Promise<void>;
    private _updateInvSideAfterLazyLoading(newValue);
}
export declare class HasManyRefObject<T extends ObservableObject> extends BaseHasMany<T> {
    length(): Promise<number>;
    private _subscribe(value);
    private _notifyHooks(value, eventType);
    restoreFromCache(): void;
    unsubscribe(instance: T): void;
    private _removed(item, notifyRemove);
    private _added(item, notifyAdd);
    protected _afterItemRemoved(item: T, ii: number): Promise<void>;
    protected _afterItemAdded(item: T): Promise<void>;
    protected lazyLoad(): Promise<void>;
    protected _itemModel(item: T): any;
    set(items: T[]): Promise<void>;
    destroy(): void;
}
