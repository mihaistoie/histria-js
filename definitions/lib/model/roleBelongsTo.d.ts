import { ObservableObject } from './interfaces';
import { Role } from './role';
export declare class BaseBelongsTo<T extends ObservableObject> extends Role<T> {
    protected _value: T;
    constructor(parent: ObservableObject, propertyName: string, relation: any);
    value(value?: T): Promise<T>;
    protected _getValue(): Promise<T>;
    protected _setValue(value: T): Promise<T>;
    destroy(): void;
}
export declare class CompositionBelongsTo<T extends ObservableObject> extends BaseBelongsTo<T> {
    constructor(parent: ObservableObject, propertyName: string, relation: any);
    protected _getValue(): Promise<T>;
    protected _setValue(value: T): Promise<T>;
    destroy(): void;
    protected updateParent(value: any): Promise<void>;
}
