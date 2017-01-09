import { ObservableObject } from './interfaces';
import { Role } from './role';
export declare class BaseHasOne<T extends ObservableObject> extends Role<T> {
    protected _value: T;
    constructor(parent: ObservableObject, propertyName: string, relation: any);
    destroy(): void;
    value(value?: T): Promise<T>;
    private _getValue();
    private _setValue(value);
    protected _lazyLoad(): Promise<void>;
    protected _notifyInvRel(value: ObservableObject, oldValue: ObservableObject): Promise<void>;
    protected _recyleRefInstance(value: any): Promise<void>;
    protected _afterSetValue(): void;
    private _updateParentRefs();
}
export declare class HasOneRef<T extends ObservableObject> extends BaseHasOne<T> {
    constructor(parent: ObservableObject, propertyName: string, relation: any);
}
export declare class HasOneComposition<T extends ObservableObject> extends BaseHasOne<T> {
    constructor(parent: ObservableObject, propertyName: string, relation: any);
}
export declare class HasOneAggregation<T extends ObservableObject> extends BaseHasOne<T> {
    constructor(parent: ObservableObject, propertyName: string, relation: any);
}
