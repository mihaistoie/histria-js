
import * as fs from 'fs';
import * as path from 'path';
import * as assert from 'assert';
import { classGenerator } from '../../index';

async function userAndSalesorder() {
    const pathToModel = path.join(__dirname, 'model', 'schemas');
    await classGenerator(pathToModel, path.join(__dirname, 'model'), '../../../index');
}

describe('Generate model for generators', () => {
    it('Generate class code', (done) => {
        userAndSalesorder().then(() => {
            done();
        }).catch((ex) => {
            done(ex);
        });
    });
});
