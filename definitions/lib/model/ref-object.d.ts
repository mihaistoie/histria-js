declare class BaseHasOne<T> {
    protected _parent: any;
    protected _items: any;
    protected _model: any;
    isNull: boolean;
    isUndefined: boolean;
    constructor(parent: any, model: T[]);
    destroy(): void;
}
