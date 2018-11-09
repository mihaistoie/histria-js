import { IObservableObject, IObservableArray } from '../interfaces';
import { RoleBase } from './role';
export declare class BaseObjectArray<T extends IObservableObject> extends RoleBase<T> {
    protected _items: T[];
    constructor(parent: IObservableObject, propertyName: string, relation: any);
    destroy(): void;
    toArray(): Promise<T[]>;
    indexOf(item: T): Promise<number>;
    remove(element: T | number): Promise<T>;
    add(item: T, index?: number): Promise<T>;
    protected _checkValueBeforeAdd(value: T): void;
    protected lazyLoad(): Promise<void>;
    protected _afterItemRemoved(item: T, ii: number): Promise<void>;
    protected _afterItemAdded(item: T): Promise<void>;
}
export declare class ObjectArray<T extends IObservableObject> extends BaseObjectArray<T> implements IObservableArray {
    protected _model: any;
    protected _isNull: boolean;
    protected _isUndefined: boolean;
    constructor(parent: IObservableObject, propertyName: string, relation: any, model: any[]);
    getRoot(): IObservableObject;
    add(item: T, index?: number): Promise<T>;
    destroy(): void;
    protected destroyItems(): void;
    protected setValue(value?: T[]): void;
    protected _itemModel(item: T): any;
}
//# sourceMappingURL=base-array.d.ts.map