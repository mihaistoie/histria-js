import * as util from 'util';


import { State, EnumState, IntegerState, NumberState, DateState, DateTimeState, RefObjectState, RefArrayState, StringState } from './state';
import { ErrorState } from './error-state';
import { IntegerValue, NumberValue } from './number';
import * as schemaUtils from '../schema/schema-utils';
import { JSONTYPES } from '../schema/schema-consts';
import { messages } from '../locale/messages';
import { format } from '../utils/helper';
import { UserContext } from './interfaces';



function _validateInteger(value: number, propTitle: string, ctx: UserContext, error: ErrorState, state: IntegerState): boolean {
    let res = true, msg = messages(ctx.lang);
    if (state.exclusiveMinimum) {
        if (state.minimum != undefined && value <= state.minimum) {
            error.error = format(msg.schema.minNumberExclusive, propTitle, ctx.formatNumber(state.minimum, 0));
        }
    } else {
        if (state.minimum != undefined && value < state.minimum) {
            error.error = format(msg.schema.minNumber, propTitle, ctx.formatNumber(state.minimum, 0));
            res = false;
        }
    }
    if (state.exclusiveMaximum) {
        if (state.maximum != undefined && value >= state.maximum) {
            error.error = format(msg.schema.maxNumberExclusive, propTitle, ctx.formatNumber(state.maximum, 0));
            res = false;
        }
    } else {
        if (state.maximum != undefined && value > state.maximum) {
            error.error = format(msg.schema.maxNumber, propTitle, ctx.formatNumber(state.maximum, 0));
            res = false;
        }

    }
    return res;
}


function validateProp(value: any, propName, propSchema: any, ctx: UserContext, error: ErrorState, state: State, userContext) {
    let propType = schemaUtils.typeOfProperty(propSchema);
    switch (propType) {
        case JSONTYPES.integer:
            _validateInteger(value, propSchema.title || propName, ctx, error, <IntegerState>state);
            break;
        case JSONTYPES.number:
            break;
    }
} 