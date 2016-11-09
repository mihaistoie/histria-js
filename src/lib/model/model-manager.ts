import * as util from 'util';
import { RULE_TRIGGERS } from '../consts/consts';

export class ModelManager {
    private _mapByClass: Map<any, any>;
    private static singleton: ModelManager;
    constructor() {
        if (!ModelManager.singleton) {
            ModelManager.singleton = this;
        }
        return ModelManager.singleton;
    }
    public createInstance<T>(classOfInstance: any, transaction: any, value: any): T {
        let that = this;
        let ci = that._mapByClass.get(classOfInstance);
        return new ci.factory(transaction, null, null, '', value);
    }
    public registerClass(constructor: any, className: string, nameSpace: string) {
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
    public rulesForPropChange(classOfInstance: any, propertyName: string): any[] {
        let that = this;
        let res = [];
        let ci = that._mapByClass.get(classOfInstance);
        if (!ci) return res;
        if (ci.propChangeRules[propertyName])
            return ci.propChangeRules[propertyName];
        return res;
    }
    public addRule(classOfInstance: any, ruleType: string, rule: any, ruleParams?: any) {
        let that = this;
        let ci = that._mapByClass.get(classOfInstance);
        if (!ci) return;
        
        if (ruleType === RULE_TRIGGERS.PROP_CHANGED) {
            ruleParams && ruleParams.forEach(propName => {
                ci.propChangeRules[propName] = ci.propChangeRules[propName] || [];
                ci.propChangeRules[propName].push(rule);
            });
        } else if (ruleType === RULE_TRIGGERS.INIT) {
            ci.initRules.push(rule);
        }

    }
}

