
import * as fs from 'fs';
import * as path from 'path';
import * as assert from 'assert';
import { classGenerator } from '../../index';

async function generateModel() {
    const pathToModel = path.join(__dirname, 'model', 'schemas');
    await classGenerator(pathToModel, path.join(__dirname, 'model'), '../../../index');
}

describe('Generate Model', () => {
    it('Generate class code', (done) => {
        generateModel().then(() => {
            done();
        }).catch((ex) => {
            done(ex);
        });
    });
});
