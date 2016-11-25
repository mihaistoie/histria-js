"use strict";
const schemaUtils = require('../schema/schema-utils');
const schema_consts_1 = require('../schema/schema-consts');
const messages_1 = require('../locale/messages');
const helper_1 = require('../utils/helper');
function _validateInteger(value, propTitle, ctx, error, state) {
    let res = true, msg = messages_1.messages(ctx.lang);
    if (state.exclusiveMinimum) {
        if (state.minimum != undefined && value <= state.minimum) {
            error.error = helper_1.format(msg.schema.minNumberExclusive, propTitle, ctx.formatNumber(state.minimum, 0));
        }
    }
    else {
        if (state.minimum != undefined && value < state.minimum) {
            error.error = helper_1.format(msg.schema.minNumber, propTitle, ctx.formatNumber(state.minimum, 0));
            res = false;
        }
    }
    if (state.exclusiveMaximum) {
        if (state.maximum != undefined && value >= state.maximum) {
            error.error = helper_1.format(msg.schema.maxNumberExclusive, propTitle, ctx.formatNumber(state.maximum, 0));
            res = false;
        }
    }
    else {
        if (state.maximum != undefined && value > state.maximum) {
            error.error = helper_1.format(msg.schema.maxNumber, propTitle, ctx.formatNumber(state.maximum, 0));
            res = false;
        }
    }
    return res;
}
function validateProp(value, propName, propSchema, ctx, error, state, userContext) {
    let propType = schemaUtils.typeOfProperty(propSchema);
    switch (propType) {
        case schema_consts_1.JSONTYPES.integer:
            _validateInteger(value, propSchema.title || propName, ctx, error, state);
            break;
        case schema_consts_1.JSONTYPES.number:
            break;
    }
}
