
import * as path from 'path';
import { classGenerator } from '../../index';

async function generateClasses() {
    const pathToModel = path.join(__dirname, 'schemas');
    await classGenerator(pathToModel, path.join(__dirname), '../../index');
}

describe('View Has Many', () => {
    it('Generate class code', (done) => {
        generateClasses().then(() => {
            done();
        }).catch((ex) => {
            done(ex);
        });
    });
});
