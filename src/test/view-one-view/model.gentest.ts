
import * as fs from 'fs';
import * as path from 'path';
import * as assert from 'assert';
import * as mochaUtils from 'mocha';
import { classGenerator } from '../../index';


async function userAndSalesorder() {
    let pathToModel = path.join(__dirname, 'schemas');
    await classGenerator(pathToModel, path.join(__dirname), '../../index');
}

describe('View.hasOne<View>', () => {
    it('View hasOne<View> class code', function (done) {
        userAndSalesorder().then(() => {
            done();
        }).catch((ex) => {
            done(ex);
        });
    });
});



