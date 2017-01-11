import { ObservableObject } from './interfaces';
import { Role } from './role';
export declare class BaseBelongsTo<T extends ObservableObject> extends Role<T> {
    protected _value: T;
    constructor(parent: ObservableObject, propertyName: string, relation: any);
    destroy(): void;
}
export declare class AggregationBelongsTo<T extends ObservableObject> extends BaseBelongsTo<T> {
}
export declare class CompositionBelongsTo<T extends ObservableObject> extends BaseBelongsTo<T> {
    constructor(parent: ObservableObject, propertyName: string, relation: any);
    protected _lazyLoad(): Promise<T>;
    protected _getValue(): Promise<T>;
    protected _setValue(value: T): Promise<T>;
    destroy(): void;
}
