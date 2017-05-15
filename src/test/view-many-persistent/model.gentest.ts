
import * as fs from 'fs';
import * as path from 'path';
import * as assert from 'assert';
import * as mochaUtils from 'mocha';
import { classGenerator } from '../../index';


async function generateClasses() {
    let pathToModel = path.join(__dirname, 'schemas');
    await classGenerator(pathToModel, path.join(__dirname), '../../index');
}

describe('View Has Many', () => {
    it('Generate class code', function (done) {
        generateClasses().then(() => {
            done();
        }).catch((ex) => {
            done(ex);
        });
    });
});



