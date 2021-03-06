import { IObservableObject } from '../interfaces';
export declare class RoleBase<T extends IObservableObject> {
    protected _parent: IObservableObject;
    protected _relation: any;
    protected _propertyName: any;
    protected _refClass: any;
    constructor(parent: IObservableObject, propertyName: string, relation: any);
    destroy(): void;
    readonly refIsPersistent: boolean;
}
export declare class Role<T extends IObservableObject> extends RoleBase<T> {
    protected _value: T;
    internalSetValue(value: T): void;
    getValue(): Promise<T>;
    setValue(value: T): Promise<void>;
    destroy(): void;
    protected _getValue(): Promise<T>;
    protected _setValue(value: T): Promise<void>;
    protected _checkValueBeforeSet(value: T): void;
}
//# sourceMappingURL=role.d.ts.map