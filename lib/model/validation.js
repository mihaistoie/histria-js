"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const schemaUtils = require("../schema/schema-utils");
const schema_consts_1 = require("../schema/schema-consts");
const messages_1 = require("../locale/messages");
const helper_1 = require("../utils/helper");
function _validateEmail(email) {
    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    return re.test(email);
}
function _validateJson(value, error) {
    try {
        JSON.parse(value);
    }
    catch (ex) {
        error.ex = ex;
        return false;
    }
    return true;
}
function _validateInteger(value, propTitle, ctx, error, state) {
    let res = true, msg = messages_1.messages(ctx.lang);
    if (state.exclusiveMinimum) {
        if (state.minimum !== undefined && value <= state.minimum) {
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
        if (state.maximum !== undefined && value >= state.maximum) {
            error.error = helper_1.format(msg.schema.maxNumberExclusive, propTitle, ctx.formatNumber(state.maximum, 0));
            res = false;
        }
    }
    else {
        if (state.maximum !== undefined && value > state.maximum) {
            error.error = helper_1.format(msg.schema.maxNumber, propTitle, ctx.formatNumber(state.maximum, 0));
            res = false;
        }
    }
    return res;
}
function _validateNumber(value, propTitle, ctx, error, state) {
    let res = true, msg = messages_1.messages(ctx.lang);
    if (state.exclusiveMinimum) {
        if (state.minimum !== undefined && value <= state.minimum) {
            error.error = helper_1.format(msg.schema.minNumberExclusive, propTitle, ctx.formatNumber(state.minimum, state.decimals));
        }
    }
    else {
        if (state.minimum !== undefined && value < state.minimum) {
            error.error = helper_1.format(msg.schema.minNumber, propTitle, ctx.formatNumber(state.minimum, state.decimals));
            res = false;
        }
    }
    if (state.exclusiveMaximum) {
        if (state.maximum !== undefined && value >= state.maximum) {
            error.error = helper_1.format(msg.schema.maxNumberExclusive, propTitle, ctx.formatNumber(state.maximum, state.decimals));
            res = false;
        }
    }
    else {
        if (state.maximum !== undefined && value > state.maximum) {
            error.error = helper_1.format(msg.schema.maxNumber, propTitle, ctx.formatNumber(state.maximum, state.decimals));
            res = false;
        }
    }
    return res;
}
function _validateString(value, schema, propTitle, ctx, error, state) {
    let res = true, msg = messages_1.messages(ctx.lang);
    if (state.isMandatory && !value && (value === '' || value === undefined || value === null)) {
        error.error = helper_1.format(msg.schema.required, propTitle);
        res = false;
    }
    if (schema.format) {
        if (schema.format === schema_consts_1.JSONFORMATS.email) {
            if (value && !_validateEmail(value)) {
                error.error = msg.schema.invalidEmail;
                res = false;
            }
        }
        else if (schema.format === schema_consts_1.JSONFORMATS.json) {
            let error = {};
            if (value && !_validateJson(value, error)) {
                error.error = error;
                res = false;
            }
        }
    }
    return res;
}
function validateProp(value, propName, propSchema, ctx, error, state) {
    let propType = schemaUtils.typeOfProperty(propSchema);
    switch (propType) {
        case schema_consts_1.JSONTYPES.integer:
            _validateInteger(value, propSchema.title || propName, ctx, error, state);
            break;
        case schema_consts_1.JSONTYPES.number:
            _validateNumber(value, propSchema.title || propName, ctx, error, state);
            break;
        case schema_consts_1.JSONTYPES.string:
            _validateString(value, propSchema, propSchema.title || propName, ctx, error, state);
            break;
    }
}
function validateAfterPropChanged(eventInfo, classOfInstance, instance, args) {
    return __awaiter(this, void 0, void 0, function* () {
        let propName = args[0];
        let propSchema = instance.getSchema(propName);
        if (!propSchema)
            return;
        validateProp(args[1], propName, propSchema, instance.context, instance.$errors[propName], instance.$states[propName]);
    });
}
exports.validateAfterPropChanged = validateAfterPropChanged;
