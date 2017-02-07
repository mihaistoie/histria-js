import * as util from 'util';
 
import { schemaManager } from 'histria-utils';
import { EventType, EventInfo, ObservableObject } from './interfaces';

function _activeRules(rulesInfo: { rule: any, isDisabled: boolean }[]): any[] {
    let res: any[] = [];
    rulesInfo.forEach(ri => { if (!ri.isDisabled) res.push(ri.rule); });
    return res;
}

export class ModelManager {
    private _mapByClass: Map<any, any>;
    private _classes: Map<string, any>;
    private _mapRules: Map<any, any>;
    public static singleton: ModelManager;
    constructor() {
        if (!ModelManager.singleton) {
            ModelManager.singleton = this;
        }
        return ModelManager.singleton;
    }
    public createInstance<T extends ObservableObject>(classOfInstance: any, transaction: any, parent: ObservableObject, propertyName: string, value: any, options: { isRestore: boolean }): T {
        let that = this;
        let ci = that._mapByClass.get(classOfInstance);
        return new ci.factory(transaction, parent, propertyName, value, options);
    }
    public classByName(className: string, namespace: string): any {
        let that = this;
        if (that._classes)
            return that._classes.get(namespace + '.' + className);
        return null;

    }

    public registerClass(constructor: any, schema: any) {
        let that = this;
        let className = schema.name;
        let nameSpace = schema.nameSpace;
        constructor.entityName = schema.name;
        that._mapByClass = that._mapByClass || new Map<any, any>();
        that._classes = that._classes || new Map<string, any>();
        let classConstructor = that._classes.get(nameSpace + '.' + className);
        let found = true;
        if (!classConstructor) {
            that._classes.set(nameSpace + '.' + className, constructor);
            found = false;

        }
        let ci = that._mapByClass.get(constructor);
        if (ci) return;
        if (found) {
            throw util.format('Duplicated classname "%s".', nameSpace + '.' + className);
        }
        constructor.nameSpace = nameSpace;
        ci = {
            name: constructor.name,
            factory: constructor,
            nameSpace: nameSpace,
            propChangeRules: {},
            addItemRules: {},
            setItemsRules: {},
            rmvItemRules: {},
            propValidateRules: {},
            objValidateRules: [],
            initRules: [],
        };
        that._mapByClass.set(constructor, ci);
        schemaManager().registerSchema(schema);
    }

    public rulesForInit(classOfInstance: any): any[] {
        let that = this;
        let res: any[] = [];
        let ci = that._mapByClass.get(classOfInstance);
        if (!ci) return res;
        if (ci.initRules) {
            return _activeRules(ci.initRules);
        }
        return res;
    }
    public rulesObjValidate(classOfInstance: any): any[] {
        let that = this;
        let res: any[] = [];
        let ci = that._mapByClass.get(classOfInstance);
        if (!ci) return res;
        if (ci.objValidateRules) {
            return _activeRules(ci.objValidateRules);
        }
        return res;
    }
    public rulesForPropChange(classOfInstance: any, propertyName: string): any[] {
        let that = this;
        let res: any[] = [];
        let ci = that._mapByClass.get(classOfInstance);
        if (!ci) return res;
        if (ci.propChangeRules[propertyName]) {
            return _activeRules(ci.propChangeRules[propertyName]);
        }
        return res;
    }
    public rulesForPropValidate(classOfInstance: any, propertyName: string): any[] {
        let that = this;
        let res: any[] = [];
        let ci = that._mapByClass.get(classOfInstance);
        if (!ci) return res;
        if (ci.propValidateRules[propertyName]) {
            return _activeRules(ci.propValidateRules[propertyName]);
        }
        return res;
    }

    public rulesForAddItem(classOfInstance: any, propertyName: string): any[] {
        let that = this;
        let res: any[] = [];
        let ci = that._mapByClass.get(classOfInstance);
        if (!ci) return res;
        if (ci.addItemRules[propertyName]) {
            return _activeRules(ci.addItemRules[propertyName]);
        }
        return res;
    }

    public rulesForRmvItem(classOfInstance: any, propertyName: string): any[] {
        let that = this;
        let res: any[] = [];
        let ci = that._mapByClass.get(classOfInstance);
        if (!ci) return res;
        if (ci.rmvItemRules[propertyName]) {
            return _activeRules(ci.rmvItemRules[propertyName]);
        }
        return res;
    }
    public rulesForSetItems(classOfInstance: any, propertyName: string): any[] {
        let that = this;
        let res: any[] = [];
        let ci = that._mapByClass.get(classOfInstance);
        if (!ci) return res;
        if (ci.setItemsRules[propertyName]) {
            return _activeRules(ci.setItemsRules[propertyName]);
        }
        return res;
    }


    public setTitle(classOfInstance: any, method: any, title: string, description?: string) {
        let that = this;
        that._mapRules = that._mapRules || new Map();
        let ri = that._mapRules.get(method);
        if (!ri) {
            ri = { rule: that, isDisabled: false, title: title, description: description };
            that._mapRules.set(that, ri);
        }
    }

    public addValidateRule(classOfInstance: any, rule: any, ruleParams?: any) {
        if (ruleParams && ruleParams.length)
            this.addRule(classOfInstance, EventType.propValidate, rule, ruleParams)
        else
            this.addRule(classOfInstance, EventType.objValidate, rule)
    }


    public addRule(classOfInstance: any, ruleType: EventType, rule: any, ruleParams?: any) {
        let that = this;
        let ci = that._mapByClass.get(classOfInstance);
        if (!ci) return;
        that._mapRules = that._mapRules || new Map();
        let ri = that._mapRules.get(rule);
        if (!ri) {
            ri = { rule: rule, isDisabled: false, title: null, description: null };
            that._mapRules.set(rule, ri);
        }

        if (ruleType === EventType.propChanged) {
            ruleParams && ruleParams.forEach((propName: string) => {
                ci.propChangeRules[propName] = ci.propChangeRules[propName] || [];
                ci.propChangeRules[propName].push(ri);
            });
        } else if (ruleType === EventType.init) {
            ci.initRules.push(ri);
        } else if (ruleType === EventType.propValidate) {
            ruleParams && ruleParams.forEach((propName: string) => {
                ci.propValidateRules[propName] = ci.propValidateRules[propName] || [];
                ci.propValidateRules[propName].push(ri);
            });
        } else if (ruleType === EventType.objValidate) {
            ci.objValidateRules.push(ri);
        } else if (ruleType === EventType.addItem) {
            let propName = ruleParams[0];
            ci.addItemRules[propName] = ci.addItemRules[propName] || [];
            ci.addItemRules[propName].push(ri);
        } else if (ruleType === EventType.removeItem) {
            let propName = ruleParams[0];
            ci.rmvItemRules[propName] = ci.rmvItemRules[propName] || [];
            ci.rmvItemRules[propName].push(ri);
        } else if (ruleType === EventType.setItems) {
            let propName = ruleParams[0];
            ci.setItemsRules[propName] = ci.setItemsRules[propName] || [];
            ci.setItemsRules[propName].push(ri);
        }
    }
}



export async function initRules(eventInfo: EventInfo, classOfInstance: any, instances: any[], args?: any[]) {
    let mm = modelManager();
    let rules = mm.rulesForInit(classOfInstance);
    if (rules.length) {
        let rArgs = instances.concat(eventInfo);
        for (let i = 0, len = rules.length; i < len; i++) {
            let rule = rules[i];
            await rule.apply(null, rArgs);
        }
    }
}


export async function propagationRules(eventInfo: EventInfo, classOfInstance: any, instances: any[], args?: any[]) {
    let mm = modelManager();
    let propName = args[0];
    let rules = mm.rulesForPropChange(classOfInstance, propName);
    if (rules.length) {
        let na = args.slice();
        na[0] = eventInfo;
        let rArgs = instances.concat(na);
        for (let i = 0, len = rules.length; i < len; i++) {
            let rule = rules[i];
            await rule.apply(null, rArgs);
        }
    }
}


export async function propValidateRules(eventInfo: EventInfo, classOfInstance: any, instances: any[], args?: any[]) {
    let mm = modelManager();
    let propName = args[0];
    let rules = mm.rulesForPropValidate(classOfInstance, propName);
    if (rules.length) {
        let rArgs = instances.concat(eventInfo);
        for (let i = 0, len = rules.length; i < len; i++) {
            let rule = rules[i];
            await rule.apply(null, rArgs);
        }
    }

}



export async function objValidateRules(eventInfo: EventInfo, classOfInstance: any, instances: any[], args?: any[]) {
    let mm = modelManager();
    let rules = mm.rulesObjValidate(classOfInstance);

    if (rules && rules.length) {
        let rArgs = instances.concat(eventInfo);
        for (let i = 0, len = rules.length; i < len; i++) {
            let rule = rules[i];
            await rule.apply(null, rArgs);
        }
    }
}


export async function addItemRules(eventInfo: EventInfo, classOfInstance: any, instances: any[], args?: any[]) {
    let mm = modelManager();
    let propName = args[0];
    let rules = mm.rulesForAddItem(classOfInstance, propName);
    if (rules.length) {

        let na = args.slice();
        na[0] = eventInfo;
        let rArgs = instances.concat(na);
        for (let i = 0, len = rules.length; i < len; i++) {
            let rule = rules[i];
            await rule.apply(null, rArgs);
        }
    }
}

export async function rmvItemRules(eventInfo: EventInfo, classOfInstance: any, instances: any[], args?: any[]) {
    let mm = modelManager();
    let propName = args[0];
    let rules = mm.rulesForRmvItem(classOfInstance, propName);
    if (rules.length) {
        let na = args.slice();
        na[0] = eventInfo;
        let rArgs = instances.concat(na);
        for (let i = 0, len = rules.length; i < len; i++) {
            let rule = rules[i];
            await rule.apply(null, rArgs);
        }
    }
}


export async function setItemsRules(eventInfo: EventInfo, classOfInstance: any, instances: any[], args?: any[]) {
    let mm = modelManager();
    let propName = args[0];
    let rules = mm.rulesForSetItems(classOfInstance, propName);
    if (rules.length) {
        let na = args.slice();
        na[0] = eventInfo;
        let rArgs = instances.concat(na);
        for (let i = 0, len = rules.length; i < len; i++) {
            let rule = rules[i];
            await rule.apply(null, rArgs);
        }
    }
}

export function modelManager(): ModelManager {
    if (ModelManager.singleton)
        return ModelManager.singleton;
    return new ModelManager();
}





