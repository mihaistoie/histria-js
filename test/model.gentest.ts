
import * as fs from 'fs';
import * as path from 'path';
import * as assert from 'assert';
import * as mochaUtils from 'mocha';
import { classGenerator } from '../../index';


async function generateModel() {
    let pathToModel = path.join(__dirname, 'model', 'schemas');
    await classGenerator(pathToModel, path.join(__dirname, 'model'), '../../../index');
}

describe('Generate Model', () => {
    it('Generate class code', function (done) {
        generateModel().then(() => {
            done();
        }).catch((ex) => {
            done(ex);
        });
    });
});


