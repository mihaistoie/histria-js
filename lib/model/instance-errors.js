"use strict";
const error_state_1 = require("./error-state");
const helper = require("../utils/helper");
class InstanceErrors {
    constructor(parent, schema) {
        let that = this;
        that._messages = {};
        that._schema = schema;
        that._parent = parent;
        that._messages.$ = new error_state_1.ErrorState(that._parent, '$');
        schema && schema.properties && Object.keys(schema.properties).forEach(propName => {
            that._messages[propName] = new error_state_1.ErrorState(that._parent, propName);
        });
        schema && schema.relations && Object.keys(schema.relations).forEach(relName => {
            console.log('EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE');
            console.log(relName);
            that._messages[relName] = new error_state_1.ErrorState(that._parent, relName);
        });
    }
    destroy() {
        let that = this;
        if (that._messages) {
            helper.destroy(that._messages);
            that._messages = null;
        }
        that._schema = null;
        that._parent = null;
    }
}
exports.InstanceErrors = InstanceErrors;
