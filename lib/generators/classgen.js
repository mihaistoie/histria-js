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
const histria_utils_1 = require("histria-utils");
const histria_utils_2 = require("histria-utils");
const histria_utils_3 = require("histria-utils");
function saveCode(codeByClass, dstFolder) {
    return __awaiter(this, void 0, void 0, function* () {
        let writers = Object.keys(codeByClass).map(name => {
            let item = codeByClass[name];
            return histria_utils_1.fs.writeFile(path.join(dstFolder, item.fileName + '.ts'), item.code.join('\n'));
        });
        yield Promise.all(writers);
    });
}
function _generate(codeByClass, model, pathToLib) {
    let baseClass = 'Instance';
    Object.keys(model).forEach((name) => {
        let schema = model[name];
        let className = schema.name.charAt(0).toUpperCase() + schema.name.substr(1);
        schema.nameSpace = schema.nameSpace || className;
        let code = [];
        let imports = [];
        let cc = {};
        pathToLib = pathToLib || 'histria--utils';
        imports.push('import {');
        imports.push(_tab(1) + 'Instance, InstanceState, InstanceErrors, ModelManager,');
        imports.push(_tab(1) + 'HasManyComposition, HasManyAggregation,');
        imports.push(_tab(1) + 'ErrorState, State, StringState, IdState, BooleanState, IntegerState, EnumState, NumberState, DateState, DateTimeState, RefArrayState, RefObjectState,');
        imports.push(_tab(1) + 'IntegerValue, NumberValue');
        imports.push('} from \'' + pathToLib + '\';');
        // Generate Class
        code.push('');
        code.push(util.format('export class %s extends %s {', className, baseClass));
        //add private 
        //add constructor
        code.push(_tab(1) + 'protected init() {');
        code.push(_tab(2) + 'super.init();');
        code.push(_tab(2) + 'let that = this;');
        code.push(_tab(2) + util.format('that._schema = %s_SCHEMA;', className.toUpperCase()));
        code.push(_tab(1) + '}');
        code.push(_tab(1) + 'protected createStates() {');
        code.push(_tab(2) + 'let that = this;');
        code.push(_tab(2) + util.format('that._states = new %sState(that, that._schema);', className));
        code.push(_tab(1) + '}');
        code.push(_tab(1) + 'protected createErrors() {');
        code.push(_tab(2) + 'let that = this;');
        code.push(_tab(2) + util.format('that._errors = new %sErrors(that, that._schema);', className));
        code.push(_tab(1) + '}');
        Object.keys(schema.properties || {}).forEach(propName => {
            let propSchema = schema.properties[propName];
            if (histria_utils_2.schemaUtils.isHidden(propSchema) || histria_utils_2.schemaUtils.isComplex(propSchema))
                return;
            let stype = histria_utils_2.schemaUtils.typeOfProperty(propSchema);
            let isReadOnly = histria_utils_2.schemaUtils.isReadOnly(propSchema);
            switch (stype) {
                case histria_utils_3.JSONTYPES.string:
                    code.push(_tab(1) + util.format('public get %s(): string {', propName));
                    code.push(_tab(2) + util.format('return this.getPropertyByName(\'%s\');', propName));
                    code.push(_tab(1) + '}');
                    if (!isReadOnly) {
                        code.push(_tab(1) + util.format('public set%s(value: string): Promise<string> {', _upperFirstLetter(propName)));
                        code.push(_tab(2) + util.format('return this.setPropertyByName(\'%s\', value);', propName));
                        code.push(_tab(1) + '}');
                    }
                    break;
                case histria_utils_3.JSONTYPES.boolean:
                    code.push(_tab(1) + util.format('public get %s(): boolean {', propName));
                    code.push(_tab(2) + util.format('return this.getPropertyByName(\'%s\');', propName));
                    code.push(_tab(1) + '}');
                    if (!isReadOnly) {
                        code.push(_tab(1) + util.format('public set%s(value: boolean): Promise<boolean> {', _upperFirstLetter(propName)));
                        code.push(_tab(2) + util.format('return this.setPropertyByName(\'%s\', value);', propName));
                        code.push(_tab(1) + '}');
                    }
                    break;
                case histria_utils_3.JSONTYPES.id:
                    code.push(_tab(1) + util.format('public get %s(): any {', propName));
                    code.push(_tab(2) + util.format('return this._children.%s.value;', propName));
                    code.push(_tab(1) + '}');
                    break;
                case histria_utils_3.JSONTYPES.integer:
                    code.push(_tab(1) + util.format('public get %s(): IntegerValue {', propName));
                    code.push(_tab(2) + util.format('return this._children.%s;', propName));
                    code.push(_tab(1) + '}');
                    break;
                case histria_utils_3.JSONTYPES.number:
                    code.push(_tab(1) + util.format('public get %s(): NumberValue {', propName));
                    code.push(_tab(2) + util.format('return this._children.%s;', propName));
                    code.push(_tab(1) + '}');
                    break;
            }
        });
        schema.relations && Object.keys(schema.relations).forEach(relName => {
            let relation = schema.relations[relName];
            let refClass = relation.model.charAt(0).toUpperCase() + relation.model.substr(1);
            switch (relation.type) {
                case histria_utils_3.RELATION_TYPE.hasOne:
                    code.push(_tab(1) + util.format('public %s(): Promise<%s> {', relName, refClass));
                    code.push(_tab(2) + util.format('return this._children.%s.getValue();', relName));
                    code.push(_tab(1) + '}');
                    code.push(_tab(1) + util.format('public set%s(value: %s): Promise<%s> {', _upperFirstLetter(relName), refClass, refClass));
                    code.push(_tab(2) + util.format('return this._children.%s.setValue(value);', relName));
                    code.push(_tab(1) + '}');
                    break;
                case histria_utils_3.RELATION_TYPE.belongsTo:
                    code.push(_tab(1) + util.format('public %s(): Promise<%s> {', relName, refClass));
                    code.push(_tab(2) + util.format('return this._children.%s.getValue();', relName));
                    code.push(_tab(1) + '}');
                    code.push(_tab(1) + util.format('public set%s(value: %s): Promise<%s> {', _upperFirstLetter(relName), refClass, refClass));
                    code.push(_tab(2) + util.format('return this._children.%s.setValue(value);', relName));
                    code.push(_tab(1) + '}');
                    break;
                case histria_utils_3.RELATION_TYPE.hasMany:
                    let cn = (relation.aggregationKind === histria_utils_3.AGGREGATION_KIND.shared) ? 'HasManyAggregation' : 'HasManyComposition';
                    code.push(_tab(1) + util.format('get %s(): %s<%s> {', relName, cn, refClass));
                    code.push(_tab(2) + util.format('return this._children.%s;', relName));
                    code.push(_tab(1) + '}');
                    break;
            }
        });
        code.push(_tab(1) + util.format('public get $states(): %sState {', className));
        code.push(_tab(2) + util.format('return <%sState>this._states;', className));
        code.push(_tab(1) + '}');
        code.push(_tab(1) + util.format('public get $errors(): %sErrors {', className));
        code.push(_tab(2) + util.format('return <%sErrors>this._errors;', className));
        code.push(_tab(1) + '}');
        code.push('}');
        _genClassErrors(schema, className, baseClass, code);
        _genClassState(schema, className, baseClass, code);
        //Generate 
        schema.relations && Object.keys(schema.relations).forEach(relName => {
            let relation = schema.relations[relName];
            imports.push(util.format('import { %s } from \'./%s\';', relation.model.charAt(0).toUpperCase() + relation.model.substr(1), _extractFileName(relation.model)));
        });
        imports.push('');
        _genSchema(schema, className, code);
        code.push(util.format('new ModelManager().registerClass(%s, %s_SCHEMA);', className, className.toUpperCase()));
        code = imports.concat(code);
        codeByClass[schema.name.toLowerCase()] = {
            fileName: _extractFileName(schema.name),
            code: code,
            depends: []
        };
    });
}
function _genSchema(schema, className, code) {
    code.push('const');
    let schemaStr = JSON.stringify(schema, null, _tab(1)).split('\n');
    code.push(_tab(1) + util.format('%s_SCHEMA = %s', className.toUpperCase(), schemaStr[0]));
    let len = schemaStr.length - 1;
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
        let propSchema = schema.properties[propName];
        if (histria_utils_2.schemaUtils.isHidden(propSchema) || histria_utils_2.schemaUtils.isComplex(propSchema))
            return;
        code.push(_tab(1) + util.format('public get %s(): ErrorState {', propName));
        code.push(_tab(2) + util.format('return this._messages.%s;', propName));
        code.push(_tab(1) + '}');
    });
    schema.relations && Object.keys(schema.relations).forEach(relName => {
        let relation = schema.relations[relName];
        code.push(_tab(1) + util.format('public get %s(): ErrorState {', relName));
        code.push(_tab(2) + util.format('return this._messages.%s;', relName));
        code.push(_tab(1) + '}');
    });
    code.push('}');
}
function _genClassState(schema, className, baseClass, code) {
    code.push('');
    code.push(util.format('export class %sState extends %sState {', className, baseClass));
    Object.keys(schema.properties || {}).forEach(propName => {
        let propSchema = schema.properties[propName];
        if (histria_utils_2.schemaUtils.isHidden(propSchema) || histria_utils_2.schemaUtils.isComplex(propSchema))
            return;
        let stype = histria_utils_2.schemaUtils.typeOfProperty(propSchema);
        if (propSchema.enum) {
            code.push(_tab(1) + util.format('public get %s(): EnumState {', propName));
            code.push(_tab(2) + util.format('return this._states.%s;', propName));
            code.push(_tab(1) + '}');
        }
        else {
            switch (stype) {
                case histria_utils_3.JSONTYPES.boolean:
                    code.push(_tab(1) + util.format('public get %s(): BooleanState {', propName));
                    code.push(_tab(2) + util.format('return this._states.%s;', propName));
                    code.push(_tab(1) + '}');
                    break;
                case histria_utils_3.JSONTYPES.integer:
                    code.push(_tab(1) + util.format('public get %s(): IntegerState {', propName));
                    code.push(_tab(2) + util.format('return this._states.%s;', propName));
                    code.push(_tab(1) + '}');
                    break;
                case histria_utils_3.JSONTYPES.id:
                    code.push(_tab(1) + util.format('public get %s(): IdState {', propName));
                    code.push(_tab(2) + util.format('return this._states.%s;', propName));
                    code.push(_tab(1) + '}');
                    break;
                case histria_utils_3.JSONTYPES.number:
                    code.push(_tab(1) + util.format('public get %s(): NumberState {', propName));
                    code.push(_tab(2) + util.format('return this._states.%s;', propName));
                    code.push(_tab(1) + '}');
                    break;
                case histria_utils_3.JSONTYPES.date:
                    code.push(_tab(1) + util.format('public get %s(): DateState {', propName));
                    code.push(_tab(2) + util.format('return this._states.%s;', propName));
                    code.push(_tab(1) + '}');
                    break;
                case histria_utils_3.JSONTYPES.datetime:
                    code.push(_tab(1) + util.format('public get %s(): DateTimeState {', propName));
                    code.push(_tab(2) + util.format('return this._states.%s;', propName));
                    code.push(_tab(1) + '}');
                    break;
                case histria_utils_3.JSONTYPES.string:
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
function classGenerator(srcFolder, dstFolder, pathToLib) {
    return __awaiter(this, void 0, void 0, function* () {
        let model = {};
        yield histria_utils_2.schemaUtils.loadModel(srcFolder, model);
        let codeByClass = {};
        _generate(codeByClass, model, pathToLib);
        yield saveCode(codeByClass, dstFolder);
    });
}
exports.classGenerator = classGenerator;
function _tab(ident) {
    let res = [];
    for (var i = 0; i < ident; i++)
        res.push('\t');
    return res.join('');
}
function _upperFirstLetter(value) {
    return value.substr(0, 1).toUpperCase() + value.substring(1);
}
function _extractFileName(value) {
    let lc = value.toLowerCase();
    let res = [lc.charAt(0)];
    for (let i = 1; i < value.length; i++) {
        if (value.charAt(i) !== lc.charAt(i))
            res.push('-');
        res.push(lc.charAt(i));
    }
    return res.join('');
}
