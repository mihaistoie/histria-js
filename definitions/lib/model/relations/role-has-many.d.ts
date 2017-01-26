import { ObservableObject } from '../interfaces';
import { ObjectArray, BaseObjectArray } from './base-array';
export declare class HasManyComposition<T extends ObservableObject> extends ObjectArray<T> {
    constructor(parent: ObservableObject, propertyName: string, relation: any, model: any[]);
    enumChildren(cb: (value: ObservableObject) => void): void;
    private _afterRemoveItem(item, notifyRemove);
    private _afterAddItem(item, notifyAdd);
    remove(element: T | number): Promise<T>;
    add(item: T, index?: number): Promise<T>;
    set(items: T[]): Promise<void>;
    protected lazyLoad(): Promise<void>;
}
export declare class HasManyAggregation<T extends ObservableObject> extends BaseObjectArray<T> {
    private _loaded;
    remove(element: T | number): Promise<T>;
    add(item: T, index?: number): Promise<T>;
    protected lazyLoad(): Promise<void>;
    protected _updateInvSideAfterLazyLoading(newValue: T): Promise<void>;
}
