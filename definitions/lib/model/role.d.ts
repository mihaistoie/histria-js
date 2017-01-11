import { ObservableObject } from './interfaces';
export declare class Role<T extends ObservableObject> {
    protected _value: T;
    protected _relation: any;
    protected _propertyName: any;
    protected _parent: ObservableObject;
    protected _refClass: any;
    constructor(parent: ObservableObject, propertyName: string, relation: any);
    internalSetValue(value: T): void;
    invRole(instance: any): any;
    value(value?: T): Promise<T>;
    protected _getValue(): Promise<T>;
    protected _setValue(value: T): Promise<T>;
    destroy(): void;
}
