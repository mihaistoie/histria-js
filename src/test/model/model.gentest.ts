
import * as fs from 'fs';
import * as path from 'path';
import * as assert from 'assert';
import { classGenerator } from '../../index';

async function userAndSalesorder() {
    const pathToModel = path.join(__dirname, 'schemas');
    await classGenerator(pathToModel, path.join(__dirname), '../../index');
}

describe('Generators', () => {
    it('Generate class code', (done) => {
        userAndSalesorder().then(() => {
            done();
        }).catch((ex) => {
            done(ex);
        });
    });
});
