"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const index_1 = require("../../index");
async function generateClasses() {
    const pathToModel = path.join(__dirname, 'schemas');
    await index_1.classGenerator(pathToModel, path.join(__dirname), '../../index');
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

//# sourceMappingURL=model.gentest.js.map
