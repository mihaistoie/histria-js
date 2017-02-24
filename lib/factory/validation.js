"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const histria_utils_1 = require("histria-utils");
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
    let res = true, msg = histria_utils_1.messages(ctx.lang);
    if (state.exclusiveMinimum) {
        if (state.minimum !== undefined && value <= state.minimum) {
            error.error = histria_utils_1.helper.format(msg.schema.minNumberExclusive, propTitle, ctx.formatNumber(state.minimum, 0));
        }
    }
    else {
        if (state.minimum != undefined && value < state.minimum) {
            error.error = histria_utils_1.helper.format(msg.schema.minNumber, propTitle, ctx.formatNumber(state.minimum, 0));
            res = false;
        }
    }
    if (state.exclusiveMaximum) {
        if (state.maximum !== undefined && value >= state.maximum) {
            error.error = histria_utils_1.helper.format(msg.schema.maxNumberExclusive, propTitle, ctx.formatNumber(state.maximum, 0));
            res = false;
        }
    }
    else {
        if (state.maximum !== undefined && value > state.maximum) {
            error.error = histria_utils_1.helper.format(msg.schema.maxNumber, propTitle, ctx.formatNumber(state.maximum, 0));
            res = false;
        }
    }
    return res;
}
function _validateNumber(value, propTitle, ctx, error, state) {
    let res = true, msg = histria_utils_1.messages(ctx.lang);
    if (state.exclusiveMinimum) {
        if (state.minimum !== undefined && value <= state.minimum) {
            error.error = histria_utils_1.helper.format(msg.schema.minNumberExclusive, propTitle, ctx.formatNumber(state.minimum, state.decimals));
        }
    }
    else {
        if (state.minimum !== undefined && value < state.minimum) {
            error.error = histria_utils_1.helper.format(msg.schema.minNumber, propTitle, ctx.formatNumber(state.minimum, state.decimals));
            res = false;
        }
    }
    if (state.exclusiveMaximum) {
        if (state.maximum !== undefined && value >= state.maximum) {
            error.error = histria_utils_1.helper.format(msg.schema.maxNumberExclusive, propTitle, ctx.formatNumber(state.maximum, state.decimals));
            res = false;
        }
    }
    else {
        if (state.maximum !== undefined && value > state.maximum) {
            error.error = histria_utils_1.helper.format(msg.schema.maxNumber, propTitle, ctx.formatNumber(state.maximum, state.decimals));
            res = false;
        }
    }
    return res;
}
function _validateString(value, schema, propTitle, ctx, error, state) {
    let res = true, msg = histria_utils_1.messages(ctx.lang);
    if (state.isMandatory && !value && (value === '' || value === undefined || value === null)) {
        error.error = histria_utils_1.helper.format(msg.schema.required, propTitle);
        res = false;
    }
    if (schema.format) {
        if (schema.format === histria_utils_1.JSONFORMATS.email) {
            if (value && !_validateEmail(value)) {
                error.error = msg.schema.invalidEmail;
                res = false;
            }
        }
        else if (schema.format === histria_utils_1.JSONFORMATS.json) {
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
    let propType = histria_utils_1.schemaUtils.typeOfProperty(propSchema);
    switch (propType) {
        case histria_utils_1.JSONTYPES.id:
            //todo
            break;
        case histria_utils_1.JSONTYPES.boolean:
            //todo
            break;
        case histria_utils_1.JSONTYPES.integer:
            _validateInteger(value, propSchema.title || propName, ctx, error, state);
            break;
        case histria_utils_1.JSONTYPES.number:
            _validateNumber(value, propSchema.title || propName, ctx, error, state);
            break;
        case histria_utils_1.JSONTYPES.string:
            _validateString(value, propSchema, propSchema.title || propName, ctx, error, state);
            break;
    }
}
function validateAfterPropChanged(eventInfo, classOfInstance, instances, args) {
    return __awaiter(this, void 0, void 0, function* () {
        let propName = args[0];
        let instance = instances[0];
        let propSchema = instance.getSchema(propName);
        if (!propSchema)
            return;
        validateProp(args[1], propName, propSchema, instance.context, instance.$errors[propName], instance.$states[propName]);
    });
}
exports.validateAfterPropChanged = validateAfterPropChanged;
