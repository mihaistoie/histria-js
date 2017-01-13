import { ObservableObject } from './interfaces';
import { ObjectArray } from './base-array';
export declare class HasManyComposition<T extends ObservableObject> extends ObjectArray<T> {
    protected _refClass: any;
    constructor(parent: ObservableObject, propertyName: string, relation: any, model: any[]);
    destroy(): void;
    protected lazyLoad(): Promise<void>;
}
