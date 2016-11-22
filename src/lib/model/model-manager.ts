import * as util from 'util';
import { RULE_TRIGGERS } from '../consts/consts';

function _activeRules(rulesInfo: { rule: any, isDisabled: boolean }[]): any[] {
    let res = [];
    rulesInfo.forEach(ri => { if (!ri.isDisabled) res.push(ri.rule); });
    return res;
}

export class ModelManager {
    private _mapByClass: Map<any, any>;
    private _mapRules: Map<any, any>;
    private static singleton: ModelManager;
    constructor() {
        if (!ModelManager.singleton) {
            ModelManager.singleton = this;
        }
        return ModelManager.singleton;
    }
    public createInstance<T>(classOfInstance: any, transaction: any, value: any, options: {isCreate: boolean, isRestore: boolean}): T {
        let that = this;
        let ci = that._mapByClass.get(classOfInstance);
        return new ci.factory(transaction, null, null, '', value, options);
    }
    public registerClass(constructor: any, nameSpace: string) {
        let that = this;
        that._mapByClass = that._mapByClass || new Map();
        let ci = that._mapByClass.get(constructor);
        if (ci) return;
        ci = {
            name: constructor.name,
            factory: constructor,
            nameSpace: nameSpace,
            propChangeRules: {},
            initRules: [],

        };
        that._mapByClass.set(constructor, ci);
    }
    public rulesForPropChange(classOfInstance: any, propertyName: string): any[] {
        let that = this;
        let res = [];
        let ci = that._mapByClass.get(classOfInstance);
        if (!ci) return res;
        if (ci.propChangeRules[propertyName]) {
            return _activeRules(ci.propChangeRules[propertyName]);
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

    public addRule(classOfInstance: any, ruleType: string, rule: any, ruleParams?: any) {
        let that = this;
        let ci = that._mapByClass.get(classOfInstance);
        if (!ci) return;
        that._mapRules = that._mapRules || new Map();
        let ri = that._mapRules.get(rule);
        if (!ri) {
            ri = { rule: rule, isDisabled: false, title: null, description: null };
            that._mapRules.set(rule, ri);
        }

        if (ruleType === RULE_TRIGGERS.PROP_CHANGED) {
            ruleParams && ruleParams.forEach(propName => {
                ci.propChangeRules[propName] = ci.propChangeRules[propName] || [];
                ci.propChangeRules[propName].push(ri);
            });
        } else if (ruleType === RULE_TRIGGERS.INIT) {
            ci.initRules.push(ri);
        }

    }
}

