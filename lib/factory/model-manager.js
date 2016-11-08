"use strict";
const util = require('util');
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
        that._mapByName = that._mapByName || {};
        that._mapByClass = new Map();
        let classInfo = {
            factory: constructor,
            name: className,
            nameSpace: nameSpace
        };
        if (that._mapByName[className])
            throw util.format('Duplicate class name: "%s".', className);
        that._mapByName[className] = classInfo;
        that._mapByClass.set(constructor, classInfo);
    }
}
exports.ModelManager = ModelManager;
