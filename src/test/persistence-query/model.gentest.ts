
import * as fs from 'fs';
import * as path from 'path';
import * as assert from 'assert';
import { classGenerator } from '../../index';

async function generateClasses() {
    const pathToModel = path.join(__dirname, 'schemas');
    await classGenerator(pathToModel, path.join(__dirname), '../../index');
}

describe('Persistence Query', () => {
    it('Generate class code', (done) => {
        generateClasses().then(() => {
            done();
        }).catch((ex) => {
            done(ex);
        });
    });
});
