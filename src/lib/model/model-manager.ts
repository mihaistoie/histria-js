import * as util from 'util';

import { schemaManager } from 'histria-utils';
import { EventType, EventInfo, ObservableObject } from './interfaces';

function _activeRules(rulesInfo: { rule: any, isDisabled: boolean }[]): any[] {
    let res: any[] = [];
    rulesInfo.forEach(ri => { if (!ri.isDisabled) res.push(ri.rule); });
    return res;
}

export class ModelManager {
    private _dirty: boolean;
    private _sortedClasses: { classOfInstance: any, isChild: boolean, isView: boolean, className: string }[];
    private _roots: Map<any, number>;
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
    public enumClasses(cb: (item: { classOfInstance: any, isChild: boolean, isView: boolean, className: string }) => void) {
        let that = this;
        that._loaded()
        that._sortedClasses.forEach(item => cb(item));
    }
    public sortedClasses(): string[] {
        let res: string[] = [];
        let that = this;
        that._loaded();
        that.enumClasses(item => res.push(item.className));
        return res;
    }

    public registerClass(constructor: any, schema: any) {
        let that = this;
        that._dirty = true;
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
            schemaName: schema.name,
            nameSpace: nameSpace,
            propChangeRules: {},
            addItemRules: {},
            setItemsRules: {},
            rmvItemRules: {},
            propValidateRules: {},
            objValidateRules: [],
            initRules: [],
            editingRules: [],
            editedRules: [],
            savingRules: [],
            savedRules: [],
            removingRules: [],
            removedRules: [],
        };
        that._mapByClass.set(constructor, ci);
        schemaManager().registerSchema(schema);
    }


    private _loaded() {
        let that = this;
        if (!that._dirty && that._sortedClasses) return;
        let allChildren = new Map<string, boolean>();
        let addedClasses: any = {};
        let parents: { name: string, mapRefs: any, children: string[] }[] = [];
        let allParents: any = {};
        let sm = schemaManager();
        for (let item of that._classes) {
            let fullClassName = item[0];
            if (allChildren.get(fullClassName) || sm.isChild(fullClassName))
                continue;
            addedClasses[fullClassName] = true;
            const deps = sm.childrenAndRefsOfClass(fullClassName);
            let parent: { name: string, mapRefs: any, children: string[] } = { name: fullClassName, mapRefs: {}, children: deps.children };

            deps.children.forEach(cn => {
                addedClasses[cn] = true;
                allChildren.set(cn, true);
            });
            Object.keys(deps.refs).forEach(cn => {
                addedClasses[cn] = true;
                parent.mapRefs[cn] = true;
            });
            allParents[parent.name] = parent;
        }
        let recursiveClasses: any = {};

        for (let item of that._classes) {
            let fullClassName = item[0];
            if (!addedClasses[fullClassName] && sm.isChild(fullClassName)) {
                recursiveClasses[fullClassName] = sm.isTree(fullClassName) ? 1 : 0;
            }
        }
        Object.keys(recursiveClasses).forEach(fullClassName => {
            const deps = sm.childrenAndRefsOfClass(fullClassName);
            deps.children.forEach(cn => {
                if (recursiveClasses[cn] !== undefined)
                    recursiveClasses[cn] = recursiveClasses[cn] + 1;
            });
        });

        Object.keys(recursiveClasses).forEach(fullClassName => {
            let rc = recursiveClasses[fullClassName];
            if (!rc) return;
            const deps = sm.childrenAndRefsOfClass(fullClassName);
            let children: string[] = [];
            deps.children.forEach(cn => {
                if (!recursiveClasses[cn])
                    children.push(cn);
            });
            let parent: { name: string, mapRefs: any, children: string[] } = { name: fullClassName, mapRefs: {}, children: children };
            Object.keys(deps.refs).forEach(cn => {
                parent.mapRefs[cn] = true;
            });
            allParents[parent.name] = parent;
        });


        for (let item of that._classes) {
            let fullClassName = item[0];
            if (!addedClasses[fullClassName] && sm.isChild(fullClassName)) {
                recursiveClasses[fullClassName] = 0;
            }
        }

        let pa: any = {};
        let addItem = (name: string) => {
            if (pa[name]) return;
            let item: { name: string, mapRefs: any, children: string[] } = allParents[name];
            Object.keys(item.mapRefs).sort().forEach((refName) => {
                if (pa[refName]) return;
                addItem(refName);
            })
            if (!pa[name]) {
                parents.push(item);
                pa[name] = true;
            }
        }

        Object.keys(allParents).sort().forEach(name => {
            addItem(name)
        });

        that._sortedClasses = [];
        let views: { classOfInstance: any, isChild: boolean, isView: boolean, className: string }[] = [];
        parents.forEach(parent => {
            let pc = that._classes.get(parent.name);
            if (pc.isPersistent)
                that._sortedClasses.push({ classOfInstance: pc, isChild: false, isView: false, className: parent.name });
            else
                views.push({ classOfInstance: pc, isChild: false, isView: true, className: parent.name });
            parent.children.forEach(cn => {
                if (cn === parent.name) return;
                let cc = that._classes.get(cn);
                if (cc.isPersistent)
                    that._sortedClasses.push({ classOfInstance: cc, isChild: true, isView: false, className: cn });
                else
                    views.push({ classOfInstance: cc, isChild: true, isView: true, className: cn });
            })

        });
        that._dirty = false;
        if (views.length)
            that._sortedClasses = that._sortedClasses.concat(views);

    }


    public rulesForByName(ruleName: string, classOfInstance: any): any[] {
        const that = this;
        const res: any[] = [];
        const ci = that._mapByClass.get(classOfInstance);
        if (!ci) return res;
        if (ci.initRules) {
            return _activeRules(ci[ruleName + 'Rules']);
        }
        return res;
    }
    public rulesObjValidate(classOfInstance: any): any[] {
        const that = this;
        const res: any[] = [];
        const ci = that._mapByClass.get(classOfInstance);
        if (!ci) return res;
        if (ci.objValidateRules) {
            return _activeRules(ci.objValidateRules);
        }
        return res;
    }
    public rulesForPropChange(classOfInstance: any, propertyName: string): any[] {
        const that = this;
        const res: any[] = [];
        const ci = that._mapByClass.get(classOfInstance);
        if (!ci) return res;
        if (ci.propChangeRules[propertyName]) {
            return _activeRules(ci.propChangeRules[propertyName]);
        }
        return res;
    }
    public rulesForPropValidate(classOfInstance: any, propertyName: string): any[] {
        const that = this;
        const res: any[] = [];
        const ci = that._mapByClass.get(classOfInstance);
        if (!ci) return res;
        if (ci.propValidateRules[propertyName]) {
            return _activeRules(ci.propValidateRules[propertyName]);
        }
        return res;
    }

    public rulesForAddItem(classOfInstance: any, propertyName: string): any[] {
        const that = this;
        const res: any[] = [];
        const ci = that._mapByClass.get(classOfInstance);
        if (!ci) return res;
        if (ci.addItemRules[propertyName]) {
            return _activeRules(ci.addItemRules[propertyName]);
        }
        return res;
    }

    public rulesForRmvItem(classOfInstance: any, propertyName: string): any[] {
        const that = this;
        const res: any[] = [];
        const ci = that._mapByClass.get(classOfInstance);
        if (!ci) return res;
        if (ci.rmvItemRules[propertyName]) {
            return _activeRules(ci.rmvItemRules[propertyName]);
        }
        return res;
    }
    public rulesForSetItems(classOfInstance: any, propertyName: string): any[] {
        const that = this;
        const res: any[] = [];
        const ci = that._mapByClass.get(classOfInstance);
        if (!ci) return res;
        if (ci.setItemsRules[propertyName]) {
            return _activeRules(ci.setItemsRules[propertyName]);
        }
        return res;
    }


    public setTitle(classOfInstance: any, method: any, title: string, description?: string) {
        const that = this;
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
        const that = this;
        const ci = that._mapByClass.get(classOfInstance);
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
        } else if (ruleType === EventType.saving) {
            ci.savingRules.push(ri);
        } else if (ruleType === EventType.saved) {
            ci.savedRulesRules.push(ri);
        } else if (ruleType === EventType.editing) {
            ci.editingRules.push(ri);
        } else if (ruleType === EventType.edited) {
            ci.editedRulesRules.push(ri);
        } else if (ruleType === EventType.removing) {
            ci.savingRules.push(ri);
        } else if (ruleType === EventType.removed) {
            ci.removedRules.push(ri);
        }
    }
}


async function instanceRuleByName(name: string, eventInfo: EventInfo, classOfInstance: any, instances: any[], args?: any[]) {
    let mm = modelManager();
    let rules = mm.rulesForByName(name, classOfInstance);
    if (rules.length) {
        let rArgs = instances.concat(eventInfo);
        for (let i = 0, len = rules.length; i < len; i++) {
            let rule = rules[i];
            await rule.apply(null, rArgs);
        }
    }
}

export async function initRules(eventInfo: EventInfo, classOfInstance: any, instances: any[], args?: any[]) {
    return instanceRuleByName('init', eventInfo, classOfInstance, instances, args);
}

export async function editingRules(eventInfo: EventInfo, classOfInstance: any, instances: any[], args?: any[]) {
    return instanceRuleByName('editing', eventInfo, classOfInstance, instances, args);
}

export async function removingRules(eventInfo: EventInfo, classOfInstance: any, instances: any[], args?: any[]) {
    return instanceRuleByName('removing', eventInfo, classOfInstance, instances, args);
}

export async function savingRules(eventInfo: EventInfo, classOfInstance: any, instances: any[], args?: any[]) {
    return instanceRuleByName('saving', eventInfo, classOfInstance, instances, args);
}

export async function editedRules(eventInfo: EventInfo, classOfInstance: any, instances: any[], args?: any[]) {
    return instanceRuleByName('edited', eventInfo, classOfInstance, instances, args);
}

export async function removedRules(eventInfo: EventInfo, classOfInstance: any, instances: any[], args?: any[]) {
    return instanceRuleByName('removed', eventInfo, classOfInstance, instances, args);
}

export async function savedRules(eventInfo: EventInfo, classOfInstance: any, instances: any[], args?: any[]) {
    return instanceRuleByName('saved', eventInfo, classOfInstance, instances, args);
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





