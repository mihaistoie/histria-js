"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const state_1 = require("./state");
const histria_utils_1 = require("histria-utils");
class InstanceState {
    constructor(parent, schema) {
        let that = this;
        that._states = {};
        that._schema = schema;
        that._parent = parent;
        schema && schema.properties && Object.keys(schema.properties).forEach(propName => {
            let cs = schema.properties[propName];
            let propType = histria_utils_1.schemaUtils.typeOfProperty(cs);
            if (cs.enum) {
                that._states[propName] = new state_1.EnumState(that._parent, propName);
            }
            else {
                switch (propType) {
                    case histria_utils_1.JSONTYPES.integer:
                        that._states[propName] = new state_1.IntegerState(that._parent, propName);
                        break;
                    case histria_utils_1.JSONTYPES.id:
                        that._states[propName] = new state_1.IdState(that._parent, propName);
                        break;
                    case histria_utils_1.JSONTYPES.number:
                        that._states[propName] = new state_1.NumberState(that._parent, propName);
                        break;
                    case histria_utils_1.JSONTYPES.date:
                        that._states[propName] = new state_1.DateState(that._parent, propName);
                        break;
                    case histria_utils_1.JSONTYPES.datetime:
                        that._states[propName] = new state_1.DateTimeState(that._parent, propName);
                        break;
                    default:
                        that._states[propName] = new state_1.StringState(that._parent, propName);
                        break;
                }
            }
        });
        schema && schema.relations && Object.keys(schema.relations).forEach(propName => {
            /*
                                case JSONTYPES.array:
                                    break;
                                case JSONTYPES.object:
                                    break;
                                case JSONTYPES.refobject:
                                    that._states[propName] = new RefObjectState(that._parent, propName);
                                    break;
                                case JSONTYPES.refarray:
                                    that._states[propName] = new RefArrayState(that._parent, propName);
                                    break;
             */
        });
    }
    destroy() {
        let that = this;
        if (that._states) {
            histria_utils_1.helper.destroy(that._states);
            that._states = null;
        }
        that._schema = null;
        that._parent = null;
    }
}
exports.InstanceState = InstanceState;
