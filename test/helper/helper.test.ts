
import * as assert from 'assert';
import * as mochaUtils from 'mocha';
import * as helper from '../../src/lib/utils/helper';


describe('Utils', () => {
    it('Merge', function () {
        let src = { type: 'object', properties: { country: { type: 'string' } } };
        let dst = { type: 'object'};
        helper.merge(src, dst);
        let excepted = { type: 'object', properties: { country: { type: 'string' } } };
        assert.deepEqual(dst, excepted);

    });

});