"use strict";
const state_1 = require('./state');
const schema_consts_1 = require('../schema/schema-consts');
const schemaUtils = require('../schema/schema-utils');
const helper = require('../utils/helper');
class InstanceState {
    constructor(parent, schema) {
        let that = this;
        that._states = {};
        that._schema = schema;
        that._parent = parent;
        schema && schema.properties && Object.keys(schema.properties).forEach(propName => {
            let cs = schema.properties[propName];
            let propType = schemaUtils.typeOfProperty(cs);
            if (cs.enum) {
                that._states[propName] = new state_1.EnumState(that._parent, propName);
            }
            else {
                switch (propType) {
                    case schema_consts_1.JSONTYPES.integer:
                        that._states[propName] = new state_1.IntegerState(that._parent, propName);
                        break;
                    case schema_consts_1.JSONTYPES.number:
                        that._states[propName] = new state_1.NumberState(that._parent, propName);
                        break;
                    case schema_consts_1.JSONTYPES.date:
                        that._states[propName] = new state_1.DateState(that._parent, propName);
                        break;
                    case schema_consts_1.JSONTYPES.datetime:
                        that._states[propName] = new state_1.DateTimeState(that._parent, propName);
                        break;
                    case schema_consts_1.JSONTYPES.array:
                        break;
                    case schema_consts_1.JSONTYPES.object:
                        break;
                    case schema_consts_1.JSONTYPES.refobject:
                        that._states[propName] = new state_1.RefObjectState(that._parent, propName);
                        break;
                    case schema_consts_1.JSONTYPES.refarray:
                        that._states[propName] = new state_1.RefArrayState(that._parent, propName);
                        break;
                    default:
                        that._states[propName] = new state_1.StringState(that._parent, propName);
                        break;
                }
            }
        });
    }
    destroy() {
        let that = this;
        if (that._states) {
            helper.destroy(that._states);
            that._states = null;
        }
        that._schema = null;
        that._parent = null;
    }
}
exports.InstanceState = InstanceState;
