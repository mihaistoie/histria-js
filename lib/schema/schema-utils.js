"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const util = require("util");
const path = require("path");
const schema_consts_1 = require("./schema-consts");
const helper_1 = require("../utils/helper");
const promises = require("../utils/promises");
const errors_1 = require("../utils/errors");
const DEFINITION_STRING = '#/definitions/', DEFINITION_STRING_LEN = DEFINITION_STRING.length;
function typeOfProperty(propSchema) {
    let ps = propSchema.type || schema_consts_1.JSONTYPES.string;
    if (!schema_consts_1.JSONTYPES[ps])
        throw new errors_1.ApplicationError(util.format('Unsupported schema type : "%s"', propSchema.type));
    if (propSchema.format) {
        if (ps === schema_consts_1.JSONTYPES.string) {
            if (propSchema.format === schema_consts_1.JSONTYPES.date)
                return schema_consts_1.JSONTYPES.date;
            else if (propSchema.format === schema_consts_1.JSONTYPES.datetime)
                return schema_consts_1.JSONTYPES.datetime;
            else if (propSchema.format === schema_consts_1.JSONTYPES.id)
                return schema_consts_1.JSONTYPES.id;
        }
        else if (ps === schema_consts_1.JSONTYPES.integer) {
            if (propSchema.format === schema_consts_1.JSONTYPES.id)
                return schema_consts_1.JSONTYPES.id;
        }
    }
    return ps;
}
exports.typeOfProperty = typeOfProperty;
function isHidden(propSchema) {
    return propSchema.isHidden === true;
}
exports.isHidden = isHidden;
function isReadOnly(propSchema) {
    return (propSchema.generated === true || propSchema.isReadOnly === true);
}
exports.isReadOnly = isReadOnly;
function isComplex(schema) {
    return (schema.type === schema_consts_1.JSONTYPES.array || schema.type === schema_consts_1.JSONTYPES.object);
}
exports.isComplex = isComplex;
function expandSchema(schema, model) {
    _expand$Ref(schema, [], model, schema.definitions);
}
exports.expandSchema = expandSchema;
function updateRoleRefs(role, localModel, foreignModel, useInv) {
    if (!localModel)
        return;
    if (!role)
        return;
    if (useInv) {
        if (role.foreignFields && role.foreignFields.length)
            role.foreignFields.forEach((field, index) => {
                let ff = role.localFields[index];
                if (foreignModel)
                    localModel[field] = foreignModel[ff];
                else
                    delete localModel[field];
            });
    }
    else {
        if (role.localFields && role.localFields.length)
            role.localFields.forEach((field, index) => {
                let ff = role.foreignFields[index];
                if (foreignModel)
                    localModel[field] = foreignModel[ff];
                else
                    delete localModel[field];
            });
    }
}
exports.updateRoleRefs = updateRoleRefs;
function enumCompositions(relations, cb) {
    relations && Object.keys(relations).forEach(relationName => {
        let relation = relations[relationName];
        if (relation.aggregationKind === schema_consts_1.AGGREGATION_KIND.composite && (relation.type === schema_consts_1.RELATION_TYPE.hasOne || relation.type === schema_consts_1.RELATION_TYPE.hasMany)) {
            cb(relationName, relation);
        }
    });
}
exports.enumCompositions = enumCompositions;
function idDefinition() {
    return { type: schema_consts_1.JSONTYPES.integer, generated: true, format: schema_consts_1.JSONTYPES.id };
}
function refIdDefinition() {
    return { type: schema_consts_1.JSONTYPES.integer, isReadOnly: true, format: schema_consts_1.JSONTYPES.id };
}
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
            def = model[schemaId].definitions;
        else
            ref = helper_1.clone(model[schemaId]);
    }
    if (defName && (!def || !def[defName]))
        throw new errors_1.ApplicationError(util.format('Definition not found "%s". ($ref : "%s")', defName, reference));
    if (defName)
        ref = helper_1.clone(def[defName]);
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
function loadJsonFromFile(jsonFile) {
    return __awaiter(this, void 0, void 0, function* () {
        let data = yield promises.fs.readFile(jsonFile);
        let parsedJson = null;
        try {
            parsedJson = JSON.parse(data.toString());
        }
        catch (ex) {
            console.log(jsonFile);
            throw ex;
        }
        return parsedJson;
    });
}
function _checkModel(schema, model) {
    schema.properties = schema.properties || {};
    schema.properties.id = idDefinition();
}
function _checkRelations(schema, model) {
    schema.relations && Object.keys(schema.relations).forEach(relName => {
        let rel = schema.relations[relName];
        rel.nameSpace = rel.nameSpace || schema.nameSpace;
        if (!rel.type)
            throw util.format('Invalid relation "%s.%s", type is missing.', schema.name, relName);
        rel.title = rel.title || relName;
        if (rel.type === schema_consts_1.RELATION_TYPE.belongsTo) {
            rel.aggregationKind = rel.aggregationKind || schema_consts_1.AGGREGATION_KIND.composite;
            if (rel.aggregationKind === schema_consts_1.AGGREGATION_KIND.none) {
                throw util.format('Invalid relation "%s.%s", aggregationKind must be composite or shared.', schema.name, relName);
            }
        }
        else {
            rel.aggregationKind = rel.aggregationKind || schema_consts_1.AGGREGATION_KIND.none;
        }
        if (!rel.model || !model[rel.model])
            throw util.format('Invalid relation "%s.%s", invalid remote entity(model).', schema.name, relName);
        let refModel = model[rel.model];
        let refRel = null;
        if (rel.invRel) {
            refModel.relations = refModel.relations || {};
            refRel = refModel.relations[rel.invRel];
        }
        let isCompositionParent = (rel.aggregationKind === schema_consts_1.AGGREGATION_KIND.composite) && (rel.type !== schema_consts_1.RELATION_TYPE.belongsTo);
        if (!refRel && (rel.aggregationKind !== schema_consts_1.AGGREGATION_KIND.none)) {
            if (!isCompositionParent)
                throw util.format('Invalid relation "%s.%s", invRel for aggregations and compositions is required.', schema.name, relName);
        }
        if (refRel) {
            if (refRel.type === schema_consts_1.RELATION_TYPE.belongsTo) {
                refRel.aggregationKind = refRel.aggregationKind || schema_consts_1.AGGREGATION_KIND.composite;
                if (rel.aggregationKind === schema_consts_1.AGGREGATION_KIND.none) {
                    throw util.format('Invalid relation "%s.%s", aggregationKind must be composite or shared.', schema.name, relName);
                }
            }
            else
                refRel.aggregationKind = refRel.aggregationKind || schema_consts_1.AGGREGATION_KIND.none;
            if (refRel.aggregationKind !== rel.aggregationKind) {
                throw util.format('Invalid type  %s.%s.aggregationKind !== %s.%s.aggregationKind.', schema.name, relName, refModel.name, rel.invRel);
            }
            if (refRel.type === rel.type) {
                throw util.format('Invalid type  %s.%s.type === %s.%s.type.', schema.name, relName, refModel.name, rel.invRel);
            }
            rel.invType = refRel.type;
        }
        if (!rel.localFields || !rel.foreignFields) {
            if (rel.type === schema_consts_1.RELATION_TYPE.hasOne) {
                if (rel.aggregationKind === schema_consts_1.AGGREGATION_KIND.none) {
                    rel.localFields = [relName + 'Id'];
                    rel.foreignFields = ['id'];
                }
                else {
                    //ref rel is belongsTo
                    if (refRel) {
                        rel.localFields = ['id'];
                        rel.foreignFields = [rel.invRel + 'Id'];
                    }
                }
            }
            else if (rel.type === schema_consts_1.RELATION_TYPE.belongsTo) {
                rel.localFields = [relName + 'Id'];
                rel.foreignFields = ['id'];
            }
            else if (rel.type === schema_consts_1.RELATION_TYPE.hasMany) {
                if (refRel) {
                    rel.localFields = ['id'];
                    rel.foreignFields = [rel.invRel + 'Id'];
                }
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
            }
            else if (clf && !schema.properties[lf]) {
                schema.properties[lf] = refIdDefinition();
            }
            if (!schema.properties[lf])
                throw util.format('Invalid relation "%s.%s", "%s.%s" - field not found.', schema.name, relName, schema.name, lf);
            if (!refModel.properties[rf])
                throw util.format('Invalid relation "%s.%s", "%s.%s" - field not found.', schema.name, relName, refModel.name, rf);
            if (refModel.properties[rf].type !== schema.properties[lf].type)
                throw util.format('Invalid relation "%s.%s", typeof %s != typeof %s.', schema.name, relName);
        });
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
        schemas.forEach(schema => {
            _checkModel(schema, model);
        });
        schemas.forEach(schema => {
            _checkRelations(schema, model);
        });
    });
}
exports.loadModel = loadModel;
