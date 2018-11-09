"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const state_1 = require("./state");
const histria_utils_1 = require("histria-utils");
class InstanceState {
    constructor(parent, schema) {
        this._states = {};
        this._schema = schema;
        this._parent = parent;
        if (schema && schema.properties)
            Object.keys(schema.properties).forEach(propName => {
                const cs = schema.properties[propName];
                const propType = histria_utils_1.schemaUtils.typeOfProperty(cs);
                if (cs.enum) {
                    this._states[propName] = new state_1.EnumState(this._parent, propName);
                }
                else {
                    switch (propType) {
                        case histria_utils_1.JSONTYPES.integer:
                            this._states[propName] = new state_1.IntegerState(this._parent, propName);
                            break;
                        case histria_utils_1.JSONTYPES.id:
                            this._states[propName] = new state_1.IdState(this._parent, propName);
                            break;
                        case histria_utils_1.JSONTYPES.number:
                            this._states[propName] = new state_1.NumberState(this._parent, propName);
                            break;
                        case histria_utils_1.JSONTYPES.date:
                            this._states[propName] = new state_1.DateState(this._parent, propName);
                            break;
                        case histria_utils_1.JSONTYPES.datetime:
                            this._states[propName] = new state_1.DateTimeState(this._parent, propName);
                            break;
                        default:
                            this._states[propName] = new state_1.StringState(this._parent, propName);
                            break;
                    }
                }
            });
        if (schema && schema.relations)
            Object.keys(schema.relations).forEach(propName => {
                /*
                                    case JSONTYPES.array:
                                        break;
                                    case JSONTYPES.object:
                                        break;
                                    case JSONTYPES.refobject:
                                        this._states[propName] = new RefObjectState(this._parent, propName);
                                        break;
                                    case JSONTYPES.refarray:
                                        this._states[propName] = new RefArrayState(this._parent, propName);
                                        break;
                 */
            });
    }
    destroy() {
        if (this._states) {
            histria_utils_1.helper.destroy(this._states);
            this._states = null;
        }
        this._schema = null;
        this._parent = null;
    }
}
exports.InstanceState = InstanceState;

//# sourceMappingURL=instance-state.js.map
