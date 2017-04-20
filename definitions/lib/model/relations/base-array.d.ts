import { ObservableObject, ObservableArray } from '../interfaces';
import { RoleBase } from './role';
export declare class BaseObjectArray<T extends ObservableObject> extends RoleBase<T> {
    protected _items: T[];
    constructor(parent: ObservableObject, propertyName: string, relation: any);
    destroy(): void;
    protected _checkValueBeforeAdd(value: T): void;
    protected lazyLoad(): Promise<void>;
    toArray(): Promise<T[]>;
    indexOf(item: T): Promise<number>;
    remove(element: T | number): Promise<T>;
    add(item: T, index?: number): Promise<T>;
    protected _afterRemoveItem(item: T, ii: number): Promise<void>;
    protected _afterAddItem(item: T): Promise<void>;
}
export declare class ObjectArray<T extends ObservableObject> extends BaseObjectArray<T> implements ObservableArray {
    protected _model: any;
    protected _isNull: boolean;
    protected _isUndefined: boolean;
    constructor(parent: ObservableObject, propertyName: string, relation: any, model: any[]);
    getRoot(): ObservableObject;
    destroy(): void;
    protected destroyItems(): void;
    protected setValue(value?: T[]): void;
    add(item: T, index?: number): Promise<T>;
}
