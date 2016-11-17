"use strict";
const consts_1 = require('../consts/consts');
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
    createInstance(classOfInstance, transaction, value) {
        let that = this;
        let ci = that._mapByClass.get(classOfInstance);
        return new ci.factory(transaction, null, null, '', value);
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
            initRules: [],
        };
        that._mapByClass.set(constructor, ci);
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
    setTitle(classOfInstance, method, title, description) {
        let that = this;
        that._mapRules = that._mapRules || new Map();
        let ri = that._mapRules.get(method);
        if (!ri) {
            ri = { rule: that, isDisabled: false, title: title, description: description };
            that._mapRules.set(that, ri);
        }
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
        if (ruleType === consts_1.RULE_TRIGGERS.PROP_CHANGED) {
            ruleParams && ruleParams.forEach(propName => {
                ci.propChangeRules[propName] = ci.propChangeRules[propName] || [];
                ci.propChangeRules[propName].push(ri);
            });
        }
        else if (ruleType === consts_1.RULE_TRIGGERS.INIT) {
            ci.initRules.push(ri);
        }
    }
}
exports.ModelManager = ModelManager;
