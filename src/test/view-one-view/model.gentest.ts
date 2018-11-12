import * as path from 'path';
import { classGenerator } from '../../index';

async function userAndSalesorder() {
    const pathToModel = path.join(__dirname, 'schemas');
    await classGenerator(pathToModel, path.join(__dirname), '../../index');
}

describe('View Has One <View>', () => {
    it('View hasOne<View> class code', (done) => {
        userAndSalesorder().then(() => {
            done();
        }).catch((ex) => {
            done(ex);
        });
    });
});
