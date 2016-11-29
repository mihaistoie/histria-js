
import * as fs from 'fs';
import * as path from 'path';
import * as assert from 'assert';
import * as mochaUtils from 'mocha';
import * as gen from '../../src/lib/generators/classgen';


describe('Generators', () => {
    it('Generator multi file', function () {
        let employee: any = {
            type: 'object',
            nameSpace: 'employee',
            name: 'employee',
            properties: {
                firstName: {
                    title: 'First Name',
                    type: 'string'
                },
                lastName: {
                    title: 'Last Name',
                    type: 'string'
                },
                salary: {
                    title: 'Salary',
                    type: 'number'
                },
                address: { $ref: '#/definitions/address', name: 'address' }

            },
            definitions: {
                address: {
                    type: 'object',
                    properties: {
                        street: {
                            title: 'Street', 
                            type: "string" 
                        },
                        city: {
                            title: 'City', 
                            type: "string" 
                        },
                        province: {
                            title: 'Province', 
                            type: "string" 
                        },
                        postalCode: {
                            title: 'Postal Code', 
                            type: "string" 
                        },
                        country: {
                            title: 'Country', 
                            type: "string" 
                        }
                    }
                },
                string: { type: "string" }
            }
        };


        //let code = [];
        
        //gen.generate(code, employee, 'Employee', 'Instance', '../../../src/index');
        //fs.writeFileSync(path.join(__dirname, 'model', 'salesorder.ts'), code.join('\n'))

    });

});