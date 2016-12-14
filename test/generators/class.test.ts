
import * as fs from 'fs';
import * as path from 'path';
import * as assert from 'assert';
import * as mochaUtils from 'mocha';
import * as gen from '../../src/lib/generators/classgen';
import * as schemaUtils from '../../src/lib/schema/schema-utils';


async function userAndSalesorder() {
    let pathToModel = path.join(__dirname, 'model', 'schemas');
    let model: any = {};
    await schemaUtils.loadModel(pathToModel, model);

    let code: any = {};
    gen.generate(code, model, 'Instance', '../../../src/index');
    Object.keys(code).forEach(name => {
        fs.writeFileSync(path.join(__dirname, 'model', name + '.ts'), code[name].code.join('\n'))
    });

}

describe('Generators', () => {

    it('Merge', function (done) {
        userAndSalesorder().then(() => {
            done();
        }).catch((ex) => {
            done(ex);
        });


    });

});



