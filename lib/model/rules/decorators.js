"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const histria_utils_1 = require("histria-utils");
const model_manager_1 = require("../model-manager");
const interfaces_1 = require("../interfaces");
// Title decorator
// Allow title add a title && an description
function title(targetClass, title, description) {
    return function (target, propertyKey, descriptor) {
        let mm = model_manager_1.modelManager();
        mm.setTitle(targetClass, target[propertyKey], title, description);
    };
}
exports.title = title;
// Decorator  for propChanged
function propChanged(targetClass, ...properties) {
    return function (target, propertyKey, descriptor) {
        let mm = model_manager_1.modelManager();
        mm.addRule(targetClass, interfaces_1.EventType.propChanged, target[propertyKey], properties);
    };
}
exports.propChanged = propChanged;
// Decorators for composition list
function addItem(targetClass, propertyName) {
    return function (target, propertyKey, descriptor) {
        let mm = model_manager_1.modelManager();
        mm.addRule(targetClass, interfaces_1.EventType.addItem, target[propertyKey], [propertyName]);
    };
}
exports.addItem = addItem;
function rmvItem(targetClass, propertyName) {
    return function (target, propertyKey, descriptor) {
        let mm = model_manager_1.modelManager();
        mm.addRule(targetClass, interfaces_1.EventType.removeItem, target[propertyKey], [propertyName]);
    };
}
exports.rmvItem = rmvItem;
function setItems(targetClass, propertyName) {
    return function (target, propertyKey, descriptor) {
        let mm = model_manager_1.modelManager();
        mm.addRule(targetClass, interfaces_1.EventType.setItems, target[propertyKey], [propertyName]);
    };
}
exports.setItems = setItems;
// Decorator for validate
function validate(targetClass, ...properties) {
    return function (target, propertyKey, descriptor) {
        let mm = model_manager_1.modelManager();
        mm.addValidateRule(targetClass, target[propertyKey], properties);
    };
}
exports.validate = validate;
// Decorator for init
function init(targetClass) {
    return function (target, propertyKey, descriptor) {
        let mm = model_manager_1.modelManager();
        mm.addRule(targetClass, interfaces_1.EventType.init, target[propertyKey]);
    };
}
exports.init = init;
const module_holder = {};
// Load rules from folder
async function loadRules(folder) {
    let files = await histria_utils_1.fs.readdir(folder);
    let stats;
    let folders = [];
    stats = await Promise.all(files.map((fileName) => {
        let fn = path.join(folder, fileName);
        return histria_utils_1.fs.lstat(fn);
    }));
    stats.forEach((stat, index) => {
        let fn = path.join(folder, files[index]);
        if (stat.isDirectory()) {
            folders.push(loadRules(fn));
        }
        else if (path.extname(fn) === '.js') {
            require(fn);
        }
    });
    if (folders.length)
        await Promise.all(folders);
}
exports.loadRules = loadRules;
