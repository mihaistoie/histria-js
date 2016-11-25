import { EventType, EventInfo } from './interfaces';
export declare class ModelManager {
    private _mapByClass;
    private _mapRules;
    private static singleton;
    constructor();
    createInstance<T>(classOfInstance: any, transaction: any, value: any, options: {
        isCreate: boolean;
        isRestore: boolean;
    }): T;
    registerClass(constructor: any, nameSpace: string): void;
    rulesForPropChange(classOfInstance: any, propertyName: string): any[];
    setTitle(classOfInstance: any, method: any, title: string, description?: string): void;
    addValidateRule(classOfInstance: any, rule: any, ruleParams?: any): void;
    addRule(classOfInstance: any, ruleType: EventType, rule: any, ruleParams?: any): void;
}
export declare function propagationRules(eventInfo: EventInfo, classOfInstance: any, instance: any, args?: any[]): Promise<void>;
