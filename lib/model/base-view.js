"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const histria_utils_1 = require("histria-utils");
const model_object_1 = require("./model-object");
class View extends model_object_1.ModelObject {
    get isPersistent() { return false; }
    // called on restored
    restored() {
        const that = this;
        histria_utils_1.schemaUtils.enumCompositions(that._schema.relations, (relationName, relation) => {
            let role = that._children[relationName];
            if (role && role.refIsPersistent)
                role.restoreFromCache();
        });
    }
}
exports.View = View;
