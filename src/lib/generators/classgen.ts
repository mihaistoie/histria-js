import * as util from 'util';
import * as path from 'path';


import { fs as fsPromises } from 'histria-utils';
import { schemaUtils } from 'histria-utils';
import { JSONTYPES, RELATION_TYPE, AGGREGATION_KIND } from 'histria-utils';


async function saveCode(codeByClass: any, codeByNamespace: any, dstFolder: string) {
    let writersClasses = Object.keys(codeByClass).map(name => {
        let item = codeByClass[name];
        return fsPromises.writeFile(path.join(dstFolder, item.fileName + '.ts'), item.code.join('\n'));
    });
    let writersNamespaces = Object.keys(codeByNamespace).map(name => {
        let item = codeByNamespace[name];
        return fsPromises.writeFile(path.join(dstFolder, item.fileName + '.ts'), item.import.concat(item.code).join('\n'));
    });
    await Promise.all(writersClasses.concat(writersNamespaces));
}

function _generate(codeByClass: any, codeByNameSpace: any, model: any, pathToLib?: string) {
    let baseClass = 'Instance';
    let baseViewClass = 'View';
    Object.keys(model).forEach((fullName) => {
        let schema: any = model[fullName];
        let isView: boolean = schema.view ? true : false;
        let className = schema.name.charAt(0).toUpperCase() + schema.name.substr(1);
        schema.nameSpace = schema.nameSpace || className;
        let code: string[] = [];
        let imports: string[] = [];
        let ns = codeByNameSpace[schema.nameSpace];
        if (!ns) {
            ns = { code: [], import: [], fileName: _extractFileName(schema.nameSpace) + '-model' };
            ns.import.push('import { modelManager } from \'' + pathToLib + '\';');
            ns.import.push('');
            codeByNameSpace[schema.nameSpace] = ns;
        }
        let cc: any = {}

        pathToLib = pathToLib || 'histria--utils'
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

        code.push('');
        code.push(util.format('export class %s extends %s {', className, isView ? baseViewClass : baseClass));
        code.push(_tab(1) + util.format('public static isPersistent: boolean = %s;', isView ? 'false' : 'true'));


        // Add public properties
        _genSchemaProperties(schema, code, model);
        if (schema.view)
            _genVewRelations(schema, code, model);
        else
            _genSchemaRelations(schema, code, model);


        code.push(_tab(1) + util.format('public get $states(): %sState {', className));
        code.push(_tab(2) + util.format('return <%sState>this._states;', className));
        code.push(_tab(1) + '}');

        code.push(_tab(1) + util.format('public get $errors(): %sErrors {', className));
        code.push(_tab(2) + util.format('return <%sErrors>this._errors;', className));
        code.push(_tab(1) + '}');

        // Add constructor
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
        code.push('}');



        _genClassErrors(schema, className, baseClass, code);
        _genClassState(schema, className, baseClass, code);



        // Generate

        schema.relations && Object.keys(schema.relations).forEach(relName => {
            let relation = schema.relations[relName];
            if (relation.model !== schema.name) {
                let s = util.format('import { %s } from \'./%s\';', relation.model.charAt(0).toUpperCase() + relation.model.substr(1), _extractFileName(relation.model));
                if (imports.indexOf(s) < 0) {
                    imports.push(s);
                }
            }
        });
        imports.push('');





        _genSchema(schema, className, code)

        ns.code.push(util.format('modelManager().registerClass(%s, %s_SCHEMA);', className, className.toUpperCase()));


        code = imports.concat(code);
        codeByClass[schema.name.toLowerCase()] = {
            fileName: _extractFileName(schema.name),
            code: code,
            depends: []
        }
    });

}

function _genSchemaProperties(schema: any, code: string[], model: any): void {
    Object.keys(schema.properties || {}).forEach(propertyName => {
        let propSchema = schema.properties[propertyName];
        if (schemaUtils.isHidden(propSchema) || schemaUtils.isComplex(propSchema)) return;
        let stype = schemaUtils.typeOfProperty(propSchema);
        let isReadOnly = schemaUtils.isReadOnly(propSchema);
        switch (stype) {
            case JSONTYPES.string:
                code.push(_tab(1) + util.format('public get %s(): string {', propertyName));
                code.push(_tab(2) + util.format('return this.getPropertyByName(\'%s\');', propertyName));
                code.push(_tab(1) + '}');
                if (!isReadOnly) {
                    code.push(_tab(1) + util.format('public set%s(value: string): Promise<string> {', _upperFirstLetter(propertyName)));
                    code.push(_tab(2) + util.format('return this.setPropertyByName(\'%s\', value);', propertyName));
                    code.push(_tab(1) + '}');
                }
                break;
            case JSONTYPES.boolean:
                code.push(_tab(1) + util.format('public get %s(): boolean {', propertyName));
                code.push(_tab(2) + util.format('return this.getPropertyByName(\'%s\');', propertyName));
                code.push(_tab(1) + '}');
                if (!isReadOnly) {
                    code.push(_tab(1) + util.format('public set%s(value: boolean): Promise<boolean> {', _upperFirstLetter(propertyName)));
                    code.push(_tab(2) + util.format('return this.setPropertyByName(\'%s\', value);', propertyName));
                    code.push(_tab(1) + '}');
                }
                break;
            case JSONTYPES.id:
                code.push(_tab(1) + util.format('public get %s(): any {', propertyName));
                code.push(_tab(2) + util.format('return this._children.%s.value;', propertyName));
                code.push(_tab(1) + '}');
                break;
            case JSONTYPES.integer:
                code.push(_tab(1) + util.format('public get %s(): number {', propertyName));
                code.push(_tab(2) + util.format('return this._children.%s.value;', propertyName));
                code.push(_tab(1) + '}');
                if (!isReadOnly) {
                    code.push(_tab(1) + util.format('public set%s(value: number): Promise<number> {', _upperFirstLetter(propertyName)));
                    code.push(_tab(2) + util.format('return this._children.%s.setValue(value);', propertyName));
                    code.push(_tab(1) + '}');
                }
                break;
            case JSONTYPES.number:
                code.push(_tab(1) + util.format('public get %s(): NumberValue {', propertyName));
                code.push(_tab(2) + util.format('return this._children.%s;', propertyName));
                code.push(_tab(1) + '}');
                break;
        }
    });
}

function _genVewRelations(schema: any, code: string[], model: any): void {
    schema.relations && Object.keys(schema.relations).forEach(relationName => {
        const relation = schema.relations[relationName];
        const refClass = relation.model.charAt(0).toUpperCase() + relation.model.substr(1)
        switch (relation.type) {
            case RELATION_TYPE.hasOne:
                code.push(_tab(1) + util.format('public %s(): Promise<%s> {', relationName, refClass));
                code.push(_tab(2) + util.format('return this._children.%s.getValue();', relationName));
                code.push(_tab(1) + '}');
                code.push(_tab(1) + util.format('public set%s(value: %s): Promise<%s> {', _upperFirstLetter(relationName), refClass, refClass));
                code.push(_tab(2) + util.format('return this._children.%s.setValue(value);', relationName));
                code.push(_tab(1) + '}');
                break;
            case RELATION_TYPE.belongsTo:
                break;
            case RELATION_TYPE.hasMany:
                code.push(_tab(1) + util.format('get %s(): HasManyRefObject<%s> {', relationName, refClass));
                code.push(_tab(2) + util.format('return this._children.%s;', relationName));
                code.push(_tab(1) + '}');
                break;
        }
    });
}

function _genSchemaRelations(schema: any, code: string[], model: any): void {
    schema.relations && Object.keys(schema.relations).forEach(relationName => {
        const relation = schema.relations[relationName];
        const refClass = relation.model.charAt(0).toUpperCase() + relation.model.substr(1)
        switch (relation.type) {
            case RELATION_TYPE.hasOne:
                code.push(_tab(1) + util.format('public %s(): Promise<%s> {', relationName, refClass));
                code.push(_tab(2) + util.format('return this._children.%s.getValue();', relationName));
                code.push(_tab(1) + '}');
                code.push(_tab(1) + util.format('public set%s(value: %s): Promise<%s> {', _upperFirstLetter(relationName), refClass, refClass));
                code.push(_tab(2) + util.format('return this._children.%s.setValue(value);', relationName));
                code.push(_tab(1) + '}');
                break;
            case RELATION_TYPE.belongsTo:
                code.push(_tab(1) + util.format('public %s(): Promise<%s> {', relationName, refClass));
                code.push(_tab(2) + util.format('return this._children.%s.getValue();', relationName));
                code.push(_tab(1) + '}');
                code.push(_tab(1) + util.format('public set%s(value: %s): Promise<%s> {', _upperFirstLetter(relationName), refClass, refClass));
                code.push(_tab(2) + util.format('return this._children.%s.setValue(value);', relationName));
                code.push(_tab(1) + '}');
                break;
            case RELATION_TYPE.hasMany:
                const cn = (relation.aggregationKind === AGGREGATION_KIND.shared) ? 'HasManyAggregation' : 'HasManyComposition';
                code.push(_tab(1) + util.format('get %s(): %s<%s> {', relationName, cn, refClass));
                code.push(_tab(2) + util.format('return this._children.%s;', relationName));
                code.push(_tab(1) + '}');
                break;

        }
    });

}

function _genSchema(schema: any, className: string, code: string[]): void {
    code.push('export const');
    const schemaStr = JSON.stringify(schema, null, _tab(1)).replace(/\"([^(\")"]+)\":/g, '$1:').replace(/\"/g, '\'').split('\n');

    code.push(_tab(1) + util.format('%s_SCHEMA = %s', className.toUpperCase(), schemaStr[0]));
    const len = schemaStr.length - 1;
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
        const propSchema = schema.properties[propName];
        if (schemaUtils.isHidden(propSchema) || schemaUtils.isComplex(propSchema)) return;
        code.push(_tab(1) + util.format('public get %s(): ErrorState {', propName));
        code.push(_tab(2) + util.format('return this._messages.%s;', propName));
        code.push(_tab(1) + '}');
    });
    schema.relations && Object.keys(schema.relations).forEach(relName => {
        const relation = schema.relations[relName];
        let generateError = false;
        switch (relation.type) {
            case RELATION_TYPE.hasMany:
                generateError = (relation.aggregationKind === AGGREGATION_KIND.composite);
                break;
            case RELATION_TYPE.hasOne:
                generateError = (relation.aggregationKind !== AGGREGATION_KIND.composite);
                break;
            case RELATION_TYPE.belongsTo:
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
                case JSONTYPES.boolean:
                    code.push(_tab(1) + util.format('public get %s(): BooleanState {', propName));
                    code.push(_tab(2) + util.format('return this._states.%s;', propName));
                    code.push(_tab(1) + '}');
                    break;
                case JSONTYPES.integer:
                    code.push(_tab(1) + util.format('public get %s(): IntegerState {', propName));
                    code.push(_tab(2) + util.format('return this._states.%s;', propName));
                    code.push(_tab(1) + '}');
                    break;
                case JSONTYPES.id:
                    code.push(_tab(1) + util.format('public get %s(): IdState {', propName));
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
    let codeByNamespace = {};
    _generate(codeByClass, codeByNamespace, model, pathToLib);
    await saveCode(codeByClass, codeByNamespace, dstFolder);
}


function _tab(ident: number) {
    let res = [];
    for (let i = 0; i < ident; i++)
        res.push('    ');
    return res.join('');
}
function _upperFirstLetter(value: string): string {
    return value.substr(0, 1).toUpperCase() + value.substring(1);
}

function _extractFileName(value: string): string {
    let lc = value.toLowerCase();
    let res = [lc.charAt(0)];
    for (let i = 1; i < value.length; i++) {
        if (value.charAt(i) !== lc.charAt(i))
            res.push('-');
        res.push(lc.charAt(i));

    }
    return res.join('');
}