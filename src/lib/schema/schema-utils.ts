
import * as util from 'util';


import { JSONTYPES } from './schema-consts';
import { merge } from '../utils/helper'
import { ApplicationError } from '../utils/errors'


const
    DEFINITION_STRING = '#/definitions/',
    DEFINITION_STRING_LEN = DEFINITION_STRING.length;

//reference :
// schema_name"
// schema_name.json"
// schema.json#/definitions/definition_name"
// #/definitions/definition_name"

function _load$ref(reference: string, model: any, definitions: any): any {
    let ii = reference.indexOf(DEFINITION_STRING);
    let schemaId, defName: string;
    if (ii >= 0) {
        schemaId = reference.substr(0, ii);
        defName = reference.substr(ii + DEFINITION_STRING_LEN);
    } else
        schemaId = reference;
    if (schemaId) {
        ii = schemaId.indexOf('.json');
        if (ii >= 0)
            schemaId = schemaId.substr(0, ii);
    }
    if (!schemaId && !defName)
        throw new ApplicationError(util.format('Unsupported schema $ref : "%s"', reference));
    let ref, def = definitions;
    if (schemaId) {
        ref = model[schemaId];
        if (!ref)
            throw new ApplicationError(util.format('Schema not found "%s". ($ref : "%s")', schemaId, reference));
        if (defName)
            def = ref.definitions;
    }

    if (defName && (!def || !def[defName]))
        throw new ApplicationError(util.format('Definition not found "%s". ($ref : "%s")', defName, reference));
    if (defName)
        ref = def[defName];
    return ref;
}


function _toMerge(item: any, callStack: string[], model, definitions): void {
    let toMerge = null;
    if (item.allOf) {
        toMerge = item.allOf;
        delete item.allOf;
    } else if (item.$ref) {
        if (callStack.indexOf(item.$ref) < 0) {
            toMerge = [{ $ref: item.$ref }]
            delete item.$ref;
        }
    }
    if (toMerge) {
        toMerge.forEach(function (ci) {
            let newCallStack = callStack.slice(0);
            if (ci.$ref) {
                let ref = _load$ref(ci.$ref, model, definitions);
                newCallStack.push(ci.$ref);
                delete ci.$ref;
                merge(ref, ci);
            }
            _expand$Ref(ci, newCallStack, model, definitions);
            merge(ci, item);
        });
    }

}


function _expand$Ref(item: any, callStack: string[], model: any, definitions: any): void {
    let currentCallStack = callStack.slice(0);
    _toMerge(item, currentCallStack, model, definitions);
    let toExpand = null;
    if (item.properties) {
        toExpand = item;
    } else if (item.type === JSONTYPES.array && item.items) {
        toExpand = item.items;
    }
    if (toExpand && toExpand.properties) {
        Object.keys(toExpand.properties).forEach(name => {
            let prop = toExpand.properties[name];
            if (prop.allOf || prop.$ref)
                _toMerge(prop, callStack, model, definitions);
            if (prop.type === JSONTYPES.array && prop.items) {
                if (prop.items.allOf || prop.items.$ref)
                    _toMerge(prop.items, callStack, model, definitions);
            }
        });
    }
}


export function typeOfProperty(propSchema: { type?: string, format?: string, reference?: string }): string {
    let ps = propSchema.type || JSONTYPES.string;
    if (!JSONTYPES[ps])
        throw new ApplicationError(util.format('Unsupported schema type : "%s"', propSchema.type));
    if (propSchema.format) {
        if (ps === 'string') {
            if (propSchema.format === JSONTYPES.date)
                return JSONTYPES.date;
            else if (propSchema.format === JSONTYPES.datetime)
                return JSONTYPES.datetime;
        }
    }
    if (isComplex(propSchema) && propSchema.reference) {
        if (isArray(propSchema))
            return JSONTYPES.refarray;
        else
            return JSONTYPES.refobject;


    }
    return ps;
}


export function isComplex(schema: any) {
    return (schema.type === JSONTYPES.array || schema.type === JSONTYPES.object);
}

export function isArray(schema: any) {
    return (schema.type === JSONTYPES.array);
}

export function isComposition(schema: any) {
    return isComplex(schema) && !schema.reference;
}

export function expandSchema(schema: any, model: any) {
    _expand$Ref(schema, [], model, schema.definitions);
}
