import { EventType, IEventInfo, IObservableObject } from './interfaces';
export declare class ModelManager {
    static singleton: ModelManager;
    private _dirty;
    private _sortedClasses;
    private _roots;
    private _mapByClass;
    private _classes;
    private _mapRules;
    constructor();
    createInstance<T extends IObservableObject>(classOfInstance: any, transaction: any, parent: IObservableObject, propertyName: string, value: any, options: {
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
    private _loaded;
}
export declare function initRules(eventInfo: IEventInfo, classOfInstance: any, instances: any[], args?: any[]): Promise<boolean>;
export declare function editingRules(eventInfo: IEventInfo, classOfInstance: any, instances: any[], args?: any[]): Promise<boolean>;
export declare function removingRules(eventInfo: IEventInfo, classOfInstance: any, instances: any[], args?: any[]): Promise<boolean>;
export declare function savingRules(eventInfo: IEventInfo, classOfInstance: any, instances: any[], args?: any[]): Promise<boolean>;
export declare function editedRules(eventInfo: IEventInfo, classOfInstance: any, instances: any[], args?: any[]): Promise<boolean>;
export declare function removedRules(eventInfo: IEventInfo, classOfInstance: any, instances: any[], args?: any[]): Promise<boolean>;
export declare function savedRules(eventInfo: IEventInfo, classOfInstance: any, instances: any[], args?: any[]): Promise<boolean>;
export declare function propagationRules(eventInfo: IEventInfo, classOfInstance: any, instances: any[], args?: any[]): Promise<boolean>;
export declare function propValidateRules(eventInfo: IEventInfo, classOfInstance: any, instances: any[], args?: any[]): Promise<boolean>;
export declare function objValidateRules(eventInfo: IEventInfo, classOfInstance: any, instances: any[], args?: any[]): Promise<boolean>;
export declare function addItemRules(eventInfo: IEventInfo, classOfInstance: any, instances: any[], args?: any[]): Promise<boolean>;
export declare function rmvItemRules(eventInfo: IEventInfo, classOfInstance: any, instances: any[], args?: any[]): Promise<boolean>;
export declare function setItemsRules(eventInfo: IEventInfo, classOfInstance: any, instances: any[], args?: any[]): Promise<boolean>;
export declare function modelManager(): ModelManager;
//# sourceMappingURL=model-manager.d.ts.map