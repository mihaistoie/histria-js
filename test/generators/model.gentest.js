"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const index_1 = require("../../index");
async function userAndSalesorder() {
    let pathToModel = path.join(__dirname, 'model', 'schemas');
    await index_1.classGenerator(pathToModel, path.join(__dirname, 'model'), '../../../index');
}
describe('Generators', () => {
    it('Generate class code', function (done) {
        userAndSalesorder().then(() => {
            done();
        }).catch((ex) => {
            done(ex);
        });
    });
});
