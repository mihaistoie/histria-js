"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const path = require('path');
const promises = require('../utils/promises');
const model_manager_1 = require('./model-manager');
const consts_1 = require('../consts/consts');
//decorator for propChanged
function propChanged(targetClass, ...properties) {
    return function (target, propertyKey, descriptor) {
        let mm = new model_manager_1.ModelManager();
        mm.addRule(targetClass, consts_1.RULE_TRIGGERS.PROP_CHANGED, target[propertyKey], properties);
    };
}
exports.propChanged = propChanged;
//decorator for init
function init(targetClass) {
    let mm = new model_manager_1.ModelManager();
    return function (target, propertyKey, descriptor) {
        let mm = new model_manager_1.ModelManager();
        mm.addRule(targetClass, consts_1.RULE_TRIGGERS.INIT, target[propertyKey]);
    };
}
exports.init = init;
var module_holder = {};
// load rules from folder
function loadRules(folder) {
    return __awaiter(this, void 0, void 0, function* () {
        let files = yield promises.fs.readdir(folder);
        let stats;
        let folders = [];
        stats = yield Promise.all(files.map((fileName) => {
            let fn = path.join(folder, fileName);
            return promises.fs.lstat(fn);
        }));
        stats.forEach((stat, index) => {
            let fn = path.join(folder, files[index]);
            if (stat.isDirectory())
                folders.push(loadRules(fn));
            else if (path.extname(fn) === '.js') {
                require(folder)(module_holder);
            }
        });
        if (folders.length)
            yield Promise.all(folders);
    });
}
exports.loadRules = loadRules;
