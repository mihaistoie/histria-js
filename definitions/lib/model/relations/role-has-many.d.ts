import { ObservableObject } from '../interfaces';
import { ObjectArray, BaseObjectArray } from './base-array';
export declare class HasManyComposition<T extends ObservableObject> extends ObjectArray<T> {
    constructor(parent: ObservableObject, propertyName: string, relation: any, model: any[]);
    enumChildren(cb: (value: ObservableObject) => void, recursive: boolean): void;
    private _removed(item, notifyRemove);
    private _added(item, notifyAdd);
    protected _afterRemoveItem(item: T, ii: number): Promise<void>;
    protected _afterAddItem(item: T): Promise<void>;
    set(items: T[]): Promise<void>;
    protected lazyLoad(): Promise<void>;
    destroy(): void;
}
export declare class HasManyAggregation<T extends ObservableObject> extends BaseObjectArray<T> {
    private _loaded;
    protected _afterRemoveItem(item: T, ii: number): Promise<void>;
    protected _afterAddItem(item: T): Promise<void>;
    protected lazyLoad(): Promise<void>;
    private _updateInvSideAfterLazyLoading(newValue);
}
