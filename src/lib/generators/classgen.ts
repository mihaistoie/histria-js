import * as util from 'util';
import * as schemaUtils from '../schema/schema-utils';
import { JSONTYPES } from '../schema/schema-consts';

function _tab(ident: number) {
    let res = [];
    for (var i = 0; i < ident; i++)
        res.push('\t');
    return res.join('');
}

export function generate(code: string[], schema: any, className: string, baseClass: string) {
    schema.nameSpace = schema.nameSpace || className;
    code.push('const');
    code.push(_tab(1) + util.format('%s_SCHEMA = %s;', className.toUpperCase(), JSON.stringify(schema, null, _tab(2))));
    code.push('');
    code.push(util.format('export class %sState extends %sState {', className, baseClass));
    Object.keys(schema.properties || {}).forEach(propName => {
        let propSchema = schema.properties[propName];
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
                default:
                    code.push(_tab(1) + util.format('public get %s(): StringState {', propName));
                    code.push(_tab(2) + util.format('return this._states.%s;', propName));
                    code.push(_tab(1) + '}');
                    break;

            }
        }

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
    code.push(_tab(2) + util.format('that._states = new %sState(that, that._schema);', className, ));
    code.push(_tab(1) + '}');

    Object.keys(schema.properties || {}).forEach(propName => {
        let propSchema = schema.properties[propName];
        let stype = schemaUtils.typeOfProperty(propSchema);
        switch (stype) {
            case JSONTYPES.string:
                code.push(_tab(1) + util.format('%s(value?: string): Promise<string> {', propName));
                code.push(_tab(2) + util.format('return this.getOrSetProperty(\'%s\', value);', propName));
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
    code.push(_tab(1) + util.format('public get states(): %sState {', className));
    code.push(_tab(2) + util.format('return <%sState>this._states;', className));
    code.push(_tab(1) + '}');

    code.push('}');

    code.push(util.format('new ModelManager().registerClass(%s, %s_SCHEMA.nameSpace);', className, className.toUpperCase()));


}

