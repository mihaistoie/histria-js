import { IObservableObject } from '../interfaces';
import { ObjectArray, BaseObjectArray } from './base-array';
export declare class BaseHasMany<T extends IObservableObject> extends ObjectArray<T> {
    enumChildren(cb: (value: IObservableObject) => void, recursive: boolean): void;
}
export declare class HasManyComposition<T extends IObservableObject> extends BaseHasMany<T> {
    constructor(parent: IObservableObject, propertyName: string, relation: any, model: any[]);
    length(): Promise<number>;
    set(items: T[]): Promise<void>;
    destroy(): void;
    protected _afterItemRemoved(item: T, ii: number): Promise<void>;
    protected _afterItemAdded(item: T): Promise<void>;
    protected lazyLoad(): Promise<void>;
    private _notifyHooks;
    private _removed;
    private _added;
}
export declare class HasManyAggregation<T extends IObservableObject> extends BaseObjectArray<T> {
    private _loaded;
    set(items: T[]): Promise<void>;
    protected _afterItemRemoved(item: T, ii: number): Promise<void>;
    protected _afterItemAdded(item: T): Promise<void>;
    protected lazyLoad(): Promise<void>;
    private _updateInvSideAfterLazyLoading;
}
export declare class HasManyRefObject<T extends IObservableObject> extends BaseHasMany<T> {
    length(): Promise<number>;
    restoreFromCache(): void;
    unsubscribe(instance: T): void;
    set(items: T[]): Promise<void>;
    destroy(): void;
    protected _afterItemRemoved(item: T, ii: number): Promise<void>;
    protected _afterItemAdded(item: T): Promise<void>;
    protected lazyLoad(): Promise<void>;
    protected _itemModel(item: T): any;
    private _subscribe;
    private _notifyHooks;
    private _removed;
    private _added;
}
//# sourceMappingURL=role-has-many.d.ts.map