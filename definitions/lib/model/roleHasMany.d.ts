import { ObservableObject } from './interfaces';
import { ObjectArray, BaseObjectArray } from './base-array';
export declare class HasManyComposition<T extends ObservableObject> extends ObjectArray<T> {
    remove(element: T | number): Promise<T>;
    add(item: T, index?: number): Promise<T>;
    protected lazyLoad(): Promise<void>;
}
export declare class HasManyAggregation<T extends ObservableObject> extends BaseObjectArray<T> {
    private _loaded;
    remove(element: T | number): Promise<T>;
    add(item: T, index?: number): Promise<T>;
    protected lazyLoad(): Promise<void>;
    protected _updateInvSideAfterLazyLoading(newValue: T): Promise<void>;
}
