"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const index_1 = require("../../index");
async function userAndSalesorder() {
    const pathToModel = path.join(__dirname, 'schemas');
    await index_1.classGenerator(pathToModel, path.join(__dirname), '../../index');
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

//# sourceMappingURL=model.gentest.js.map
