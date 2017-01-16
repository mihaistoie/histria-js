import { EventType, EventInfo, ObservableObject } from './interfaces';
export declare class ModelManager {
    private _mapByClass;
    private _classes;
    private _mapRules;
    private static singleton;
    constructor();
    createInstance<T extends ObservableObject>(classOfInstance: any, transaction: any, value: any, options: {
        isRestore: boolean;
    }): T;
    classByName(className: string, namespace: string): any;
    registerClass(constructor: any, className: string, nameSpace: string): void;
    rulesForInit(classOfInstance: any): any[];
    rulesObjValidate(classOfInstance: any): any[];
    rulesForPropChange(classOfInstance: any, propertyName: string): any[];
    rulesForPropValidate(classOfInstance: any, propertyName: string): any[];
    rulesForAddItem(classOfInstance: any, propertyName: string): any[];
    rulesForRmvItem(classOfInstance: any, propertyName: string): any[];
    rulesForSetItems(classOfInstance: any, propertyName: string): any[];
    setTitle(classOfInstance: any, method: any, title: string, description?: string): void;
    addValidateRule(classOfInstance: any, rule: any, ruleParams?: any): void;
    addRule(classOfInstance: any, ruleType: EventType, rule: any, ruleParams?: any): void;
}
export declare function initRules(eventInfo: EventInfo, classOfInstance: any, instances: any[], args?: any[]): Promise<void>;
export declare function propagationRules(eventInfo: EventInfo, classOfInstance: any, instances: any[], args?: any[]): Promise<void>;
export declare function propValidateRules(eventInfo: EventInfo, classOfInstance: any, instances: any[], args?: any[]): Promise<void>;
export declare function objValidateRules(eventInfo: EventInfo, classOfInstance: any, instances: any[], args?: any[]): Promise<void>;
export declare function addItemRules(eventInfo: EventInfo, classOfInstance: any, instances: any[], args?: any[]): Promise<void>;
export declare function rmvItemRules(eventInfo: EventInfo, classOfInstance: any, instances: any[], args?: any[]): Promise<void>;
export declare function setItemsRules(eventInfo: EventInfo, classOfInstance: any, instances: any[], args?: any[]): Promise<void>;
