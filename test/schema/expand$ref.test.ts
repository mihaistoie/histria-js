
import * as mocha from 'mocha';
import * as assert from 'power-assert';
import * as schemaUtils from '../../src/schema/schema-utils';

describe('Expand Schema $ref', () => {
    it('Extract indexes', function () {
        let model = {};
        let schema = {
            properties: {
                name: { $ref: '/definitions/#string' },
                address: { $ref: '/definitions/#address' }
            },
            definitions: {
                address: {
                    type: "object",
                    properties: {
                        country: { type: "string" }
                    }
                },
                string: { type: "string" }
            }
        };

        let excepted = {
            properties: {
                name: { type: "string" },
                address: {
                    type: "object",
                    properties: {
                        country: { type: "string" }
                    }
                }
            },
            definitions: {
                address: {
                    type: "object",
                    properties: {
                        country: { type: "string" }
                    }
                },
                string: { type: "string" }
            }
        };
        schemaUtils.expandSchema(schema, null);
        assert.deepEqual(excepted, schema);

    });

});