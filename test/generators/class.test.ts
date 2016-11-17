
import * as assert from 'assert';
import * as mochaUtils from 'mocha';
import * as gen from '../../src/lib/generators/classgen';


describe('Generators', () => {
    it('Merge', function () {
        let schema = {
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
        console.log(code.join('\n'))

    });

});