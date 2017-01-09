"use strict";
const model_manager_1 = require("./model-manager");
class Role {
    constructor(parent, propertyName, relation) {
        let that = this;
        that._propertyName = propertyName;
        that._relation = relation;
        that._parent = parent;
        that._refClass = new model_manager_1.ModelManager().classByName(that._relation.model);
    }
    destroy() {
        let that = this;
        that._relation = null;
        that._parent = null;
        that._refClass = null;
    }
}
exports.Role = Role;
