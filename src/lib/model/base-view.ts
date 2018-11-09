import { schemaUtils } from 'histria-utils';
import { ModelObject } from './model-object';

export class View extends ModelObject {
    public get isPersistent(): boolean { return false; }
    // called on restored
    public restored(): void {
        schemaUtils.enumCompositions(this._schema.relations, (relationName, relation) => {
            const role = this._children[relationName];
            if (role && role.refIsPersistent) role.restoreFromCache();
        });
    }
}