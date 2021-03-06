"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const histria_utils_1 = require("histria-utils");
function _validateEmail(email) {
    const re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
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
    let res = true;
    const msg = histria_utils_1.messages(ctx.lang);
    if (state.exclusiveMinimum) {
        if (state.minimum !== undefined && value <= state.minimum) {
            error.error = histria_utils_1.helper.format(msg.schema.minNumberExclusive, propTitle, ctx.formatNumber(state.minimum, 0));
        }
    }
    else {
        if (state.minimum !== undefined && value < state.minimum) {
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
    let res = true;
    const msg = histria_utils_1.messages(ctx.lang);
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
    let res = true;
    const msg = histria_utils_1.messages(ctx.lang);
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
            const lError = {};
            if (value && !_validateJson(value, lError)) {
                error.error = lError;
                res = false;
            }
        }
    }
    return res;
}
function validateProp(value, propName, propSchema, ctx, error, state) {
    const propType = histria_utils_1.schemaUtils.typeOfProperty(propSchema);
    switch (propType) {
        case histria_utils_1.JSONTYPES.id:
            // TODO
            break;
        case histria_utils_1.JSONTYPES.boolean:
            // TODO
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
async function validateAfterPropChanged(eventInfo, classOfInstance, instances, args) {
    const propName = args[0];
    const instance = instances[0];
    const propSchema = instance.getSchema(propName);
    if (!propSchema)
        return true;
    validateProp(args[1], propName, propSchema, instance.context, instance.$errors[propName], instance.$states[propName]);
    return true;
}
exports.validateAfterPropChanged = validateAfterPropChanged;

//# sourceMappingURL=validation.js.map
