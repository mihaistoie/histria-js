"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const index_1 = require("../../index");
async function generateModel() {
    const pathToModel = path.join(__dirname, 'model', 'schemas');
    await index_1.classGenerator(pathToModel, path.join(__dirname, 'model'), '../../../index');
}
describe('Generate Model', () => {
    it('Generate class code', (done) => {
        generateModel().then(() => {
            done();
        }).catch((ex) => {
            done(ex);
        });
    });
});

//# sourceMappingURL=model.gentest.js.map
