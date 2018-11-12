"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const index_1 = require("../../index");
async function userAndSalesorder() {
    const pathToModel = path.join(__dirname, 'model', 'schemas');
    await index_1.classGenerator(pathToModel, path.join(__dirname, 'model'), '../../../index');
}
describe('Generate model for generators', () => {
    it('Generate class code', (done) => {
        userAndSalesorder().then(() => {
            done();
        }).catch((ex) => {
            done(ex);
        });
    });
});

//# sourceMappingURL=model.gentest.js.map
