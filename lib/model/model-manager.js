"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const util = require("util");
const histria_utils_1 = require("histria-utils");
const interfaces_1 = require("./interfaces");
function _activeRules(rulesInfo) {
    let res = [];
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
        let that = this;
        let ci = that._mapByClass.get(classOfInstance);
        return new ci.factory(transaction, parent, propertyName, value, options);
    }
    classByName(className, namespace) {
        let that = this;
        if (that._classes)
            return that._classes.get(namespace + '.' + className);
        return null;
    }
    registerClass(constructor, schema) {
        let that = this;
        that._dirty = true;
        let className = schema.name;
        let nameSpace = schema.nameSpace;
        constructor.entityName = schema.name;
        that._mapByClass = that._mapByClass || new Map();
        that._classes = that._classes || new Map();
        let classConstructor = that._classes.get(nameSpace + '.' + className);
        let found = true;
        if (!classConstructor) {
            that._classes.set(nameSpace + '.' + className, constructor);
            found = false;
        }
        let ci = that._mapByClass.get(constructor);
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
        };
        that._mapByClass.set(constructor, ci);
        histria_utils_1.schemaManager().registerSchema(schema);
    }
    _loaded() {
        let that = this;
        if (!that._dirty)
            return;
        let allChildren = new Map();
        let parents = [];
        let sm = histria_utils_1.schemaManager();
        for (let item of that._classes) {
            let fullClassName = item[0];
            let currentClass = item[1];
            if (allChildren.get(fullClassName) || sm.isChild(fullClassName))
                continue;
            const deps = sm.childrenAndRefsOfClass(fullClassName);
            let mapRefs = {};
            let parent = { name: fullClassName, mapRefs: mapRefs, children: deps.children };
            deps.children.forEach(cn => {
                allChildren.set(cn, true);
            });
            deps.refs.forEach(cn => {
                mapRefs[cn] = true;
            });
            parents.push(parent);
        }
        parents.sort((a, b) => {
            if (b.mapRefs[a.name])
                return -1;
            if (a.mapRefs[b.name])
                return 1;
            return 0;
        });
        that._sortedClasses = [];
        parents.forEach(parent => {
            let pc = that._classes.get(parent.name);
            that._sortedClasses.push(pc);
            parent.children.forEach(cn => {
                let cc = that._classes.get(cn);
                that._sortedClasses.push(cc);
            });
        });
        that._dirty = false;
    }
    hasParent(classOfInstance) {
        let that = this;
        that._loaded();
    }
    rulesForInit(classOfInstance) {
        let that = this;
        let res = [];
        let ci = that._mapByClass.get(classOfInstance);
        if (!ci)
            return res;
        if (ci.initRules) {
            return _activeRules(ci.initRules);
        }
        return res;
    }
    rulesObjValidate(classOfInstance) {
        let that = this;
        let res = [];
        let ci = that._mapByClass.get(classOfInstance);
        if (!ci)
            return res;
        if (ci.objValidateRules) {
            return _activeRules(ci.objValidateRules);
        }
        return res;
    }
    rulesForPropChange(classOfInstance, propertyName) {
        let that = this;
        let res = [];
        let ci = that._mapByClass.get(classOfInstance);
        if (!ci)
            return res;
        if (ci.propChangeRules[propertyName]) {
            return _activeRules(ci.propChangeRules[propertyName]);
        }
        return res;
    }
    rulesForPropValidate(classOfInstance, propertyName) {
        let that = this;
        let res = [];
        let ci = that._mapByClass.get(classOfInstance);
        if (!ci)
            return res;
        if (ci.propValidateRules[propertyName]) {
            return _activeRules(ci.propValidateRules[propertyName]);
        }
        return res;
    }
    rulesForAddItem(classOfInstance, propertyName) {
        let that = this;
        let res = [];
        let ci = that._mapByClass.get(classOfInstance);
        if (!ci)
            return res;
        if (ci.addItemRules[propertyName]) {
            return _activeRules(ci.addItemRules[propertyName]);
        }
        return res;
    }
    rulesForRmvItem(classOfInstance, propertyName) {
        let that = this;
        let res = [];
        let ci = that._mapByClass.get(classOfInstance);
        if (!ci)
            return res;
        if (ci.rmvItemRules[propertyName]) {
            return _activeRules(ci.rmvItemRules[propertyName]);
        }
        return res;
    }
    rulesForSetItems(classOfInstance, propertyName) {
        let that = this;
        let res = [];
        let ci = that._mapByClass.get(classOfInstance);
        if (!ci)
            return res;
        if (ci.setItemsRules[propertyName]) {
            return _activeRules(ci.setItemsRules[propertyName]);
        }
        return res;
    }
    setTitle(classOfInstance, method, title, description) {
        let that = this;
        that._mapRules = that._mapRules || new Map();
        let ri = that._mapRules.get(method);
        if (!ri) {
            ri = { rule: that, isDisabled: false, title: title, description: description };
            that._mapRules.set(that, ri);
        }
    }
    addValidateRule(classOfInstance, rule, ruleParams) {
        if (ruleParams && ruleParams.length)
            this.addRule(classOfInstance, interfaces_1.EventType.propValidate, rule, ruleParams);
        else
            this.addRule(classOfInstance, interfaces_1.EventType.objValidate, rule);
    }
    addRule(classOfInstance, ruleType, rule, ruleParams) {
        let that = this;
        let ci = that._mapByClass.get(classOfInstance);
        if (!ci)
            return;
        that._mapRules = that._mapRules || new Map();
        let ri = that._mapRules.get(rule);
        if (!ri) {
            ri = { rule: rule, isDisabled: false, title: null, description: null };
            that._mapRules.set(rule, ri);
        }
        if (ruleType === interfaces_1.EventType.propChanged) {
            ruleParams && ruleParams.forEach((propName) => {
                ci.propChangeRules[propName] = ci.propChangeRules[propName] || [];
                ci.propChangeRules[propName].push(ri);
            });
        }
        else if (ruleType === interfaces_1.EventType.init) {
            ci.initRules.push(ri);
        }
        else if (ruleType === interfaces_1.EventType.propValidate) {
            ruleParams && ruleParams.forEach((propName) => {
                ci.propValidateRules[propName] = ci.propValidateRules[propName] || [];
                ci.propValidateRules[propName].push(ri);
            });
        }
        else if (ruleType === interfaces_1.EventType.objValidate) {
            ci.objValidateRules.push(ri);
        }
        else if (ruleType === interfaces_1.EventType.addItem) {
            let propName = ruleParams[0];
            ci.addItemRules[propName] = ci.addItemRules[propName] || [];
            ci.addItemRules[propName].push(ri);
        }
        else if (ruleType === interfaces_1.EventType.removeItem) {
            let propName = ruleParams[0];
            ci.rmvItemRules[propName] = ci.rmvItemRules[propName] || [];
            ci.rmvItemRules[propName].push(ri);
        }
        else if (ruleType === interfaces_1.EventType.setItems) {
            let propName = ruleParams[0];
            ci.setItemsRules[propName] = ci.setItemsRules[propName] || [];
            ci.setItemsRules[propName].push(ri);
        }
    }
}
exports.ModelManager = ModelManager;
function initRules(eventInfo, classOfInstance, instances, args) {
    return __awaiter(this, void 0, void 0, function* () {
        let mm = modelManager();
        let rules = mm.rulesForInit(classOfInstance);
        if (rules.length) {
            let rArgs = instances.concat(eventInfo);
            for (let i = 0, len = rules.length; i < len; i++) {
                let rule = rules[i];
                yield rule.apply(null, rArgs);
            }
        }
    });
}
exports.initRules = initRules;
function propagationRules(eventInfo, classOfInstance, instances, args) {
    return __awaiter(this, void 0, void 0, function* () {
        let mm = modelManager();
        let propName = args[0];
        let rules = mm.rulesForPropChange(classOfInstance, propName);
        if (rules.length) {
            let na = args.slice();
            na[0] = eventInfo;
            let rArgs = instances.concat(na);
            for (let i = 0, len = rules.length; i < len; i++) {
                let rule = rules[i];
                yield rule.apply(null, rArgs);
            }
        }
    });
}
exports.propagationRules = propagationRules;
function propValidateRules(eventInfo, classOfInstance, instances, args) {
    return __awaiter(this, void 0, void 0, function* () {
        let mm = modelManager();
        let propName = args[0];
        let rules = mm.rulesForPropValidate(classOfInstance, propName);
        if (rules.length) {
            let rArgs = instances.concat(eventInfo);
            for (let i = 0, len = rules.length; i < len; i++) {
                let rule = rules[i];
                yield rule.apply(null, rArgs);
            }
        }
    });
}
exports.propValidateRules = propValidateRules;
function objValidateRules(eventInfo, classOfInstance, instances, args) {
    return __awaiter(this, void 0, void 0, function* () {
        let mm = modelManager();
        let rules = mm.rulesObjValidate(classOfInstance);
        if (rules && rules.length) {
            let rArgs = instances.concat(eventInfo);
            for (let i = 0, len = rules.length; i < len; i++) {
                let rule = rules[i];
                yield rule.apply(null, rArgs);
            }
        }
    });
}
exports.objValidateRules = objValidateRules;
function addItemRules(eventInfo, classOfInstance, instances, args) {
    return __awaiter(this, void 0, void 0, function* () {
        let mm = modelManager();
        let propName = args[0];
        let rules = mm.rulesForAddItem(classOfInstance, propName);
        if (rules.length) {
            let na = args.slice();
            na[0] = eventInfo;
            let rArgs = instances.concat(na);
            for (let i = 0, len = rules.length; i < len; i++) {
                let rule = rules[i];
                yield rule.apply(null, rArgs);
            }
        }
    });
}
exports.addItemRules = addItemRules;
function rmvItemRules(eventInfo, classOfInstance, instances, args) {
    return __awaiter(this, void 0, void 0, function* () {
        let mm = modelManager();
        let propName = args[0];
        let rules = mm.rulesForRmvItem(classOfInstance, propName);
        if (rules.length) {
            let na = args.slice();
            na[0] = eventInfo;
            let rArgs = instances.concat(na);
            for (let i = 0, len = rules.length; i < len; i++) {
                let rule = rules[i];
                yield rule.apply(null, rArgs);
            }
        }
    });
}
exports.rmvItemRules = rmvItemRules;
function setItemsRules(eventInfo, classOfInstance, instances, args) {
    return __awaiter(this, void 0, void 0, function* () {
        let mm = modelManager();
        let propName = args[0];
        let rules = mm.rulesForSetItems(classOfInstance, propName);
        if (rules.length) {
            let na = args.slice();
            na[0] = eventInfo;
            let rArgs = instances.concat(na);
            for (let i = 0, len = rules.length; i < len; i++) {
                let rule = rules[i];
                yield rule.apply(null, rArgs);
            }
        }
    });
}
exports.setItemsRules = setItemsRules;
function modelManager() {
    if (ModelManager.singleton)
        return ModelManager.singleton;
    return new ModelManager();
}
exports.modelManager = modelManager;
