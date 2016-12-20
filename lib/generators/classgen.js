"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const util = require('util');
const path = require('path');
const promises = require('../utils/promises');
const schemaUtils = require('../schema/schema-utils');
const schema_consts_1 = require('../schema/schema-consts');
function _tab(ident) {
    let res = [];
    for (var i = 0; i < ident; i++)
        res.push('\t');
    return res.join('');
}
function saveCode(codeByClass, dstFolder) {
    return __awaiter(this, void 0, void 0, function* () {
        let writers = Object.keys(codeByClass).map(name => {
            return promises.fs.writeFile(path.join(dstFolder, name + '.ts'), codeByClass[name].code.join('\n'));
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
        let cc = {};
        codeByClass[schema.name.toLowerCase()] = {
            code: code,
            depends: []
        };
        pathToLib = pathToLib || 'histria--utils';
        code.push('import {');
        code.push(_tab(1) + 'Instance, InstanceState, InstanceErrors, ModelManager,');
        code.push(_tab(1) + 'ErrorState, State, StringState, IntegerState, EnumState, NumberState, DateState, DateTimeState, RefArrayState, RefObjectState,');
        code.push(_tab(1) + 'IntegerValue, NumberValue');
        code.push('} from \'' + pathToLib + '\';');
        code.push('');
        code.push('const');
        code.push(_tab(1) + util.format('%s_SCHEMA = %s;', className.toUpperCase(), JSON.stringify(schema, null, _tab(2))));
        code.push('');
        code.push(util.format('export class %sState extends %sState {', className, baseClass));
        Object.keys(schema.properties || {}).forEach(propName => {
            let propSchema = schema.properties[propName];
            if (schemaUtils.isHidden(propSchema) || schemaUtils.isComplex(propSchema))
                return;
            let stype = schemaUtils.typeOfProperty(propSchema);
            if (propSchema.enum) {
                code.push(_tab(1) + util.format('public get %s(): EnumState {', propName));
                code.push(_tab(2) + util.format('return this._states.%s;', propName));
                code.push(_tab(1) + '}');
            }
            else {
                switch (stype) {
                    case schema_consts_1.JSONTYPES.integer:
                        code.push(_tab(1) + util.format('public get %s(): IntegerState {', propName));
                        code.push(_tab(2) + util.format('return this._states.%s;', propName));
                        code.push(_tab(1) + '}');
                        break;
                    case schema_consts_1.JSONTYPES.number:
                        code.push(_tab(1) + util.format('public get %s(): NumberState {', propName));
                        code.push(_tab(2) + util.format('return this._states.%s;', propName));
                        code.push(_tab(1) + '}');
                        break;
                    case schema_consts_1.JSONTYPES.date:
                        code.push(_tab(1) + util.format('public get %s(): DateState {', propName));
                        code.push(_tab(2) + util.format('return this._states.%s;', propName));
                        code.push(_tab(1) + '}');
                        break;
                    case schema_consts_1.JSONTYPES.datetime:
                        code.push(_tab(1) + util.format('public get %s(): DateTimeState {', propName));
                        code.push(_tab(2) + util.format('return this._states.%s;', propName));
                        code.push(_tab(1) + '}');
                        break;
                    case schema_consts_1.JSONTYPES.string:
                        code.push(_tab(1) + util.format('public get %s(): StringState {', propName));
                        code.push(_tab(2) + util.format('return this._states.%s;', propName));
                        code.push(_tab(1) + '}');
                        break;
                    default:
                        break;
                }
            }
        });
        Object.keys(schema.relations || {}).forEach(propName => {
            /*
                     case JSONTYPES.array:
                                break;
                            case JSONTYPES.object:
                                break;
                            case JSONTYPES.refobject:
                                code.push(_tab(1) + util.format('public get %s(): RefObjectState {', propName));
                                code.push(_tab(2) + util.format('return this._states.%s;', propName));
                                code.push(_tab(1) + '}');
                                break;
                            case JSONTYPES.refarray:
                                code.push(_tab(1) + util.format('public get %s(): RefArrayState {', propName));
                                code.push(_tab(2) + util.format('return this._states.%s;', propName));
                                code.push(_tab(1) + '}');
                                break;
    */
        });
        code.push('}');
        code.push('');
        code.push(util.format('export class %sErrors extends %sErrors {', className, baseClass));
        code.push(_tab(1) + util.format('public get %s(): ErrorState {', '$'));
        code.push(_tab(2) + util.format('return this._messages.%s;', '$'));
        code.push(_tab(1) + '}');
        Object.keys(schema.properties || {}).forEach(propName => {
            let propSchema = schema.properties[propName];
            if (schemaUtils.isHidden(propSchema) || schemaUtils.isComplex(propSchema))
                return;
            code.push(_tab(1) + util.format('public get %s(): ErrorState {', propName));
            code.push(_tab(2) + util.format('return this._messages.%s;', propName));
            code.push(_tab(1) + '}');
        });
        code.push('}');
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
            if (schemaUtils.isHidden(propSchema) || schemaUtils.isComplex(propSchema))
                return;
            let stype = schemaUtils.typeOfProperty(propSchema);
            switch (stype) {
                case schema_consts_1.JSONTYPES.string:
                    let value1 = schemaUtils.isReadOnly(propSchema) ? '' : 'value?: string';
                    let value2 = schemaUtils.isReadOnly(propSchema) ? '' : ', value';
                    code.push(_tab(1) + util.format('public %s(%s): Promise<string> {', propName, value1));
                    code.push(_tab(2) + util.format('return this.getOrSetProperty(\'%s\'%s);', propName, value2));
                    code.push(_tab(1) + '}');
                    break;
                case schema_consts_1.JSONTYPES.integer:
                    code.push(_tab(1) + util.format('public get %s(): IntegerValue {', propName));
                    code.push(_tab(2) + util.format('return this._children.%s;', propName));
                    code.push(_tab(1) + '}');
                    break;
                case schema_consts_1.JSONTYPES.number:
                    code.push(_tab(1) + util.format('public get %s(): NumberValue {', propName));
                    code.push(_tab(2) + util.format('return this._children.%s;', propName));
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
        code.push(util.format('new ModelManager().registerClass(%s, %s_SCHEMA.nameSpace);', className, className.toUpperCase()));
    });
}
function classGenerator(srcFolder, dstFolder, pathToLib) {
    return __awaiter(this, void 0, void 0, function* () {
        let model = {};
        yield schemaUtils.loadModel(srcFolder, model);
        let codeByClass = {};
        _generate(codeByClass, model, pathToLib);
        yield saveCode(codeByClass, dstFolder);
    });
}
exports.classGenerator = classGenerator;
