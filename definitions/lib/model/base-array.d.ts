import { ObservableObject, ObservableArray, EventInfo } from './interfaces';
export declare class BaseObjectArray<T extends ObservableObject> {
    protected _parent: ObservableObject;
    protected _items: T[];
    protected _propertyName: string;
    protected _relation: any;
    protected _refClass: any;
    constructor(parent: ObservableObject, propertyName: string, relation: any);
    destroy(): void;
    protected lazyLoad(): Promise<void>;
    toArray(): Promise<T[]>;
    indexOf(item: T): Promise<number>;
}
export declare class ObjectArray<T extends ObservableObject> extends BaseObjectArray<T> implements ObservableArray {
    protected _model: any;
    protected _isNull: boolean;
    protected _isUndefined: boolean;
    constructor(parent: ObservableObject, propertyName: string, relation: any, model: any[]);
    getRoot(): ObservableObject;
    getPath(item?: ObservableObject): string;
    propertyChanged(propName: string, value: any, oldValue: any, eventInfo: EventInfo): void;
    stateChanged(propName: string, value: any, oldValue: any, eventInfo: EventInfo): void;
    destroy(): void;
    protected destroyItems(): void;
    protected setValue(value?: T[]): void;
}
