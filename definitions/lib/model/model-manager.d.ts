import { EventType, EventInfo, ObservableObject } from './interfaces';
export declare class ModelManager {
    private _dirty;
    private _sortedClasses;
    private _roots;
    private _mapByClass;
    private _classes;
    private _mapRules;
    static singleton: ModelManager;
    constructor();
    createInstance<T extends ObservableObject>(classOfInstance: any, transaction: any, parent: ObservableObject, propertyName: string, value: any, options: {
        isRestore: boolean;
    }): T;
    classByName(className: string, namespace: string): any;
    classByPath(className: string, namespace: string, path: string): any;
    enumClasses(cb: (item: {
        classOfInstance: any;
        isChild: boolean;
        isView: boolean;
        className: string;
    }) => void): void;
    sortedClasses(): string[];
    registerClass(constructor: any, schema: any): void;
    private _loaded();
    rulesForByName(ruleName: string, classOfInstance: any): any[];
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
export declare function initRules(eventInfo: EventInfo, classOfInstance: any, instances: any[], args?: any[]): Promise<boolean>;
export declare function editingRules(eventInfo: EventInfo, classOfInstance: any, instances: any[], args?: any[]): Promise<boolean>;
export declare function removingRules(eventInfo: EventInfo, classOfInstance: any, instances: any[], args?: any[]): Promise<boolean>;
export declare function savingRules(eventInfo: EventInfo, classOfInstance: any, instances: any[], args?: any[]): Promise<boolean>;
export declare function editedRules(eventInfo: EventInfo, classOfInstance: any, instances: any[], args?: any[]): Promise<boolean>;
export declare function removedRules(eventInfo: EventInfo, classOfInstance: any, instances: any[], args?: any[]): Promise<boolean>;
export declare function savedRules(eventInfo: EventInfo, classOfInstance: any, instances: any[], args?: any[]): Promise<boolean>;
export declare function propagationRules(eventInfo: EventInfo, classOfInstance: any, instances: any[], args?: any[]): Promise<boolean>;
export declare function propValidateRules(eventInfo: EventInfo, classOfInstance: any, instances: any[], args?: any[]): Promise<boolean>;
export declare function objValidateRules(eventInfo: EventInfo, classOfInstance: any, instances: any[], args?: any[]): Promise<boolean>;
export declare function addItemRules(eventInfo: EventInfo, classOfInstance: any, instances: any[], args?: any[]): Promise<boolean>;
export declare function rmvItemRules(eventInfo: EventInfo, classOfInstance: any, instances: any[], args?: any[]): Promise<boolean>;
export declare function setItemsRules(eventInfo: EventInfo, classOfInstance: any, instances: any[], args?: any[]): Promise<boolean>;
export declare function modelManager(): ModelManager;
