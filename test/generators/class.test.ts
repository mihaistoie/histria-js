
import * as assert from 'assert';
import * as mochaUtils from 'mocha';
import * as gen from '../../src/lib/generators/classgen';


describe('Generators', () => {
    it('Merge', function () {
        let schema = { nameSpace: "Tiers",  type: 'object', properties: { country: { type: 'string' } } };
        let code = [];
        gen.generate(code, schema, 'Address', 'Instance');
        //console.log(code.join('\n'))

    });

});