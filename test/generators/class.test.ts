
import * as fs from 'fs';
import * as path from 'path';
import * as assert from 'assert';
import * as mochaUtils from 'mocha';
import * as gen from '../../src/lib/generators/classgen';


describe('Generators', () => {
    it('Merge', function () {
        let schema: any = {
            "type": "object",
            "nameSpace": "users",
            "properties": {
                "age": {
                    "title": "Age",
                    "type": "integer"
                },
                "firstName": {
                    "title": "First Name",
                    "type": "string"
                },
                "lastName": {
                    "title": "Last Name",
                    "type": "string"
                },
                "fullName": {
                    "title": "Full Name",
                    "type": "string"
                }

            },
            "states": {
                "firstName": {
                    "isMandatory": true
                },
                "fullName": {
                    "isReadOnly": true
                }
            }
        };


        let code = [];
        gen.generate(code, schema, 'User', 'Instance');
        fs.writeFileSync(path.join(__dirname, 'model', 'user.ts'), code.join('\n'))
        schema = {
            "type": "object",
            "nameSpace": "salesorder",
            "properties": {
                "netAmount": {
                    "title": "Net Amount (excluding VAT)",
                    "type": "number"
                },
                "vat": {
                    "title": "VAT",
                    "type": "number"
                },
                "grossAmount": {
                    "title": "Gross Amount (including VAT)",
                    "type": "number"
                }
            },
            states: {
                "netAmount": {
                    "decimals": 2
                },
                "vat": {
                    "decimals": 2
                },
                "grossAmount": {
                    "decimals": 2
                }

            }
        };


        code = [];
        gen.generate(code, schema, 'SalesOrder', 'Instance');
        fs.writeFileSync(path.join(__dirname, 'model', 'salesorder.ts'), code.join('\n'))

    });

});