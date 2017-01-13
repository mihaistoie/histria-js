import { ObservableObject } from './interfaces';
import { ObjectArray } from './base-array';
export declare class HasManyComposition<T extends ObservableObject> extends ObjectArray<T> {
    protected _refClass: any;
    constructor(parent: ObservableObject, propertyName: string, relation: any, model: any[]);
    destroy(): void;
    toArray(): Promise<T[]>;
    remove(element: T | number): Promise<T>;
    add(item: T, index?: number): Promise<T>;
    indexOf(item: T): Promise<number>;
    protected lazyLoad(): Promise<void>;
}
