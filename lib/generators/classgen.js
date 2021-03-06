"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util = require("util");
const path = require("path");
const fs = require("fs");
const histria_utils_1 = require("histria-utils");
async function saveCode(codeByClass, codeByNamespace, dstFolder) {
    const writersClasses = Object.keys(codeByClass).map(name => {
        const item = codeByClass[name];
        return util.promisify(fs.writeFile)(path.join(dstFolder, item.fileName + '.ts'), item.code.join('\n'));
    });
    const writersNamespaces = Object.keys(codeByNamespace).map(name => {
        const item = codeByNamespace[name];
        return util.promisify(fs.writeFile)(path.join(dstFolder, item.fileName + '.ts'), item.import.concat(item.code).join('\n'));
    });
    await Promise.all(writersClasses.concat(writersNamespaces));
}
function _generate(codeByClass, codeByNameSpace, model, pathToLib) {
    const baseClass = 'Instance';
    const baseViewClass = 'View';
    Object.keys(model).forEach((fullName) => {
        const schema = model[fullName];
        const isView = schema.view ? true : false;
        const className = schema.name.charAt(0).toUpperCase() + schema.name.substr(1);
        schema.nameSpace = schema.nameSpace || className;
        let code = [];
        const imports = [];
        let ns = codeByNameSpace[schema.nameSpace];
        if (!ns) {
            ns = { code: [], import: [], fileName: _extractFileName(schema.nameSpace) + '-model' };
            ns.import.push('import { modelManager } from \'' + pathToLib + '\';');
            ns.import.push('');
            codeByNameSpace[schema.nameSpace] = ns;
        }
        const cc = {};
        pathToLib = pathToLib || 'histria--utils';
        imports.push('import {');
        imports.push(_tab(1) + 'Instance, View, InstanceState, InstanceErrors, modelManager,');
        imports.push(_tab(1) + 'HasManyComposition, HasManyAggregation, HasManyRefObject,');
        imports.push(_tab(1) + 'ErrorState, State, StringState, IdState, BooleanState, IntegerState,');
        imports.push(_tab(1) + 'EnumState, NumberState, DateState, DateTimeState, RefArrayState, RefObjectState,');
        imports.push(_tab(1) + 'NumberValue');
        imports.push('} from \'' + pathToLib + '\';');
        // Generate Class
        ns.import.push(util.format('import { %s, %s_SCHEMA } from \'./%s\';', className, className.toUpperCase(), _extractFileName(schema.name)));
        ns.import.push(util.format('export { %s } from \'./%s\';', className, _extractFileName(schema.name)));
        // code.push('');
        code.push(util.format('export class %s extends %s {', className, isView ? baseViewClass : baseClass));
        code.push(_tab(1) + util.format('public static isPersistent: boolean = %s;', isView ? 'false' : 'true'));
        // Add public properties
        _genSchemaProperties(schema, code, model);
        if (schema.view)
            _genVewRelations(schema, code, model);
        else
            _genSchemaRelations(schema, code, model);
        code.push(_tab(1) + util.format('public get $states(): %sState {', className));
        code.push(_tab(2) + util.format('return this._states as %sState;', className));
        code.push(_tab(1) + '}');
        code.push(_tab(1) + util.format('public get $errors(): %sErrors {', className));
        code.push(_tab(2) + util.format('return this._errors as %sErrors;', className));
        code.push(_tab(1) + '}');
        // Add constructor
        code.push(_tab(1) + 'protected init() {');
        code.push(_tab(2) + 'super.init();');
        code.push(_tab(2) + util.format('this._schema = %s_SCHEMA;', className.toUpperCase()));
        code.push(_tab(1) + '}');
        code.push(_tab(1) + 'protected createStates() {');
        code.push(_tab(2) + util.format('this._states = new %sState(this, this._schema);', className));
        code.push(_tab(1) + '}');
        code.push(_tab(1) + 'protected createErrors() {');
        code.push(_tab(2) + util.format('this._errors = new %sErrors(this, this._schema);', className));
        code.push(_tab(1) + '}');
        code.push('}');
        _genClassErrors(schema, className, baseClass, code);
        _genClassState(schema, className, baseClass, code);
        // Generate
        if (schema.relations)
            Object.keys(schema.relations).forEach(relName => {
                const relation = schema.relations[relName];
                if (relation.model !== schema.name) {
                    const s = util.format('import { %s } from \'./%s\';', relation.model.charAt(0).toUpperCase() +
                        relation.model.substr(1), _extractFileName(relation.model));
                    if (imports.indexOf(s) < 0) {
                        imports.push(s);
                    }
                }
            });
        imports.push('');
        _genSchema(schema, className, code);
        ns.code.push(util.format('modelManager().registerClass(%s, %s_SCHEMA);', className, className.toUpperCase()));
        code = imports.concat(code);
        codeByClass[schema.name.toLowerCase()] = {
            fileName: _extractFileName(schema.name),
            code: code,
            depends: []
        };
    });
}
function _genSchemaProperties(schema, code, model) {
    Object.keys(schema.properties || {}).forEach(propertyName => {
        const propSchema = schema.properties[propertyName];
        if (histria_utils_1.schemaUtils.isHidden(propSchema) || histria_utils_1.schemaUtils.isComplex(propSchema))
            return;
        const stype = histria_utils_1.schemaUtils.typeOfProperty(propSchema);
        const isReadOnly = histria_utils_1.schemaUtils.isReadOnly(propSchema);
        switch (stype) {
            case histria_utils_1.JSONTYPES.string:
                code.push(_tab(1) + util.format('public get %s(): string {', propertyName));
                code.push(_tab(2) + util.format('return this.getPropertyByName(\'%s\');', propertyName));
                code.push(_tab(1) + '}');
                if (!isReadOnly) {
                    code.push(_tab(1) + util.format('public set%s(value: string): Promise<string> {', _upperFirstLetter(propertyName)));
                    code.push(_tab(2) + util.format('return this.setPropertyByName(\'%s\', value);', propertyName));
                    code.push(_tab(1) + '}');
                }
                break;
            case histria_utils_1.JSONTYPES.boolean:
                code.push(_tab(1) + util.format('public get %s(): boolean {', propertyName));
                code.push(_tab(2) + util.format('return this.getPropertyByName(\'%s\');', propertyName));
                code.push(_tab(1) + '}');
                if (!isReadOnly) {
                    code.push(_tab(1) + util.format('public set%s(value: boolean): Promise<boolean> {', _upperFirstLetter(propertyName)));
                    code.push(_tab(2) + util.format('return this.setPropertyByName(\'%s\', value);', propertyName));
                    code.push(_tab(1) + '}');
                }
                break;
            case histria_utils_1.JSONTYPES.id:
                code.push(_tab(1) + util.format('public get %s(): any {', propertyName));
                code.push(_tab(2) + util.format('return this._children.%s.value;', propertyName));
                code.push(_tab(1) + '}');
                break;
            case histria_utils_1.JSONTYPES.integer:
                code.push(_tab(1) + util.format('public get %s(): number {', propertyName));
                code.push(_tab(2) + util.format('return this._children.%s.value;', propertyName));
                code.push(_tab(1) + '}');
                if (!isReadOnly) {
                    code.push(_tab(1) + util.format('public set%s(value: number): Promise<number> {', _upperFirstLetter(propertyName)));
                    code.push(_tab(2) + util.format('return this._children.%s.setValue(value);', propertyName));
                    code.push(_tab(1) + '}');
                }
                break;
            case histria_utils_1.JSONTYPES.number:
                code.push(_tab(1) + util.format('public get %s(): NumberValue {', propertyName));
                code.push(_tab(2) + util.format('return this._children.%s;', propertyName));
                code.push(_tab(1) + '}');
                break;
        }
    });
}
function _genVewRelations(schema, code, model) {
    if (schema.relations)
        Object.keys(schema.relations).forEach(relationName => {
            const relation = schema.relations[relationName];
            const refFullName = (relation.nameSpace || schema.nameSpace) + '.' + relation.model;
            const refClass = relation.model.charAt(0).toUpperCase() + relation.model.substr(1);
            switch (relation.type) {
                case histria_utils_1.RELATION_TYPE.hasOne:
                    code.push(_tab(1) + util.format('public %s(): Promise<%s> {', relationName, refClass));
                    code.push(_tab(2) + util.format('return this._children.%s.getValue();', relationName));
                    code.push(_tab(1) + '}');
                    code.push(_tab(1) + util.format('public set%s(value: %s): Promise<%s> {', _upperFirstLetter(relationName), refClass, refClass));
                    code.push(_tab(2) + util.format('return this._children.%s.setValue(value);', relationName));
                    code.push(_tab(1) + '}');
                    break;
                case histria_utils_1.RELATION_TYPE.belongsTo:
                    code.push(_tab(1) + util.format('public %s(): Promise<%s> {', relationName, refClass));
                    code.push(_tab(2) + util.format('return this._children.%s.getValue();', relationName));
                    code.push(_tab(1) + '}');
                    code.push(_tab(1) + util.format('public set%s(value: %s): Promise<%s> {', _upperFirstLetter(relationName), refClass, refClass));
                    code.push(_tab(2) + util.format('return this._children.%s.setValue(value);', relationName));
                    code.push(_tab(1) + '}');
                    break;
                case histria_utils_1.RELATION_TYPE.hasMany:
                    const refModel = model[refFullName];
                    if (refModel.view) {
                        code.push(_tab(1) + util.format('get %s(): HasManyComposition<%s> {', relationName, refClass));
                        code.push(_tab(2) + util.format('return this._children.%s;', relationName));
                        code.push(_tab(1) + '}');
                    }
                    else {
                        code.push(_tab(1) + util.format('get %s(): HasManyRefObject<%s> {', relationName, refClass));
                        code.push(_tab(2) + util.format('return this._children.%s;', relationName));
                        code.push(_tab(1) + '}');
                    }
                    break;
            }
        });
}
function _genSchemaRelations(schema, code, model) {
    if (schema.relations)
        Object.keys(schema.relations).forEach(relationName => {
            const relation = schema.relations[relationName];
            const refClass = relation.model.charAt(0).toUpperCase() + relation.model.substr(1);
            switch (relation.type) {
                case histria_utils_1.RELATION_TYPE.hasOne:
                    code.push(_tab(1) + util.format('public %s(): Promise<%s> {', relationName, refClass));
                    code.push(_tab(2) + util.format('return this._children.%s.getValue();', relationName));
                    code.push(_tab(1) + '}');
                    code.push(_tab(1) + util.format('public set%s(value: %s): Promise<%s> {', _upperFirstLetter(relationName), refClass, refClass));
                    code.push(_tab(2) + util.format('return this._children.%s.setValue(value);', relationName));
                    code.push(_tab(1) + '}');
                    break;
                case histria_utils_1.RELATION_TYPE.belongsTo:
                    code.push(_tab(1) + util.format('public %s(): Promise<%s> {', relationName, refClass));
                    code.push(_tab(2) + util.format('return this._children.%s.getValue();', relationName));
                    code.push(_tab(1) + '}');
                    code.push(_tab(1) + util.format('public set%s(value: %s): Promise<%s> {', _upperFirstLetter(relationName), refClass, refClass));
                    code.push(_tab(2) + util.format('return this._children.%s.setValue(value);', relationName));
                    code.push(_tab(1) + '}');
                    break;
                case histria_utils_1.RELATION_TYPE.hasMany:
                    const cn = (relation.aggregationKind === histria_utils_1.AGGREGATION_KIND.shared) ? 'HasManyAggregation' : 'HasManyComposition';
                    code.push(_tab(1) + util.format('get %s(): %s<%s> {', relationName, cn, refClass));
                    code.push(_tab(2) + util.format('return this._children.%s;', relationName));
                    code.push(_tab(1) + '}');
                    break;
            }
        });
}
function _genSchema(schema, className, code) {
    code.push('/* tslint:disable:object-literal-key-quotes */');
    code.push('/* tslint:disable:quotemark */');
    code.push('export const');
    // const schemaStr = JSON.stringify(schema, null, _tab(1)).replace(/\"([^(\")"]+)\":/g, '$1:').replace(/\"/g, '\'').split('\n');
    const schemaStr = JSON.stringify(schema, null, _tab(1)).split('\n');
    code.push(_tab(1) + util.format('%s_SCHEMA = %s', className.toUpperCase(), schemaStr[0]));
    const len = schemaStr.length - 1;
    for (let i = 1; i <= len; i++) {
        code.push(_tab(1) + schemaStr[i] + (i === len ? ';' : ''));
    }
}
function _genClassErrors(schema, className, baseClass, code) {
    // Generate Class
    code.push('');
    code.push(util.format('export class %sErrors extends %sErrors {', className, baseClass));
    code.push(_tab(1) + util.format('public get %s(): ErrorState {', '$'));
    code.push(_tab(2) + util.format('return this._messages.%s;', '$'));
    code.push(_tab(1) + '}');
    Object.keys(schema.properties || {}).forEach(propName => {
        const propSchema = schema.properties[propName];
        if (histria_utils_1.schemaUtils.isHidden(propSchema) || histria_utils_1.schemaUtils.isComplex(propSchema))
            return;
        code.push(_tab(1) + util.format('public get %s(): ErrorState {', propName));
        code.push(_tab(2) + util.format('return this._messages.%s;', propName));
        code.push(_tab(1) + '}');
    });
    if (schema.relations)
        Object.keys(schema.relations).forEach(relName => {
            const relation = schema.relations[relName];
            let generateError = false;
            switch (relation.type) {
                case histria_utils_1.RELATION_TYPE.hasMany:
                    generateError = (relation.aggregationKind === histria_utils_1.AGGREGATION_KIND.composite);
                    break;
                case histria_utils_1.RELATION_TYPE.hasOne:
                    generateError = (relation.aggregationKind !== histria_utils_1.AGGREGATION_KIND.composite);
                    break;
                case histria_utils_1.RELATION_TYPE.belongsTo:
                    generateError = false;
                    break;
            }
            if (generateError) {
                code.push(_tab(1) + util.format('public get %s(): ErrorState {', relName));
                code.push(_tab(2) + util.format('return this._messages.%s;', relName));
                code.push(_tab(1) + '}');
            }
        });
    code.push('}');
}
function _genClassState(schema, className, baseClass, code) {
    code.push('');
    code.push(util.format('export class %sState extends %sState {', className, baseClass));
    Object.keys(schema.properties || {}).forEach(propName => {
        const propSchema = schema.properties[propName];
        if (histria_utils_1.schemaUtils.isHidden(propSchema) || histria_utils_1.schemaUtils.isComplex(propSchema))
            return;
        const stype = histria_utils_1.schemaUtils.typeOfProperty(propSchema);
        if (propSchema.enum) {
            code.push(_tab(1) + util.format('public get %s(): EnumState {', propName));
            code.push(_tab(2) + util.format('return this._states.%s;', propName));
            code.push(_tab(1) + '}');
        }
        else {
            switch (stype) {
                case histria_utils_1.JSONTYPES.boolean:
                    code.push(_tab(1) + util.format('public get %s(): BooleanState {', propName));
                    code.push(_tab(2) + util.format('return this._states.%s;', propName));
                    code.push(_tab(1) + '}');
                    break;
                case histria_utils_1.JSONTYPES.integer:
                    code.push(_tab(1) + util.format('public get %s(): IntegerState {', propName));
                    code.push(_tab(2) + util.format('return this._states.%s;', propName));
                    code.push(_tab(1) + '}');
                    break;
                case histria_utils_1.JSONTYPES.id:
                    code.push(_tab(1) + util.format('public get %s(): IdState {', propName));
                    code.push(_tab(2) + util.format('return this._states.%s;', propName));
                    code.push(_tab(1) + '}');
                    break;
                case histria_utils_1.JSONTYPES.number:
                    code.push(_tab(1) + util.format('public get %s(): NumberState {', propName));
                    code.push(_tab(2) + util.format('return this._states.%s;', propName));
                    code.push(_tab(1) + '}');
                    break;
                case histria_utils_1.JSONTYPES.date:
                    code.push(_tab(1) + util.format('public get %s(): DateState {', propName));
                    code.push(_tab(2) + util.format('return this._states.%s;', propName));
                    code.push(_tab(1) + '}');
                    break;
                case histria_utils_1.JSONTYPES.datetime:
                    code.push(_tab(1) + util.format('public get %s(): DateTimeState {', propName));
                    code.push(_tab(2) + util.format('return this._states.%s;', propName));
                    code.push(_tab(1) + '}');
                    break;
                case histria_utils_1.JSONTYPES.string:
                    code.push(_tab(1) + util.format('public get %s(): StringState {', propName));
                    code.push(_tab(2) + util.format('return this._states.%s;', propName));
                    code.push(_tab(1) + '}');
                    break;
                default:
                    break;
            }
        }
    });
    code.push('}');
}
async function classGenerator(srcFolder, dstFolder, pathToLib) {
    const model = {};
    await histria_utils_1.schemaUtils.loadModel(srcFolder, model);
    const codeByClass = {};
    const codeByNamespace = {};
    _generate(codeByClass, codeByNamespace, model, pathToLib);
    await saveCode(codeByClass, codeByNamespace, dstFolder);
}
exports.classGenerator = classGenerator;
function _tab(ident) {
    const res = [];
    for (let i = 0; i < ident; i++)
        res.push('    ');
    return res.join('');
}
function _upperFirstLetter(value) {
    return value.substr(0, 1).toUpperCase() + value.substring(1);
}
function _extractFileName(value) {
    const lc = value.toLowerCase();
    const res = [lc.charAt(0)];
    let isUpperCase = true;
    for (let i = 1; i < value.length; i++) {
        if (value.charAt(i) !== lc.charAt(i)) {
            if (!isUpperCase)
                res.push('-');
            isUpperCase = true;
        }
        else {
            isUpperCase = false;
        }
        res.push(lc.charAt(i));
    }
    return res.join('');
}

//# sourceMappingURL=classgen.js.map
