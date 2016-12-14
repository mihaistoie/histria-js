
import * as fs from 'fs';
import * as path from 'path';
import * as assert from 'assert';
import * as mochaUtils from 'mocha';

import * as hu from '../../src/index';
import * as gen from '../../src/lib/generators/classgen';


async function multiFileTest() {
    let data = await hu.fs.readFile(path.join(__dirname, '..', 'data', 'employee.json'));
    let employee = JSON.parse(data.toString());

}

describe('Generators', () => {
    it('Generator multi file', function (done) {
        multiFileTest().then(function () {
            done();
        }).catch(function (ex) {
            done(ex);
        })


        //let code = [];

        //gen.generate(code, employee, 'Employee', 'Instance', '../../../src/index');
        //fs.writeFileSync(path.join(__dirname, 'model', 'salesorder.ts'), code.join('\n'))

    });

});