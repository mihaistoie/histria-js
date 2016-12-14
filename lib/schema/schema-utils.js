"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const util = require("util");
const path = require("path");
const schema_consts_1 = require("./schema-consts");
const helper_1 = require("../utils/helper");
const promises = require("../utils/promises");
const errors_1 = require("../utils/errors");
const DEFINITION_STRING = '#/definitions/', DEFINITION_STRING_LEN = DEFINITION_STRING.length;
//reference :
// schema_name"
// schema_name.json"
// schema.json#/definitions/definition_name"
// #/definitions/definition_name"
function _load$ref(reference, model, definitions) {
    let ii = reference.indexOf(DEFINITION_STRING);
    let schemaId, defName;
    if (ii >= 0) {
        schemaId = reference.substr(0, ii);
        defName = reference.substr(ii + DEFINITION_STRING_LEN);
    }
    else
        schemaId = reference;
    if (schemaId) {
        ii = schemaId.indexOf('.json');
        if (ii >= 0)
            schemaId = schemaId.substr(0, ii);
    }
    if (!schemaId && !defName)
        throw new errors_1.ApplicationError(util.format('Unsupported schema $ref : "%s"', reference));
    let ref, def = definitions;
    if (schemaId) {
        ref = model[schemaId];
        if (!ref)
            throw new errors_1.ApplicationError(util.format('Schema not found "%s". ($ref : "%s")', schemaId, reference));
        if (defName)
            def = ref.definitions;
    }
    if (defName && (!def || !def[defName]))
        throw new errors_1.ApplicationError(util.format('Definition not found "%s". ($ref : "%s")', defName, reference));
    if (defName)
        ref = def[defName];
    return ref;
}
function _toMerge(item, callStack, model, definitions) {
    let toMerge = null;
    if (item.allOf) {
        toMerge = item.allOf;
        delete item.allOf;
    }
    else if (item.$ref) {
        if (callStack.indexOf(item.$ref) < 0) {
            toMerge = [{ $ref: item.$ref }];
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
                helper_1.merge(ref, ci);
            }
            _expand$Ref(ci, newCallStack, model, definitions);
            helper_1.merge(ci, item);
        });
    }
}
function _expand$Ref(item, callStack, model, definitions) {
    if (item._expanded)
        return;
    item._expanded = true;
    let currentCallStack = callStack.slice(0);
    _toMerge(item, currentCallStack, model, definitions);
    let toExpand = null;
    if (item.properties) {
        toExpand = item;
    }
    else if (item.type === schema_consts_1.JSONTYPES.array && item.items) {
        toExpand = item.items;
    }
    if (toExpand && toExpand.properties) {
        Object.keys(toExpand.properties).forEach(name => {
            let prop = toExpand.properties[name];
            if (prop.allOf || prop.$ref)
                _toMerge(prop, callStack, model, definitions);
            if (prop.type === schema_consts_1.JSONTYPES.array && prop.items) {
                if (prop.items.allOf || prop.items.$ref)
                    _toMerge(prop.items, callStack, model, definitions);
            }
        });
    }
}
function typeOfProperty(propSchema) {
    let ps = propSchema.type || schema_consts_1.JSONTYPES.string;
    if (!schema_consts_1.JSONTYPES[ps])
        throw new errors_1.ApplicationError(util.format('Unsupported schema type : "%s"', propSchema.type));
    if (propSchema.format) {
        if (ps === 'string') {
            if (propSchema.format === schema_consts_1.JSONTYPES.date)
                return schema_consts_1.JSONTYPES.date;
            else if (propSchema.format === schema_consts_1.JSONTYPES.datetime)
                return schema_consts_1.JSONTYPES.datetime;
        }
    }
    return ps;
}
exports.typeOfProperty = typeOfProperty;
function isHidden(propSchema) {
    return false;
}
exports.isHidden = isHidden;
function isComplex(schema) {
    return (schema.type === schema_consts_1.JSONTYPES.array || schema.type === schema_consts_1.JSONTYPES.object);
}
exports.isComplex = isComplex;
function expandSchema(schema, model) {
    _expand$Ref(schema, [], model, schema.definitions);
}
exports.expandSchema = expandSchema;
function loadJsonFromFile(jsonFile) {
    return __awaiter(this, void 0, void 0, function* () {
        let data = yield promises.fs.readFile(jsonFile);
        return JSON.parse(data.toString());
    });
}
function loadModel(pathToModel, model) {
    return __awaiter(this, void 0, void 0, function* () {
        let files = yield promises.fs.readdir(pathToModel);
        let stats;
        let folders = [];
        stats = yield Promise.all(files.map((fileName) => {
            let fn = path.join(pathToModel, fileName);
            return promises.fs.lstat(fn);
        }));
        let jsonFiles = [];
        stats.forEach((stat, index) => {
            let fn = path.join(pathToModel, files[index]);
            if (stat.isDirectory())
                return;
            if (path.extname(fn) === '.json') {
                jsonFiles.push(fn);
            }
        });
        let modelByJsonFile = {};
        let schemas = yield Promise.all(jsonFiles.map((fileName) => {
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
    });
}
exports.loadModel = loadModel;
