"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const index_1 = require("../../index");
async function customer() {
    const pathToModel = path.join(__dirname, 'schemas');
    await index_1.classGenerator(pathToModel, path.join(__dirname), '../../index');
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

//# sourceMappingURL=model.gentest.js.map
