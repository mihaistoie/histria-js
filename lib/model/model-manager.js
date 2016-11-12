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
    registerClass(constructor, className, nameSpace) {
        let that = this;
        that._mapByClass = new Map();
        let classInfo = {
            factory: constructor,
            name: className,
            nameSpace: nameSpace,
            propChangeRules: {},
            initRules: []
        };
        that._mapByClass.set(constructor, classInfo);
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
    }
    addRule(classOfInstance, ruleType, rule, ruleParams) {
        let that = this;
        let ci = that._mapByClass.get(classOfInstance);
        if (!ci)
            return;
        if (ruleType === consts_1.RULE_TRIGGERS.PROP_CHANGED) {
            ruleParams && ruleParams.forEach(propName => {
                ci.propChangeRules[propName] = ci.propChangeRules[propName] || [];
                ci.propChangeRules[propName].push({ rule: rule, isDisabled: false });
            });
        }
        else if (ruleType === consts_1.RULE_TRIGGERS.INIT) {
            ci.initRules.push({ rule: rule, isDisabled: false });
        }
    }
}
exports.ModelManager = ModelManager;
