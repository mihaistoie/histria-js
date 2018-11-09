"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const index_1 = require("../../index");
async function generateModel() {
    let pathToModel = path.join(__dirname, 'model', 'schemas');
    await index_1.classGenerator(pathToModel, path.join(__dirname, 'model'), '../../../index');
}
describe('Generate Model for cyclic references', () => {
    it('Generate class code', function (done) {
        generateModel().then(() => {
            done();
        }).catch((ex) => {
            done(ex);
        });
    });
});

//# sourceMappingURL=model.gentest.js.map
