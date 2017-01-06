import * as util from 'util';
import * as path from 'path';


import * as promises from '../utils/promises';
import * as schemaUtils from '../schema/schema-utils';
import { JSONTYPES, RELATION_TYPE, AGGREGATION_KIND } from '../schema/schema-consts';

function _tab(ident: number) {
    let res = [];
    for (var i = 0; i < ident; i++)
        res.push('\t');
    return res.join('');
}
async function saveCode(codeByClass: any, dstFolder: string) {
    let writers = Object.keys(codeByClass).map(name => {
        return promises.fs.writeFile(path.join(dstFolder, name + '.ts'), codeByClass[name].code.join('\n'));
    });
    await Promise.all(writers);
}

function _generate(codeByClass: any, model: any, pathToLib?: string) {
    let baseClass = 'Instance'
    Object.keys(model).forEach((name) => {
        let schema = model[name];
        let className = schema.name.charAt(0).toUpperCase() + schema.name.substr(1);
        schema.nameSpace = schema.nameSpace || className;
        let code = [];
        let imports = [];
        let cc = {}

        pathToLib = pathToLib || 'histria--utils'
        imports.push('import {');
        imports.push(_tab(1) + 'Instance, InstanceState, InstanceErrors, ModelManager,');
        imports.push(_tab(1) + 'ErrorState, State, StringState, IntegerState, EnumState, NumberState, DateState, DateTimeState, RefArrayState, RefObjectState,');
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
        code.push(_tab(2) + util.format('that._states = new %sState(that, that._schema);', className, ));
        code.push(_tab(1) + '}');

        code.push(_tab(1) + 'protected createErrors() {');
        code.push(_tab(2) + 'let that = this;');
        code.push(_tab(2) + util.format('that._errors = new %sErrors(that, that._schema);', className, ));
        code.push(_tab(1) + '}');


        Object.keys(schema.properties || {}).forEach(propName => {
            let propSchema = schema.properties[propName];
            if (schemaUtils.isHidden(propSchema) || schemaUtils.isComplex(propSchema)) return;
            let stype = schemaUtils.typeOfProperty(propSchema);
            switch (stype) {
                case JSONTYPES.string:
                    let value1 = schemaUtils.isReadOnly(propSchema) ? '' : 'value?: string'
                    let value2 = schemaUtils.isReadOnly(propSchema) ? '' : ', value';
                    code.push(_tab(1) + util.format('public %s(%s): Promise<string> {', propName, value1));
                    code.push(_tab(2) + util.format('return this.getOrSetProperty(\'%s\'%s);', propName, value2));
                    code.push(_tab(1) + '}');
                    break;
                case JSONTYPES.integer:
                    code.push(_tab(1) + util.format('public get %s(): IntegerValue {', propName));
                    code.push(_tab(2) + util.format('return this._children.%s;', propName));
                    code.push(_tab(1) + '}');
                    break;
                case JSONTYPES.number:
                    code.push(_tab(1) + util.format('public get %s(): NumberValue {', propName));
                    code.push(_tab(2) + util.format('return this._children.%s;', propName));
                    code.push(_tab(1) + '}');
                    break;
            }
        });
        schema.relations && Object.keys(schema.relations).forEach(relName => {
            let relation = schema.relations[relName];
            let refClass = relation.model.charAt(0).toUpperCase() + relation.model.substr(1)
            switch (relation.type) {
                case RELATION_TYPE.hasOne:
                    code.push(_tab(1) + util.format('public %s(value?: %s): Promise<%s> {', relName, refClass, refClass));
                    code.push(_tab(2) + util.format('return this._children.%s.value(value);', relName));
                    code.push(_tab(1) + '}');
                    break;
                case RELATION_TYPE.belongsTo:
                    code.push(_tab(1) + util.format('public %s(): Promise<%s> {', relName, refClass));
                    code.push(_tab(2) + util.format('return this._children.%s.value();', relName));
                    code.push(_tab(1) + '}');
                    break;
                case RELATION_TYPE.hasMany:
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
            imports.push(util.format('import { %s } from \'./%s\';', relation.model.charAt(0).toUpperCase() + relation.model.substr(1), relation.model.toLowerCase()));
        });
        imports.push('');





        _genSchema(schema, className, code)

        code.push(util.format('new ModelManager().registerClass(%s, %s_SCHEMA.name, %s_SCHEMA.nameSpace);', className, className.toUpperCase(), className.toUpperCase()));




        code = imports.concat(code);
        codeByClass[schema.name.toLowerCase()] = {
            code: code,
            depends: []
        }
    });

}

function _genSchema(schema: any, className: string, code: string[]) {
    code.push('const');
    let schemaStr = JSON.stringify(schema, null, _tab(1)).split('\n');
    code.push(_tab(1) + util.format('%s_SCHEMA = %s', className.toUpperCase(), schemaStr[0]));
    let len = schemaStr.length - 1;
    for (let i = 1; i <= len; i++) {
        code.push(_tab(1) + schemaStr[i] + (i === len ? ';' : ''));
    }
}

function _genClassErrors(schema: any, className: string, baseClass: string, code: string[]) {
    // Generate Class
    code.push('');
    code.push(util.format('export class %sErrors extends %sErrors {', className, baseClass));
    code.push(_tab(1) + util.format('public get %s(): ErrorState {', '$'));
    code.push(_tab(2) + util.format('return this._messages.%s;', '$'));
    code.push(_tab(1) + '}');

    Object.keys(schema.properties || {}).forEach(propName => {
        let propSchema = schema.properties[propName];
        if (schemaUtils.isHidden(propSchema) || schemaUtils.isComplex(propSchema)) return;
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

function _genClassState(schema: any, className: string, baseClass: string, code: string[]) {
    code.push('');
    code.push(util.format('export class %sState extends %sState {', className, baseClass));
    Object.keys(schema.properties || {}).forEach(propName => {
        let propSchema = schema.properties[propName];
        if (schemaUtils.isHidden(propSchema) || schemaUtils.isComplex(propSchema)) return;
        let stype = schemaUtils.typeOfProperty(propSchema);
        if (propSchema.enum) {
            code.push(_tab(1) + util.format('public get %s(): EnumState {', propName));
            code.push(_tab(2) + util.format('return this._states.%s;', propName));
            code.push(_tab(1) + '}');
        } else {
            switch (stype) {
                case JSONTYPES.integer:
                    code.push(_tab(1) + util.format('public get %s(): IntegerState {', propName));
                    code.push(_tab(2) + util.format('return this._states.%s;', propName));
                    code.push(_tab(1) + '}');
                    break;
                case JSONTYPES.number:
                    code.push(_tab(1) + util.format('public get %s(): NumberState {', propName));
                    code.push(_tab(2) + util.format('return this._states.%s;', propName));
                    code.push(_tab(1) + '}');
                    break;
                case JSONTYPES.date:
                    code.push(_tab(1) + util.format('public get %s(): DateState {', propName));
                    code.push(_tab(2) + util.format('return this._states.%s;', propName));
                    code.push(_tab(1) + '}');
                    break;
                case JSONTYPES.datetime:
                    code.push(_tab(1) + util.format('public get %s(): DateTimeState {', propName));
                    code.push(_tab(2) + util.format('return this._states.%s;', propName));
                    code.push(_tab(1) + '}');
                    break;
                case JSONTYPES.string:
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

export async function classGenerator(srcFolder: string, dstFolder: string, pathToLib?: string) {
    let model = {};
    await schemaUtils.loadModel(srcFolder, model);
    let codeByClass = {};
    _generate(codeByClass, model, pathToLib);
    await saveCode(codeByClass, dstFolder);
}
