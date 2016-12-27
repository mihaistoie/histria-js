"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
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
    createInstance(classOfInstance, transaction, value, options) {
        let that = this;
        let ci = that._mapByClass.get(classOfInstance);
        return new ci.factory(transaction, null, null, '', value, options);
    }
    registerClass(constructor, nameSpace) {
        let that = this;
        that._mapByClass = that._mapByClass || new Map();
        let ci = that._mapByClass.get(constructor);
        if (ci)
            return;
        ci = {
            name: constructor.name,
            factory: constructor,
            nameSpace: nameSpace,
            propChangeRules: {},
            propValidateRules: {},
            objValidateRules: [],
            initRules: [],
        };
        that._mapByClass.set(constructor, ci);
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
            ruleParams && ruleParams.forEach(propName => {
                ci.propChangeRules[propName] = ci.propChangeRules[propName] || [];
                ci.propChangeRules[propName].push(ri);
            });
        }
        else if (ruleType === interfaces_1.EventType.init) {
            ci.initRules.push(ri);
        }
        else if (ruleType === interfaces_1.EventType.propValidate) {
            ruleParams && ruleParams.forEach(propName => {
                ci.propValidateRules[propName] = ci.propValidateRules[propName] || [];
                ci.propValidateRules[propName].push(ri);
            });
        }
        else if (ruleType === interfaces_1.EventType.objValidate) {
            ci.objValidateRules.push(ri);
        }
    }
}
exports.ModelManager = ModelManager;
function initRules(eventInfo, classOfInstance, instance, args) {
    return __awaiter(this, void 0, void 0, function* () {
        let mm = new ModelManager();
        let rules = mm.rulesForInit(classOfInstance);
        if (rules.length) {
            for (let i = 0, len = rules.length; i < len; i++) {
                let rule = rules[i];
                yield rule(instance, eventInfo);
            }
        }
    });
}
exports.initRules = initRules;
function propagationRules(eventInfo, classOfInstance, instance, args) {
    return __awaiter(this, void 0, void 0, function* () {
        let mm = new ModelManager();
        let propName = args[0];
        let rules = mm.rulesForPropChange(classOfInstance, propName);
        if (rules.length) {
            for (let i = 0, len = rules.length; i < len; i++) {
                let rule = rules[i];
                yield rule(instance, eventInfo);
            }
        }
    });
}
exports.propagationRules = propagationRules;
function propValidateRules(eventInfo, classOfInstance, instance, args) {
    return __awaiter(this, void 0, void 0, function* () {
        let mm = new ModelManager();
        let propName = args[0];
        let rules = mm.rulesForPropValidate(classOfInstance, propName);
        if (rules.length) {
            for (let i = 0, len = rules.length; i < len; i++) {
                let rule = rules[i];
                yield rule(instance, eventInfo);
            }
        }
    });
}
exports.propValidateRules = propValidateRules;
function objValidateRules(eventInfo, classOfInstance, instance, args) {
    return __awaiter(this, void 0, void 0, function* () {
        let mm = new ModelManager();
        let rules = mm.rulesObjValidate(classOfInstance);
        if (rules && rules.length) {
            for (let i = 0, len = rules.length; i < len; i++) {
                let rule = rules[i];
                yield rule(instance, eventInfo);
            }
        }
    });
}
exports.objValidateRules = objValidateRules;
