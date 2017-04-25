import { ObservableObject } from '../interfaces';
export declare class RoleBase<T extends ObservableObject> {
    protected _parent: ObservableObject;
    protected _relation: any;
    protected _propertyName: any;
    protected _refClass: any;
    constructor(parent: ObservableObject, propertyName: string, relation: any);
    destroy(): void;
}
export declare class Role<T extends ObservableObject> extends RoleBase<T> {
    protected _value: T;
    internalSetValue(value: T): void;
    getValue(): Promise<T>;
    setValue(value: T): Promise<void>;
    protected _getValue(): Promise<T>;
    protected _setValue(value: T): Promise<void>;
    protected _checkValueBeforeSet(value: T): void;
    destroy(): void;
}
