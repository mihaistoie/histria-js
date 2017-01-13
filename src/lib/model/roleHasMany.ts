import { ObservableObject, ObservableArray, EventInfo, ObjectStatus, MessageServerity, UserContext, TransactionContainer, EventType } from './interfaces';
import { ModelManager } from './model-manager';
import { ObjectArray } from './base-array';
import { DEFAULT_PARENT_NAME } from '../schema/schema-consts';

export class HasManyComposition<T extends ObservableObject> extends ObjectArray<T> {
    protected _refClass: any;
    constructor(parent: ObservableObject, propertyName: string, relation: any, model: any[]) {
        super(parent, propertyName, relation, model);
        let that = this;
        that._refClass = new ModelManager().classByName(that._relation.model, that._relation.nameSpace);

    }
    public destroy() {
        let that = this;
        that._refClass = null;
        super.destroy();
    }


    protected async lazyLoad(): Promise<void> {
        let that = this;

        if (!that._parent) return;
        if (that._isUndefined) {
            let lmodel = that._parent.model();
            let query: any = {}, valueIsNull = false;
            that._relation.localFields.forEach((field, index) => {
                let ff = that._relation.foreignFields[index];
                let value = lmodel[field];
                if (value === null || value === '' || value === undefined)
                    valueIsNull = true;
                else
                    query[ff] = value;
            });
            if (valueIsNull) {
                that._model = [];
            } else {
                let items = await that._parent.transaction.find<T>(query, that._refClass);
                if (items.length) {
                    that._model = new Array(items.length);
                    that._items = new Array(items.length);
                    for (let index = 0; index < items.length; index++) {
                        let item = items[index];
                        let model = item.model();
                        that._model[index] = model;
                        that._items[index] = item;
                        await item.changeParent(that._parent, that._relation.invRel || DEFAULT_PARENT_NAME, false);
                    }
                } else
                    that._model = null;
            }
            that._isUndefined = false;
            that._isNull = that._model === null;
            lmodel[that._propertyName] = that._model;
        }

    }


}