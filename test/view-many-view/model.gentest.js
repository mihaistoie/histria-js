"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const index_1 = require("../../index");
async function generateClasses() {
    let pathToModel = path.join(__dirname, 'schemas');
    await index_1.classGenerator(pathToModel, path.join(__dirname), '../../index');
}
describe('View Has Many <View>', () => {
    it('Generate class code', function (done) {
        generateClasses().then(() => {
            done();
        }).catch((ex) => {
            done(ex);
        });
    });
});

//# sourceMappingURL=model.gentest.js.map
