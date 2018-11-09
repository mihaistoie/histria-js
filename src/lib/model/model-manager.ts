import * as util from 'util';

import { schemaManager } from 'histria-utils';
import { EventType, IEventInfo, IObservableObject } from './interfaces';

function _activeRules(rulesInfo: Array<{ rule: any, isDisabled: boolean }>): any[] {
    const res: any[] = [];
    rulesInfo.forEach(ri => { if (!ri.isDisabled) res.push(ri.rule); });
    return res;
}

export class ModelManager {
    public static singleton: ModelManager;
    private _dirty: boolean;
    private _sortedClasses: Array<{ classOfInstance: any, isChild: boolean, isView: boolean, className: string }>;
    private _roots: Map<any, number>;
    private _mapByClass: Map<any, any>;
    private _classes: Map<string, any>;
    private _mapRules: Map<any, any>;
    constructor() {
        if (!ModelManager.singleton) {
            ModelManager.singleton = this;
        }
        return ModelManager.singleton;
    }
    public createInstance<T extends IObservableObject>(classOfInstance: any, transaction: any, parent: IObservableObject, propertyName: string, value: any, options: { isRestore: boolean }): T {
        const ci = this._mapByClass.get(classOfInstance);
        return new ci.factory(transaction, parent, propertyName, value, options);
    }
    public classByName(className: string, namespace: string): any {
        if (this._classes)
            return this._classes.get(namespace + '.' + className);
        return null;

    }

    public classByPath(className: string, namespace: string, path: string) {
        const segments = path.split('.');
        let cs = schemaManager().schema(namespace, className);
        if (!cs) return null;
        for (const s of segments) {
            const rel = cs && cs.relations ? cs.relations[s] : null;
            if (!rel) return null;
            cs = schemaManager().schema(rel.nameSpace, rel.model);
            if (!cs) return null;
        }
        if (cs && this._classes)
            return this._classes.get(cs.nameSpace + '.' + cs.name);
        return null;
    }

    public enumClasses(cb: (item: { classOfInstance: any, isChild: boolean, isView: boolean, className: string }) => void) {
        this._loaded();
        this._sortedClasses.forEach(item => cb(item));
    }
    public sortedClasses(): string[] {
        const res: string[] = [];
        this._loaded();
        this.enumClasses(item => res.push(item.className));
        return res;
    }

    public registerClass(constructor: any, schema: any) {
        this._dirty = true;
        const className = schema.name;
        const nameSpace = schema.nameSpace;
        constructor.entityName = schema.name;
        this._mapByClass = this._mapByClass || new Map<any, any>();
        this._classes = this._classes || new Map<string, any>();
        const classConstructor = this._classes.get(nameSpace + '.' + className);
        let found = true;
        if (!classConstructor) {
            this._classes.set(nameSpace + '.' + className, constructor);
            found = false;

        }
        let ci = this._mapByClass.get(constructor);
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
        this._mapByClass.set(constructor, ci);
        schemaManager().registerSchema(schema);
    }

    public rulesForByName(ruleName: string, classOfInstance: any): any[] {
        const res: any[] = [];
        const ci = this._mapByClass.get(classOfInstance);
        if (!ci) return res;
        if (ci.initRules) {
            return _activeRules(ci[ruleName + 'Rules']);
        }
        return res;
    }
    public rulesObjValidate(classOfInstance: any): any[] {
        const res: any[] = [];
        const ci = this._mapByClass.get(classOfInstance);
        if (!ci) return res;
        if (ci.objValidateRules) {
            return _activeRules(ci.objValidateRules);
        }
        return res;
    }
    public rulesForPropChange(classOfInstance: any, propertyName: string): any[] {
        const res: any[] = [];
        const ci = this._mapByClass.get(classOfInstance);
        if (!ci) return res;
        if (ci.propChangeRules[propertyName]) {
            return _activeRules(ci.propChangeRules[propertyName]);
        }
        return res;
    }
    public rulesForPropValidate(classOfInstance: any, propertyName: string): any[] {
        const res: any[] = [];
        const ci = this._mapByClass.get(classOfInstance);
        if (!ci) return res;
        if (ci.propValidateRules[propertyName]) {
            return _activeRules(ci.propValidateRules[propertyName]);
        }
        return res;
    }

    public rulesForAddItem(classOfInstance: any, propertyName: string): any[] {
        const res: any[] = [];
        const ci = this._mapByClass.get(classOfInstance);
        if (!ci) return res;
        if (ci.addItemRules[propertyName]) {
            return _activeRules(ci.addItemRules[propertyName]);
        }
        return res;
    }

    public rulesForRmvItem(classOfInstance: any, propertyName: string): any[] {
        const res: any[] = [];
        const ci = this._mapByClass.get(classOfInstance);
        if (!ci) return res;
        if (ci.rmvItemRules[propertyName]) {
            return _activeRules(ci.rmvItemRules[propertyName]);
        }
        return res;
    }
    public rulesForSetItems(classOfInstance: any, propertyName: string): any[] {
        const res: any[] = [];
        const ci = this._mapByClass.get(classOfInstance);
        if (!ci) return res;
        if (ci.setItemsRules[propertyName]) {
            return _activeRules(ci.setItemsRules[propertyName]);
        }
        return res;
    }

    public setTitle(classOfInstance: any, method: any, title: string, description?: string) {
        this._mapRules = this._mapRules || new Map();
        let ri = this._mapRules.get(method);
        if (!ri) {
            ri = { rule: this, isDisabled: false, title: title, description: description };
            this._mapRules.set(this, ri);
        }
    }

    public addValidateRule(classOfInstance: any, rule: any, ruleParams?: any) {
        if (ruleParams && ruleParams.length)
            this.addRule(classOfInstance, EventType.propValidate, rule, ruleParams);
        else
            this.addRule(classOfInstance, EventType.objValidate, rule);
    }

    public addRule(classOfInstance: any, ruleType: EventType, rule: any, ruleParams?: any) {
        const ci = this._mapByClass.get(classOfInstance);
        if (!ci) return;
        this._mapRules = this._mapRules || new Map();
        let ri = this._mapRules.get(rule);
        if (!ri) {
            ri = { rule: rule, isDisabled: false, title: null, description: null };
            this._mapRules.set(rule, ri);
        }

        if (ruleType === EventType.propChanged) {
            if (ruleParams)
                ruleParams.forEach((propName: string) => {
                    ci.propChangeRules[propName] = ci.propChangeRules[propName] || [];
                    ci.propChangeRules[propName].push(ri);
                });
        } else if (ruleType === EventType.init) {
            ci.initRules.push(ri);
        } else if (ruleType === EventType.propValidate) {
            if (ruleParams)
                ruleParams.forEach((propName: string) => {
                    ci.propValidateRules[propName] = ci.propValidateRules[propName] || [];
                    ci.propValidateRules[propName].push(ri);
                });
        } else if (ruleType === EventType.objValidate) {
            ci.objValidateRules.push(ri);
        } else if (ruleType === EventType.addItem) {
            const propName = ruleParams[0];
            ci.addItemRules[propName] = ci.addItemRules[propName] || [];
            ci.addItemRules[propName].push(ri);
        } else if (ruleType === EventType.removeItem) {
            const propName = ruleParams[0];
            ci.rmvItemRules[propName] = ci.rmvItemRules[propName] || [];
            ci.rmvItemRules[propName].push(ri);
        } else if (ruleType === EventType.setItems) {
            const propName = ruleParams[0];
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
            ci.removingRules.push(ri);
        } else if (ruleType === EventType.removed) {
            ci.removedRules.push(ri);
        }
    }

    private _loaded() {
        if (!this._dirty && this._sortedClasses) return;
        const allChildren = new Map<string, boolean>();
        const addedClasses: any = {};
        const parents: Array<{ name: string, mapRefs: any, children: string[] }> = [];
        const allParents: any = {};
        const sm = schemaManager();
        for (const item of this._classes) {
            const fullClassName = item[0];
            if (allChildren.get(fullClassName) || sm.isChild(fullClassName))
                continue;
            addedClasses[fullClassName] = true;
            const deps = sm.childrenAndRefsOfClass(fullClassName);
            const parent: { name: string, mapRefs: any, children: string[] } = { name: fullClassName, mapRefs: {}, children: deps.children };

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
        const recursiveClasses: any = {};

        for (const item of this._classes) {
            const fullClassName = item[0];
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
            const rc = recursiveClasses[fullClassName];
            if (!rc) return;
            const deps = sm.childrenAndRefsOfClass(fullClassName);
            const children: string[] = [];
            deps.children.forEach(cn => {
                if (!recursiveClasses[cn])
                    children.push(cn);
            });
            const parent: { name: string, mapRefs: any, children: string[] } = { name: fullClassName, mapRefs: {}, children: children };
            Object.keys(deps.refs).forEach(cn => {
                parent.mapRefs[cn] = true;
            });
            allParents[parent.name] = parent;
        });

        for (const item of this._classes) {
            const fullClassName = item[0];
            if (!addedClasses[fullClassName] && sm.isChild(fullClassName)) {
                recursiveClasses[fullClassName] = 0;
            }
        }

        const pa: any = {};
        const addItem = (name: string) => {
            if (pa[name]) return;
            const item: { name: string, mapRefs: any, children: string[] } = allParents[name];
            Object.keys(item.mapRefs).sort().forEach((refName) => {
                if (pa[refName]) return;
                addItem(refName);
            });
            if (!pa[name]) {
                parents.push(item);
                pa[name] = true;
            }
        };

        Object.keys(allParents).sort().forEach(name => {
            addItem(name);
        });

        this._sortedClasses = [];
        const views: Array<{ classOfInstance: any, isChild: boolean, isView: boolean, className: string }> = [];
        parents.forEach(parent => {
            const pc = this._classes.get(parent.name);
            if (pc.isPersistent)
                this._sortedClasses.push({ classOfInstance: pc, isChild: false, isView: false, className: parent.name });
            else
                views.push({ classOfInstance: pc, isChild: false, isView: true, className: parent.name });
            parent.children.forEach(cn => {
                if (cn === parent.name) return;
                const cc = this._classes.get(cn);
                if (cc.isPersistent)
                    this._sortedClasses.push({ classOfInstance: cc, isChild: true, isView: false, className: cn });
                else
                    views.push({ classOfInstance: cc, isChild: true, isView: true, className: cn });
            });

        });
        this._dirty = false;
        if (views.length)
            this._sortedClasses = this._sortedClasses.concat(views);

    }
}

async function instanceRuleByName(name: string, eventInfo: IEventInfo, classOfInstance: any, instances: any[], args?: any[]): Promise<boolean> {
    let res = true;
    const returnRes = (name === 'editing') || (name === 'removing');
    const mm = modelManager();
    const rules = mm.rulesForByName(name, classOfInstance);
    if (rules.length) {
        const rArgs = instances.concat(eventInfo);
        for (let i = 0, len = rules.length; i < len; i++) {
            const rule = rules[i];
            if (!await rule.apply(null, rArgs))
                res = false;
        }
    }
    if (returnRes)
        return res;
    return true;
}

export async function initRules(eventInfo: IEventInfo, classOfInstance: any, instances: any[], args?: any[]): Promise<boolean> {
    return instanceRuleByName('init', eventInfo, classOfInstance, instances, args);
}

export async function editingRules(eventInfo: IEventInfo, classOfInstance: any, instances: any[], args?: any[]): Promise<boolean> {
    return instanceRuleByName('editing', eventInfo, classOfInstance, instances, args);
}

export async function removingRules(eventInfo: IEventInfo, classOfInstance: any, instances: any[], args?: any[]): Promise<boolean> {
    return instanceRuleByName('removing', eventInfo, classOfInstance, instances, args);
}

export async function savingRules(eventInfo: IEventInfo, classOfInstance: any, instances: any[], args?: any[]): Promise<boolean> {
    return instanceRuleByName('saving', eventInfo, classOfInstance, instances, args);
}

export async function editedRules(eventInfo: IEventInfo, classOfInstance: any, instances: any[], args?: any[]): Promise<boolean> {
    return instanceRuleByName('edited', eventInfo, classOfInstance, instances, args);
}

export async function removedRules(eventInfo: IEventInfo, classOfInstance: any, instances: any[], args?: any[]): Promise<boolean> {
    return instanceRuleByName('removed', eventInfo, classOfInstance, instances, args);
}

export async function savedRules(eventInfo: IEventInfo, classOfInstance: any, instances: any[], args?: any[]): Promise<boolean> {
    return instanceRuleByName('saved', eventInfo, classOfInstance, instances, args);
}

export async function propagationRules(eventInfo: IEventInfo, classOfInstance: any, instances: any[], args?: any[]): Promise<boolean> {
    const mm = modelManager();
    const propName = args[0];
    const rules = mm.rulesForPropChange(classOfInstance, propName);
    if (rules.length) {
        const na = args.slice();
        na[0] = eventInfo;
        const rArgs = instances.concat(na);
        for (let i = 0, len = rules.length; i < len; i++) {
            const rule = rules[i];
            await rule.apply(null, rArgs);
        }
    }
    return true;
}

export async function propValidateRules(eventInfo: IEventInfo, classOfInstance: any, instances: any[], args?: any[]): Promise<boolean> {
    const mm = modelManager();
    const propName = args[0];
    const rules = mm.rulesForPropValidate(classOfInstance, propName);
    if (rules.length) {
        const rArgs = instances.concat(eventInfo);
        for (let i = 0, len = rules.length; i < len; i++) {
            const rule = rules[i];
            await rule.apply(null, rArgs);
        }
    }
    return true;

}

export async function objValidateRules(eventInfo: IEventInfo, classOfInstance: any, instances: any[], args?: any[]): Promise<boolean> {
    const mm = modelManager();
    const rules = mm.rulesObjValidate(classOfInstance);

    if (rules && rules.length) {
        const rArgs = instances.concat(eventInfo);
        for (let i = 0, len = rules.length; i < len; i++) {
            const rule = rules[i];
            await rule.apply(null, rArgs);
        }
    }
    return true;
}

export async function addItemRules(eventInfo: IEventInfo, classOfInstance: any, instances: any[], args?: any[]): Promise<boolean> {
    const mm = modelManager();
    const propName = args[0];
    const rules = mm.rulesForAddItem(classOfInstance, propName);
    if (rules.length) {
        const na = args.slice();
        na[0] = eventInfo;
        const rArgs = instances.concat(na);
        for (let i = 0, len = rules.length; i < len; i++) {
            const rule = rules[i];
            await rule.apply(null, rArgs);
        }
    }
    return true;
}

export async function rmvItemRules(eventInfo: IEventInfo, classOfInstance: any, instances: any[], args?: any[]): Promise<boolean> {
    const mm = modelManager();
    const propName = args[0];
    const rules = mm.rulesForRmvItem(classOfInstance, propName);
    if (rules.length) {
        const na = args.slice();
        na[0] = eventInfo;
        const rArgs = instances.concat(na);
        for (let i = 0, len = rules.length; i < len; i++) {
            const rule = rules[i];
            await rule.apply(null, rArgs);
        }
    }
    return true;
}

export async function setItemsRules(eventInfo: IEventInfo, classOfInstance: any, instances: any[], args?: any[]): Promise<boolean> {
    const mm = modelManager();
    const propName = args[0];
    const rules = mm.rulesForSetItems(classOfInstance, propName);
    if (rules.length) {
        const na = args.slice();
        na[0] = eventInfo;
        const rArgs = instances.concat(na);
        for (let i = 0, len = rules.length; i < len; i++) {
            const rule = rules[i];
            await rule.apply(null, rArgs);
        }
    }
    return true;
}

export function modelManager(): ModelManager {
    if (ModelManager.singleton)
        return ModelManager.singleton;
    return new ModelManager();
}
