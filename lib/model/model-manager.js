"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util = require("util");
const histria_utils_1 = require("histria-utils");
const interfaces_1 = require("./interfaces");
function _activeRules(rulesInfo) {
    const res = [];
    rulesInfo.forEach(ri => { if (!ri.isDisabled)
        res.push(ri.rule); });
    return res;
}
class ModelManager {
    constructor() {
        if (!ModelManager.singleton) {
            ModelManager.singleton = this;
        }
        return ModelManager.singleton;
    }
    createInstance(classOfInstance, transaction, parent, propertyName, value, options) {
        const ci = this._mapByClass.get(classOfInstance);
        return new ci.factory(transaction, parent, propertyName, value, options);
    }
    classByName(className, namespace) {
        if (this._classes)
            return this._classes.get(namespace + '.' + className);
        return null;
    }
    classByPath(className, namespace, path) {
        const segments = path.split('.');
        let cs = histria_utils_1.schemaManager().schema(namespace, className);
        if (!cs)
            return null;
        for (const s of segments) {
            const rel = cs && cs.relations ? cs.relations[s] : null;
            if (!rel)
                return null;
            cs = histria_utils_1.schemaManager().schema(rel.nameSpace, rel.model);
            if (!cs)
                return null;
        }
        if (cs && this._classes)
            return this._classes.get(cs.nameSpace + '.' + cs.name);
        return null;
    }
    enumClasses(cb) {
        this._loaded();
        this._sortedClasses.forEach(item => cb(item));
    }
    sortedClasses() {
        const res = [];
        this._loaded();
        this.enumClasses(item => res.push(item.className));
        return res;
    }
    registerClass(constructor, schema) {
        this._dirty = true;
        const className = schema.name;
        const nameSpace = schema.nameSpace;
        constructor.entityName = schema.name;
        this._mapByClass = this._mapByClass || new Map();
        this._classes = this._classes || new Map();
        const classConstructor = this._classes.get(nameSpace + '.' + className);
        let found = true;
        if (!classConstructor) {
            this._classes.set(nameSpace + '.' + className, constructor);
            found = false;
        }
        let ci = this._mapByClass.get(constructor);
        if (ci)
            return;
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
        histria_utils_1.schemaManager().registerSchema(schema);
    }
    rulesForByName(ruleName, classOfInstance) {
        const res = [];
        const ci = this._mapByClass.get(classOfInstance);
        if (!ci)
            return res;
        if (ci.initRules) {
            return _activeRules(ci[ruleName + 'Rules']);
        }
        return res;
    }
    rulesObjValidate(classOfInstance) {
        const res = [];
        const ci = this._mapByClass.get(classOfInstance);
        if (!ci)
            return res;
        if (ci.objValidateRules) {
            return _activeRules(ci.objValidateRules);
        }
        return res;
    }
    rulesForPropChange(classOfInstance, propertyName) {
        const res = [];
        const ci = this._mapByClass.get(classOfInstance);
        if (!ci)
            return res;
        if (ci.propChangeRules[propertyName]) {
            return _activeRules(ci.propChangeRules[propertyName]);
        }
        return res;
    }
    rulesForPropValidate(classOfInstance, propertyName) {
        const res = [];
        const ci = this._mapByClass.get(classOfInstance);
        if (!ci)
            return res;
        if (ci.propValidateRules[propertyName]) {
            return _activeRules(ci.propValidateRules[propertyName]);
        }
        return res;
    }
    rulesForAddItem(classOfInstance, propertyName) {
        const res = [];
        const ci = this._mapByClass.get(classOfInstance);
        if (!ci)
            return res;
        if (ci.addItemRules[propertyName]) {
            return _activeRules(ci.addItemRules[propertyName]);
        }
        return res;
    }
    rulesForRmvItem(classOfInstance, propertyName) {
        const res = [];
        const ci = this._mapByClass.get(classOfInstance);
        if (!ci)
            return res;
        if (ci.rmvItemRules[propertyName]) {
            return _activeRules(ci.rmvItemRules[propertyName]);
        }
        return res;
    }
    rulesForSetItems(classOfInstance, propertyName) {
        const res = [];
        const ci = this._mapByClass.get(classOfInstance);
        if (!ci)
            return res;
        if (ci.setItemsRules[propertyName]) {
            return _activeRules(ci.setItemsRules[propertyName]);
        }
        return res;
    }
    setTitle(classOfInstance, method, title, description) {
        this._mapRules = this._mapRules || new Map();
        let ri = this._mapRules.get(method);
        if (!ri) {
            ri = { rule: this, isDisabled: false, title: title, description: description };
            this._mapRules.set(this, ri);
        }
    }
    addValidateRule(classOfInstance, rule, ruleParams) {
        if (ruleParams && ruleParams.length)
            this.addRule(classOfInstance, interfaces_1.EventType.propValidate, rule, ruleParams);
        else
            this.addRule(classOfInstance, interfaces_1.EventType.objValidate, rule);
    }
    addRule(classOfInstance, ruleType, rule, ruleParams) {
        const ci = this._mapByClass.get(classOfInstance);
        if (!ci)
            return;
        this._mapRules = this._mapRules || new Map();
        let ri = this._mapRules.get(rule);
        if (!ri) {
            ri = { rule: rule, isDisabled: false, title: null, description: null };
            this._mapRules.set(rule, ri);
        }
        if (ruleType === interfaces_1.EventType.propChanged) {
            if (ruleParams)
                ruleParams.forEach((propName) => {
                    ci.propChangeRules[propName] = ci.propChangeRules[propName] || [];
                    ci.propChangeRules[propName].push(ri);
                });
        }
        else if (ruleType === interfaces_1.EventType.init) {
            ci.initRules.push(ri);
        }
        else if (ruleType === interfaces_1.EventType.propValidate) {
            if (ruleParams)
                ruleParams.forEach((propName) => {
                    ci.propValidateRules[propName] = ci.propValidateRules[propName] || [];
                    ci.propValidateRules[propName].push(ri);
                });
        }
        else if (ruleType === interfaces_1.EventType.objValidate) {
            ci.objValidateRules.push(ri);
        }
        else if (ruleType === interfaces_1.EventType.addItem) {
            const propName = ruleParams[0];
            ci.addItemRules[propName] = ci.addItemRules[propName] || [];
            ci.addItemRules[propName].push(ri);
        }
        else if (ruleType === interfaces_1.EventType.removeItem) {
            const propName = ruleParams[0];
            ci.rmvItemRules[propName] = ci.rmvItemRules[propName] || [];
            ci.rmvItemRules[propName].push(ri);
        }
        else if (ruleType === interfaces_1.EventType.setItems) {
            const propName = ruleParams[0];
            ci.setItemsRules[propName] = ci.setItemsRules[propName] || [];
            ci.setItemsRules[propName].push(ri);
        }
        else if (ruleType === interfaces_1.EventType.saving) {
            ci.savingRules.push(ri);
        }
        else if (ruleType === interfaces_1.EventType.saved) {
            ci.savedRulesRules.push(ri);
        }
        else if (ruleType === interfaces_1.EventType.editing) {
            ci.editingRules.push(ri);
        }
        else if (ruleType === interfaces_1.EventType.edited) {
            ci.editedRulesRules.push(ri);
        }
        else if (ruleType === interfaces_1.EventType.removing) {
            ci.removingRules.push(ri);
        }
        else if (ruleType === interfaces_1.EventType.removed) {
            ci.removedRules.push(ri);
        }
    }
    _loaded() {
        if (!this._dirty && this._sortedClasses)
            return;
        const allChildren = new Map();
        const addedClasses = {};
        const parents = [];
        const allParents = {};
        const sm = histria_utils_1.schemaManager();
        for (const item of this._classes) {
            const fullClassName = item[0];
            if (allChildren.get(fullClassName) || sm.isChild(fullClassName))
                continue;
            addedClasses[fullClassName] = true;
            const deps = sm.childrenAndRefsOfClass(fullClassName);
            const parent = { name: fullClassName, mapRefs: {}, children: deps.children };
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
        const recursiveClasses = {};
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
            if (!rc)
                return;
            const deps = sm.childrenAndRefsOfClass(fullClassName);
            const children = [];
            deps.children.forEach(cn => {
                if (!recursiveClasses[cn])
                    children.push(cn);
            });
            const parent = { name: fullClassName, mapRefs: {}, children: children };
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
        const pa = {};
        const addItem = (name) => {
            if (pa[name])
                return;
            const item = allParents[name];
            Object.keys(item.mapRefs).sort().forEach((refName) => {
                if (pa[refName])
                    return;
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
        const views = [];
        parents.forEach(parent => {
            const pc = this._classes.get(parent.name);
            if (pc.isPersistent)
                this._sortedClasses.push({ classOfInstance: pc, isChild: false, isView: false, className: parent.name });
            else
                views.push({ classOfInstance: pc, isChild: false, isView: true, className: parent.name });
            parent.children.forEach(cn => {
                if (cn === parent.name)
                    return;
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
exports.ModelManager = ModelManager;
async function instanceRuleByName(name, eventInfo, classOfInstance, instances, args) {
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
async function initRules(eventInfo, classOfInstance, instances, args) {
    return instanceRuleByName('init', eventInfo, classOfInstance, instances, args);
}
exports.initRules = initRules;
async function editingRules(eventInfo, classOfInstance, instances, args) {
    return instanceRuleByName('editing', eventInfo, classOfInstance, instances, args);
}
exports.editingRules = editingRules;
async function removingRules(eventInfo, classOfInstance, instances, args) {
    return instanceRuleByName('removing', eventInfo, classOfInstance, instances, args);
}
exports.removingRules = removingRules;
async function savingRules(eventInfo, classOfInstance, instances, args) {
    return instanceRuleByName('saving', eventInfo, classOfInstance, instances, args);
}
exports.savingRules = savingRules;
async function editedRules(eventInfo, classOfInstance, instances, args) {
    return instanceRuleByName('edited', eventInfo, classOfInstance, instances, args);
}
exports.editedRules = editedRules;
async function removedRules(eventInfo, classOfInstance, instances, args) {
    return instanceRuleByName('removed', eventInfo, classOfInstance, instances, args);
}
exports.removedRules = removedRules;
async function savedRules(eventInfo, classOfInstance, instances, args) {
    return instanceRuleByName('saved', eventInfo, classOfInstance, instances, args);
}
exports.savedRules = savedRules;
async function propagationRules(eventInfo, classOfInstance, instances, args) {
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
exports.propagationRules = propagationRules;
async function propValidateRules(eventInfo, classOfInstance, instances, args) {
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
exports.propValidateRules = propValidateRules;
async function objValidateRules(eventInfo, classOfInstance, instances, args) {
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
exports.objValidateRules = objValidateRules;
async function addItemRules(eventInfo, classOfInstance, instances, args) {
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
exports.addItemRules = addItemRules;
async function rmvItemRules(eventInfo, classOfInstance, instances, args) {
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
exports.rmvItemRules = rmvItemRules;
async function setItemsRules(eventInfo, classOfInstance, instances, args) {
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
exports.setItemsRules = setItemsRules;
function modelManager() {
    if (ModelManager.singleton)
        return ModelManager.singleton;
    return new ModelManager();
}
exports.modelManager = modelManager;

//# sourceMappingURL=model-manager.js.map
