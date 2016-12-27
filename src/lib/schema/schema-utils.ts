
import * as util from 'util';
import * as fs from 'fs';
import * as path from 'path';



import { JSONTYPES, JSONRELATIONS } from './schema-consts';
import { merge, clone } from '../utils/helper'
import * as promises from '../utils/promises'

import { ApplicationError } from '../utils/errors'


const
    DEFINITION_STRING = '#/definitions/',
    DEFINITION_STRING_LEN = DEFINITION_STRING.length;


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
    return ps;
}

export function isHidden(propSchema: any): boolean {
    return propSchema.isHidden === true;
}

export function isReadOnly(propSchema: any): boolean {
    return (propSchema.generated === true || propSchema.isReadOnly === true);
}


export function isComplex(schema: any) {
    return (schema.type === JSONTYPES.array || schema.type === JSONTYPES.object);
}

export function expandSchema(schema: any, model: any) {
    _expand$Ref(schema, [], model, schema.definitions);
}


function idDefinition(): any {
    return { type: JSONTYPES.integer, generated: true };
}

function refIdDefinition(): any {
    return { type: JSONTYPES.integer, isReadOnly: true };
}



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
            def = model[schemaId].definitions;
        else
            ref = clone(model[schemaId]);
    }

    if (defName && (!def || !def[defName]))
        throw new ApplicationError(util.format('Definition not found "%s". ($ref : "%s")', defName, reference));
    if (defName)
        ref = clone(def[defName]);
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



async function loadJsonFromFile(jsonFile: string): Promise<any> {
    let data = await promises.fs.readFile(jsonFile);
    return JSON.parse(data.toString());
}

function _checkModel(schema, model) {
    schema.properties = schema.properties || {};
    schema.properties.id = idDefinition();
}


function _checkRelations(schema, model) {
    schema.relations && schema.relations.forEach(relName => {
        let rel = schema.relations[relName];
        rel.type = rel.type || JSONRELATIONS.association;
        rel.title = rel.title || relName;
        rel.multiplicity = rel.multiplicity || 'one';
        if (!rel.model || !model[rel.model])
            throw util.format('Invalid relation "%s.%s", invalid remote entity(model).', schema.name, relName);
        let refModel = model[rel.model];
        if (rel.type !== JSONRELATIONS.association) {
            if (!rel.invRel)
                throw util.format('Invalid relation "%s.%s", inverse relation (invRel) is empty.', schema.name, relName);
        }
        //           if (!refModel.relations || !refModel.relations[invRel]) 
        //        throw util.format('Invalid relation %s.%s, inverse relation (invRel) is empty.', schema.name, relName);
        //    let invRel = 



        if (!rel.localFields) {
            if (rel.multiplicity === 'one') {
                if (rel.type ===  JSONRELATIONS.association) {
                    rel.localFields = [refModel.name + 'Id'];
                    if (!rel.foreignFields)
                        rel.foreignFields = ['id']
                }

            } else { //rel.multiplicity === 'many'
                rel.localFields = ['id'];
            }
        }

        if (!rel.foreignFields) {
            if (rel.multiplicity === 'one') {

            } else { //rel.multiplicity === 'many'
                rel.localFields = ['id'];
            }
        }
        if (rel.foreignFields.length !== rel.localFields.length)
            throw util.format('Invalid relation "%s.%s", #foreignFields != #localFields.', schema.name, relName);
        // check fields
        rel.localFields.forEach((lf, index) => {
            let rf = rel.foreignFields[index];
            let crf = lf === 'id', clf = rf === 'id';
            if (crf && !refModel.properties[rf]) {
                refModel.properties[rf] = refIdDefinition();
            } else if (clf && !schema.properties[lf]) {
                schema.properties[lf] = refIdDefinition();
            }
            if (schema.properties[lf]) 
                throw util.format('Invalid relation "%s.%s", "%s.%s" - field not found.', schema.name, relName, schema.name, lf);
            if (refModel.properties[rf]) 
                throw util.format('Invalid relation "%s.%s", "%s.%s" - field not found.', schema.name, relName, refModel.name, rf);
            if (refModel.properties[rf].type !== schema.properties[lf]) 
                throw util.format('Invalid relation "%s.%s", typeof %s != typeof %s.', schema.name, relName);
        });
    });
}


export async function loadModel(pathToModel: string, model: any): Promise<void> {
    let files = await promises.fs.readdir(pathToModel);
    let stats: fs.Stats[];
    let folders = [];
    stats = await Promise.all(files.map((fileName) => {
        let fn = path.join(pathToModel, fileName);
        return promises.fs.lstat(fn);
    }));
    let jsonFiles = [];
    stats.forEach((stat, index) => {
        let fn = path.join(pathToModel, files[index]);
        if (stat.isDirectory()) return;
        if (path.extname(fn) === '.json') {
            jsonFiles.push(fn);
        }
    });
    let modelByJsonFile = {};
    let schemas = await Promise.all(jsonFiles.map((fileName) => {
        return loadJsonFromFile(fileName);
    }));

    jsonFiles.forEach((fileName, index) => {
        let p = path.parse(fileName);
        let schema = schemas[index];
        schema.name = schema.name || p.name;
        modelByJsonFile[p.name + '.' + p.ext] = schema;
    });
    schemas.forEach((schema) => {
        _expand$Ref(schema, [], modelByJsonFile, schema.definitions);
        model[schema.name] = schema;
    });
    schemas.forEach(schema => {
        _checkModel(schema, model);
    });
    schemas.forEach(schema => {
        _checkRelations(schema, model);
    });

}
