export declare class ModelManager {
    private _mapByClass;
    private _mapRules;
    private static singleton;
    constructor();
    createInstance<T>(classOfInstance: any, transaction: any, value: any): T;
    registerClass(constructor: any, nameSpace: string): void;
    rulesForPropChange(classOfInstance: any, propertyName: string): any[];
    setTitle(classOfInstance: any, method: any, title: string, description?: string): void;
    addRule(classOfInstance: any, ruleType: string, rule: any, ruleParams?: any): void;
}
