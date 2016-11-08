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

    code.push(util.format('export class %s extends %s {', className, baseClass));
    //add private 

    //add constructor
    code.push(_tab(1) + 'protected init() {');
    code.push(_tab(2) + 'super.init();');
    code.push(_tab(2) + 'let that = this;');
    code.push(_tab(2) + util.format('that._schema = %s_SCHEMA;', className.toUpperCase()));
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
            case JSONTYPES.number:
                break;
        }

    });
    code.push('}');

    code.push(util.format('new ModelManager().registerClass(%s, \'%s\', %s_SCHEMA.nameSpace);', className, className, className.toUpperCase()));


}

