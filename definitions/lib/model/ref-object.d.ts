import { ObservableObject } from './interfaces';
export declare class BaseHasOne<T extends ObservableObject> {
    protected _value: T;
    protected _relation: any;
    protected _propertyName: any;
    protected _parent: ObservableObject;
    constructor(parent: any, propertyName: string, relation: any);
    value(value?: T): Promise<T>;
    destroy(): void;
    private _getValue();
    private _setValue(value);
    private _lazyLoad();
    private _updateParentRefs();
}
export declare class HasOneRef<T extends ObservableObject> extends BaseHasOne<T> {
    constructor(parent: any, propertyName: string, relation: any);
}
