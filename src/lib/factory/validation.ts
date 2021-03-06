import { State, EnumState, IntegerState, NumberState, DateState, DateTimeState, RefObjectState, RefArrayState, StringState } from '../model/states/state';
import { ErrorState } from '../model/states/error-state';
import { JSONTYPES, JSONFORMATS, schemaUtils, messages, helper } from 'histria-utils';
import { IUserContext, IEventInfo } from '../model/interfaces';

function _validateEmail(email: string): boolean {
    const re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    return re.test(email);
}

function _validateJson(value: string, error: any): boolean {
    try {
        JSON.parse(value);
    } catch (ex) {
        error.ex = ex;
        return false;
    }
    return true;

}

function _validateInteger(value: number, propTitle: string, ctx: IUserContext, error: ErrorState, state: IntegerState): boolean {
    let res = true;
    const msg = messages(ctx.lang);
    if (state.exclusiveMinimum) {
        if (state.minimum !== undefined && value <= state.minimum) {
            error.error = helper.format(msg.schema.minNumberExclusive, propTitle, ctx.formatNumber(state.minimum, 0));
        }
    } else {
        if (state.minimum !== undefined && value < state.minimum) {
            error.error = helper.format(msg.schema.minNumber, propTitle, ctx.formatNumber(state.minimum, 0));
            res = false;
        }
    }
    if (state.exclusiveMaximum) {
        if (state.maximum !== undefined && value >= state.maximum) {
            error.error = helper.format(msg.schema.maxNumberExclusive, propTitle, ctx.formatNumber(state.maximum, 0));
            res = false;
        }
    } else {
        if (state.maximum !== undefined && value > state.maximum) {
            error.error = helper.format(msg.schema.maxNumber, propTitle, ctx.formatNumber(state.maximum, 0));
            res = false;
        }

    }
    return res;
}

function _validateNumber(value: number, propTitle: string, ctx: IUserContext, error: ErrorState, state: NumberState): boolean {
    let res = true;
    const msg = messages(ctx.lang);
    if (state.exclusiveMinimum) {
        if (state.minimum !== undefined && value <= state.minimum) {
            error.error = helper.format(msg.schema.minNumberExclusive, propTitle, ctx.formatNumber(state.minimum, state.decimals));
        }
    } else {
        if (state.minimum !== undefined && value < state.minimum) {
            error.error = helper.format(msg.schema.minNumber, propTitle, ctx.formatNumber(state.minimum, state.decimals));
            res = false;
        }
    }
    if (state.exclusiveMaximum) {
        if (state.maximum !== undefined && value >= state.maximum) {
            error.error = helper.format(msg.schema.maxNumberExclusive, propTitle, ctx.formatNumber(state.maximum, state.decimals));
            res = false;
        }
    } else {
        if (state.maximum !== undefined && value > state.maximum) {
            error.error = helper.format(msg.schema.maxNumber, propTitle, ctx.formatNumber(state.maximum, state.decimals));
            res = false;
        }

    }
    return res;
}

function _validateString(value: string, schema: any, propTitle: string, ctx: IUserContext, error: ErrorState, state: StringState): boolean {
    let res = true;
    const msg = messages(ctx.lang);
    if (state.isMandatory && !value && (value === '' || value === undefined || value === null)) {
        error.error = helper.format(msg.schema.required, propTitle);
        res = false;
    }
    if (schema.format) {
        if (schema.format === JSONFORMATS.email) {
            if (value && !_validateEmail(value)) {
                error.error = msg.schema.invalidEmail;
                res = false;
            }
        } else if (schema.format === JSONFORMATS.json) {
            const lError: any = {};
            if (value && !_validateJson(value, lError)) {
                error.error = lError;
                res = false;
            }
        }
    }

    return res;
}

function validateProp(value: any, propName: string, propSchema: any, ctx: IUserContext, error: ErrorState, state: State) {
    const propType = schemaUtils.typeOfProperty(propSchema);
    switch (propType) {
        case JSONTYPES.id:
            // TODO
            break;
        case JSONTYPES.boolean:
            // TODO
            break;
        case JSONTYPES.integer:
            _validateInteger(value, propSchema.title || propName, ctx, error, state as IntegerState);
            break;
        case JSONTYPES.number:
            _validateNumber(value, propSchema.title || propName, ctx, error, state as NumberState);
            break;
        case JSONTYPES.string:
            _validateString(value, propSchema, propSchema.title || propName, ctx, error, state as StringState);
            break;
    }
}

export async function validateAfterPropChanged(eventInfo: IEventInfo, classOfInstance: any, instances: any, args?: any[]): Promise<boolean> {
    const propName = args[0];
    const instance = instances[0];
    const propSchema = instance.getSchema(propName);
    if (!propSchema) return true;
    validateProp(args[1], propName, propSchema, instance.context as IUserContext, instance.$errors[propName] as ErrorState, instance.$states[propName] as State);
    return true;
}
