import * as util from 'util';

export class ModelManager {
    private _mapByName: any;
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

