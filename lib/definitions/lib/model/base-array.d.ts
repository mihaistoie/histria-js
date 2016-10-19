declare class BaseHasMany<T> {
    protected _parent: any;
    protected _items: any;
    protected _model: any;
    isNull: boolean;
    isUndefined: boolean;
    constructor(parent: any, model: T[]);
    protected destroyItems(): void;
    protected setValue(value?: T[]): void;
}
