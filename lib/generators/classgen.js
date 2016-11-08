"use strict";
const util = require('util');
const schemaUtils = require('../schema/schema-utils');
const schema_consts_1 = require('../schema/schema-consts');
function generate(code, schema, className, baseClass) {
    code.push('const');
    code.push(util.format('\t%s_SCHEMA = %s;', className.toUpperCase(), JSON.stringify(schema, null, '\t\t')));
    code.push(util.format('export class %s extends %s {', className, baseClass));
    //add private 
    //add constructor
    code.push('\tprotected init() {');
    code.push('\t\tsuper.init();');
    code.push('\t\tlet that = this;');
    code.push(util.format('\t\tthat._schema = %s_SCHEMA;', className.toUpperCase()));
    code.push('\t}');
    Object.keys(schema.properties || {}).forEach(propName => {
        let propSchema = schema.properties[propName];
        let stype = schemaUtils.typeOfProperty(propSchema);
        switch (stype) {
            case schema_consts_1.JSONTYPES.string:
                code.push(util.format('\t%s(value?: string): Promise<string> {', propName));
                code.push(util.format('\t\treturn this.getOrSetProperty(\'%s\', value);', propName));
                code.push('\t}');
                break;
            case schema_consts_1.JSONTYPES.integer:
            case schema_consts_1.JSONTYPES.number:
                break;
        }
    });
    code.push('}');
}
exports.generate = generate;
