import { ObservableObject, ObservableArray, EventInfo } from './interfaces';
export declare class ObjectArray<T extends ObservableObject> implements ObservableArray {
    protected _parent: ObservableObject;
    protected _items: ObservableObject[];
    protected _propertyName: string;
    protected _model: any;
    protected _relation: any;
    protected _rootCache: ObservableObject;
    isNull: boolean;
    isUndefined: boolean;
    constructor(parent: ObservableObject, propertyName: string, relation: any, model: any[]);
    getRoot(): ObservableObject;
    getPath(item?: ObservableObject): string;
    propertyChanged(propName: string, value: any, oldValue: any, eventInfo: EventInfo): void;
    stateChanged(propName: string, value: any, oldValue: any, eventInfo: EventInfo): void;
    destroy(): void;
    protected destroyItems(): void;
    protected setValue(value?: T[]): void;
    protected lazyLoad(): Promise<void>;
}
export declare class HasManyComposition<T extends ObservableObject> extends ObjectArray<T> {
    protected _refClass: any;
    constructor(parent: ObservableObject, propertyName: string, relation: any, model: any[]);
    destroy(): void;
    protected lazyLoad(): Promise<void>;
}
