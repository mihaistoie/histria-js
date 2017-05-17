import { schemaUtils } from 'histria-utils';
import { ModelObject } from './model-object'

export class View extends ModelObject {
    public get isPersistent(): boolean { return false; }
    // called on restored
    public restored(): void {
        const that = this;
        schemaUtils.enumCompositions(that._schema.relations, (relationName, relation) => {
            let role = that._children[relationName];
            if (role && role.refIsPersistent) role.restoreFromCache();
        });
    }
}