import { ObservableObject } from '../interfaces';
import { Role } from './role';
export declare class BaseBelongsTo<T extends ObservableObject> extends Role<T> {
    protected _value: T;
    constructor(parent: ObservableObject, propertyName: string, relation: any);
    protected _lazyLoad(): Promise<T>;
    destroy(): void;
}
export declare class AggregationBelongsTo<T extends ObservableObject> extends BaseBelongsTo<T> {
    protected _getValue(): Promise<T>;
    internalSetValue(value: any): void;
    internalSetValueAndNotify(newValue: any, oldValue: any): Promise<void>;
    protected _setValue(value: T): Promise<T>;
}
export declare class CompositionBelongsTo<T extends ObservableObject> extends BaseBelongsTo<T> {
    protected _getValue(): Promise<T>;
    internalSetValue(value: any): void;
    protected _setValue(value: T): Promise<T>;
}
