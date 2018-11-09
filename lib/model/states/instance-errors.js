"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_state_1 = require("./error-state");
const histria_utils_1 = require("histria-utils");
class InstanceErrors {
    constructor(parent, schema) {
        this._messages = {};
        this._schema = schema;
        this._parent = parent;
        this._messages.$ = new error_state_1.ErrorState(this._parent, '$');
        if (schema && schema.properties)
            Object.keys(schema.properties).forEach(propName => {
                this._messages[propName] = new error_state_1.ErrorState(this._parent, propName);
            });
        if (schema && schema.relations)
            Object.keys(schema.relations).forEach(relName => {
                this._messages[relName] = new error_state_1.ErrorState(this._parent, relName);
            });
    }
    destroy() {
        if (this._messages) {
            histria_utils_1.helper.destroy(this._messages);
            this._messages = null;
        }
        this._schema = null;
        this._parent = null;
    }
}
exports.InstanceErrors = InstanceErrors;

//# sourceMappingURL=instance-errors.js.map
