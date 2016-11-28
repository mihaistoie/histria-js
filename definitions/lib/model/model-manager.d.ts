import { EventType, EventInfo } from './interfaces';
export declare class ModelManager {
    private _mapByClass;
    private _mapRules;
    private static singleton;
    constructor();
    createInstance<T>(classOfInstance: any, transaction: any, value: any, options: {
        isRestore: boolean;
    }): T;
    registerClass(constructor: any, nameSpace: string): void;
    rulesForInit(classOfInstance: any): any[];
    rulesObjValidate(classOfInstance: any): any[];
    rulesForPropChange(classOfInstance: any, propertyName: string): any[];
    rulesForPropValidate(classOfInstance: any, propertyName: string): any[];
    setTitle(classOfInstance: any, method: any, title: string, description?: string): void;
    addValidateRule(classOfInstance: any, rule: any, ruleParams?: any): void;
    addRule(classOfInstance: any, ruleType: EventType, rule: any, ruleParams?: any): void;
}
export declare function initRules(eventInfo: EventInfo, classOfInstance: any, instance: any, args?: any[]): Promise<void>;
export declare function propagationRules(eventInfo: EventInfo, classOfInstance: any, instance: any, args?: any[]): Promise<void>;
export declare function propValidateRules(eventInfo: EventInfo, classOfInstance: any, instance: any, args?: any[]): Promise<void>;
export declare function objValidateRules(eventInfo: EventInfo, classOfInstance: any, instance: any, args?: any[]): Promise<void>;
