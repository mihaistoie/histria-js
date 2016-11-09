export declare class ModelManager {
    private _mapByClass;
    private static singleton;
    constructor();
    createInstance<T>(classOfInstance: any, transaction: any, value: any): T;
    registerClass(constructor: any, className: string, nameSpace: string): void;
    rulesForPropChange(classOfInstance: any, propertyName: string): any[];
    addRule(classOfInstance: any, ruleType: string, rule: any, ruleParams?: any): void;
}
