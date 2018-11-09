import { ObservableObject } from '../interfaces';
import { Role } from './role';
export declare class BaseBelongsTo<T extends ObservableObject> extends Role<T> {
    protected _lazyLoad(): Promise<T>;
}
export declare class AggregationBelongsTo<T extends ObservableObject> extends BaseBelongsTo<T> {
    protected _getValue(): Promise<T>;
    internalSetValue(value: any): void;
    internalSetValueAndNotify(newValue: any, oldValue: any): Promise<void>;
    protected _setValue(value: T): Promise<void>;
}
export declare class CompositionBelongsTo<T extends ObservableObject> extends BaseBelongsTo<T> {
    protected _getValue(): Promise<T>;
    internalSetValue(value: any): void;
    protected _setValue(value: T): Promise<void>;
}
//# sourceMappingURL=role-belongs-to.d.ts.map