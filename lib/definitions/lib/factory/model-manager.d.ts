export declare class ModelManager {
    private _mapByName;
    private _mapByClass;
    private static singleton;
    constructor();
    createInstance<T>(classOfInstance: any, transaction: any, value: any): T;
    registerClass(constructor: any, className: string, nameSpace: string): void;
}
