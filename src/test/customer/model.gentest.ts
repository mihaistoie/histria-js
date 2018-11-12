
import * as fs from 'fs';
import * as path from 'path';
import * as assert from 'assert';
import { classGenerator } from '../../index';

async function customer() {
    const pathToModel = path.join(__dirname, 'schemas');
    await classGenerator(pathToModel, path.join(__dirname), '../../index');
}

describe('View Has One <View>', () => {
    it('Generate Customer class code', (done) => {
        customer().then(() => {
            done();
        }).catch((ex) => {
            done(ex);
        });
    });
});
