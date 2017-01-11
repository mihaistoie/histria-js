import { ObservableObject } from './interfaces';
import { Role } from './role';
export declare class HasOne<T extends ObservableObject> extends Role<T> {
    protected _value: T;
    constructor(parent: ObservableObject, propertyName: string, relation: any);
    protected _getValue(): Promise<T>;
    protected _lazyLoad(): Promise<void>;
    private _updateParentRefs();
}
export declare class HasOneRef<T extends ObservableObject> extends HasOne<T> {
    constructor(parent: ObservableObject, propertyName: string, relation: any);
    protected _lazyLoad(): Promise<void>;
    protected _setValue(value: T): Promise<T>;
}
export declare class HasOneAC<T extends ObservableObject> extends HasOne<T> {
    protected _setValue(value: T): Promise<T>;
    protected _lazyLoad(): Promise<void>;
    protected _afterSetValue(newValue: any, oldValue: any): Promise<void>;
    protected _updateInvSide(newValue: any): Promise<void>;
}
export declare class HasOneComposition<T extends ObservableObject> extends HasOneAC<T> {
    protected _afterSetValue(newValue: any, oldValue: any): Promise<void>;
    protected _updateInvSide(newValue: any): Promise<void>;
}
export declare class HasOneAggregation<T extends ObservableObject> extends HasOneAC<T> {
    constructor(parent: ObservableObject, propertyName: string, relation: any);
    protected _setValue(value: T): Promise<T>;
    protected _afterSetValue(newValue: any, oldValue: any): Promise<void>;
    protected _updateInvSide(newValue: any): Promise<void>;
}
